import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConfirmSheet from './ConfirmSheet';
import { UndoToast, SelectionBar } from './UndoToast';

describe('ConfirmSheet', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmSheet open={false} title="T" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls confirm / cancel', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmSheet open title="Hide?" message="msg" confirmLabel="非表示" cancelLabel="キャンセル" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByText('非表示'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('キャンセル'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onCancel = vi.fn();
    render(<ConfirmSheet open title="x" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('UndoToast', () => {
  afterEach(() => vi.useRealTimers());

  it('auto-closes after the duration and supports undo', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onAction = vi.fn();
    render(<UndoToast open toastKey={1} message="非表示にしました" actionLabel="元に戻す" onAction={onAction} onClose={onClose} duration={5000} />);
    fireEvent.click(screen.getByText('元に戻す'));
    expect(onAction).toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(4999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('SelectionBar', () => {
  it('disables the action with zero selected', () => {
    const onAction = vi.fn();
    const { rerender } = render(<SelectionBar open count={0} actionLabel="非表示" cancelLabel="キャンセル" onAction={onAction} onCancel={() => {}} />);
    const btn = screen.getByText('非表示 (0)');
    expect(btn.disabled).toBe(true);
    rerender(<SelectionBar open count={2} actionLabel="非表示" cancelLabel="キャンセル" onAction={onAction} onCancel={() => {}} />);
    fireEvent.click(screen.getByText('非表示 (2)'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
