import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import JobDetail from './JobDetail';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback, opts) => {
      const s = String(typeof fallback === 'string' ? fallback : (key ?? ''));
      return s.replace(/{{(\w+)}}/g, (_, n) => (opts && opts[n] != null ? opts[n] : ''));
    },
    i18n: { language: 'ja' },
  }),
}));

afterEach(cleanup);

const baseJob = {
  id: 'job1',
  title: '大型ドライバー',
  company: 'みち運輸',
  salary: '¥300,000',
  hiringScope: 'branch',
  branches: [
    { id: 'b1', name: '横浜営業所', postalCode: '231-0001', prefecture: 'Kanagawa', city: '横浜市中区', town: '新港1-2-3', phone: '045-123-4567', phonePublic: true, nearestStation: '関内駅', walkMinutes: 5, headcount: 3 },
    { id: 'b2', name: '川崎支店', postalCode: '210-0001', prefecture: 'Kanagawa', city: '川崎市川崎区', town: '本町1-1', phone: '', phonePublic: false },
  ],
};

const renderDetail = (job, props = {}) =>
  render(
    <JobDetail
      job={job}
      onBack={() => {}}
      onApply={props.onApply || (() => {})}
      onShoukai={() => {}}
      onToggleSave={() => {}}
      applications={props.applications || []}
      profileData={{}}
      userRole="driver"
    />
  );

describe('JobDetail — branches (支店・営業所)', () => {
  it('shows each branch with address, station, headcount and phone', () => {
    renderDetail(baseJob);
    expect(screen.getByText('横浜営業所')).toBeTruthy();
    expect(screen.getByText('〒231-0001 神奈川県 横浜市中区 新港1-2-3')).toBeTruthy();
    expect(screen.getByText('関内駅 徒歩5分')).toBeTruthy();
    expect(screen.getByText('募集3名')).toBeTruthy();
    const tel = screen.getByText('045-123-4567');
    expect(tel.closest('a').getAttribute('href')).toBe('tel:0451234567');
  });

  it('shows 面接時にお知らせします when the branch phone is hidden — never blank', () => {
    renderDetail(baseJob);
    expect(screen.getByTestId('branch-phone-hidden').textContent).toBe('面接時にお知らせします');
  });

  it('opens a picker and applies to exactly one selected branch', () => {
    const onApply = vi.fn();
    renderDetail(baseJob, { onApply });
    fireEvent.click(document.getElementById('job-apply-btn'));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByText('希望する勤務地を選択してください')).toBeTruthy();

    const confirm = document.getElementById('branch-pick-confirm');
    expect(confirm.disabled).toBe(true);

    fireEvent.click(document.getElementById('branch-pick-b2'));
    fireEvent.click(confirm);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(baseJob, { branchId: 'b2', branchName: '川崎支店' });
  });

  it('applies directly when the job is not branch-scoped', () => {
    const onApply = vi.fn();
    const job = { ...baseJob, hiringScope: 'headquarters', branches: [] };
    renderDetail(job, { onApply });
    fireEvent.click(document.getElementById('job-apply-btn'));
    expect(onApply).toHaveBeenCalledWith(job);
  });

  it('shows the branch the user applied to', () => {
    renderDetail(baseJob, { applications: [{ jobId: 'job1', branchId: 'b1', status: 'submitted' }] });
    expect(screen.getByText(/応募先：横浜営業所/)).toBeTruthy();
  });

  it('never renders a fake tel: number when the job has no phone', () => {
    renderDetail({ ...baseJob, phone: '' });
    const fake = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href'));
    expect(fake).not.toContain('tel:090-1234-5678');
    expect(fake).not.toContain('tel:03-1234-5678');
  });
});
