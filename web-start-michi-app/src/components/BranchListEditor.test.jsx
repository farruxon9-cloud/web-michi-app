import { describe, it, expect, vi, afterEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BranchListEditor from './BranchListEditor';

vi.mock('../utils/japaneseZipcodeLookup', () => ({
  lookupJapaneseZipcode: vi.fn(async () => ({ success: false })),
}));

afterEach(cleanup);

function Harness({ onChangeSpy, initial = [] }) {
  const [branches, setBranches] = useState(initial);
  return (
    <BranchListEditor
      branches={branches}
      onChange={(next) => { onChangeSpy(next); setBranches(next); }}
    />
  );
}

const type = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });

describe('BranchListEditor (支店・営業所)', () => {
  it('shows the Japanese explanation for multi-branch hiring', () => {
    render(<Harness onChangeSpy={() => {}} />);
    expect(screen.getByText(/求職者は応募時に希望の勤務地を選べます/)).toBeTruthy();
  });

  it('blocks saving an incomplete branch and shows field errors', () => {
    const spy = vi.fn();
    render(<Harness onChangeSpy={spy} />);
    fireEvent.click(document.getElementById('branch-add-btn'));
    fireEvent.click(document.getElementById('branch-save-btn'));
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByText('支店・営業所名を入力してください')).toBeTruthy();
    expect(screen.getByText('電話番号を入力してください')).toBeTruthy();
  });

  it('adds a valid branch with a stable id and hidden phone flag', () => {
    const spy = vi.fn();
    render(<Harness onChangeSpy={spy} />);
    fireEvent.click(document.getElementById('branch-add-btn'));
    type('branch-name', '横浜営業所');
    type('branch-postalCode', '231-0001');
    fireEvent.change(document.getElementById('branch-prefecture'), { target: { value: 'Kanagawa' } });
    type('branch-city', '横浜市中区');
    type('branch-town', '新港1-2-3');
    type('branch-phone', '045-123-4567');
    fireEvent.click(document.getElementById('branch-phonePublic')); // make phone private
    type('branch-walkMinutes', '5');
    type('branch-headcount', '3');
    fireEvent.click(document.getElementById('branch-save-btn'));

    expect(spy).toHaveBeenCalledTimes(1);
    const [saved] = spy.mock.calls[0][0];
    expect(saved).toMatchObject({
      name: '横浜営業所',
      prefecture: 'Kanagawa',
      phone: '045-123-4567', // company keeps the number
      phonePublic: false,
      walkMinutes: 5,
      headcount: 3,
    });
    expect(saved.id).toMatch(/^br_/);
    expect(screen.getByText('横浜営業所')).toBeTruthy();
  });

  it('keeps the id when editing an existing branch', () => {
    const spy = vi.fn();
    const initial = [{ id: 'br_keep', name: '旧', postalCode: '231-0001', prefecture: 'Kanagawa', city: '横浜市', town: '1-1', phone: '045-000-0000', phonePublic: true }];
    render(<Harness onChangeSpy={spy} initial={initial} />);
    fireEvent.click(screen.getByLabelText('編集'));
    type('branch-name', '新');
    fireEvent.click(document.getElementById('branch-save-btn'));
    expect(spy.mock.calls[0][0]).toHaveLength(1);
    expect(spy.mock.calls[0][0][0]).toMatchObject({ id: 'br_keep', name: '新' });
  });
});
