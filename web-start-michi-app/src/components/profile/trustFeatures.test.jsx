import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'ja' } }),
}));

const api = vi.hoisted(() => ({
  getMyVerification: vi.fn(),
  requestMyVerification: vi.fn(),
  getMyLicense: vi.fn(),
  submitMyLicense: vi.fn(),
  listMyTickets: vi.fn(),
  getTicket: vi.fn(),
  createTicket: vi.fn(),
  replyTicket: vi.fn(),
  closeTicket: vi.fn(),
  requestAccountDeletion: vi.fn(),
  cancelAccountDeletion: vi.fn(),
}));
vi.mock('../../services/accountApi', () => ({
  ...api,
  isNotDeployed: (err) => Boolean(err && err.status === 404),
}));

import VerificationCard from './VerificationCard';
import SupportPage from './SupportPage';
import DriverLicenseCard from './DriverLicenseCard';
import { DeletionBanner, DeleteAccountSection } from './AccountDeletion';
import VerifiedBadge from '../VerifiedBadge';

const t = (key) => key;
const err = (status, data = {}) => Object.assign(new Error('x'), { status, code: data.code, data });

beforeEach(() => { Object.values(api).forEach((fn) => fn.mockReset()); });
afterEach(() => cleanup());

describe('VerifiedBadge', () => {
  it('has a tooltip with the verified month', () => {
    render(<VerifiedBadge verifiedAt="2026-03-15T00:00:00" />);
    const badge = screen.getByTestId('verified-badge');
    expect(badge.getAttribute('title')).toBe('verifiedByMichiAt');
  });
});

describe('VerificationCard', () => {
  it('shows the checklist with fix buttons and no request button when not eligible', async () => {
    api.getMyVerification.mockResolvedValue({ status: 'none', eligible: false, missing: ['phone', 'listing'] });
    const onOpenPage = vi.fn();
    render(<VerificationCard t={t} user={{ verification: { status: 'none' } }} onOpenPage={onOpenPage} />);
    await waitFor(() => expect(screen.getByTestId('verify-item-phone')).toBeTruthy());
    expect(screen.queryByText('verifyGetBadge')).toBeNull();
    fireEvent.click(document.getElementById('verify-fix-listing'));
    expect(onOpenPage).toHaveBeenCalledWith('my_ads');
    fireEvent.click(document.getElementById('verify-fix-phone'));
    expect(onOpenPage).toHaveBeenCalledWith('personalInfo');
    expect(screen.getByTestId('verify-item-companyName').className).toContain('done');
  });

  it('requests the badge when eligible and switches to pending', async () => {
    api.getMyVerification.mockResolvedValue({ status: 'none', eligible: true, missing: [] });
    api.requestMyVerification.mockResolvedValue({ success: true, verification: { status: 'pending', eligible: true, missing: [] } });
    const refreshUser = vi.fn();
    render(<VerificationCard t={t} user={{}} refreshUser={refreshUser} />);
    const btn = await screen.findByText('verifyGetBadge');
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByTestId('verification-status').textContent).toBe('verifyStatus_pending'));
    expect(refreshUser).toHaveBeenCalled();
    expect(screen.queryByText('verifyGetBadge')).toBeNull();
  });

  it('handles 422 NOT_ELIGIBLE by showing the missing items', async () => {
    api.getMyVerification.mockResolvedValue({ status: 'none', eligible: true, missing: [] });
    api.requestMyVerification.mockRejectedValue(err(422, { code: 'NOT_ELIGIBLE', missing: ['address'] }));
    render(<VerificationCard t={t} user={{}} />);
    fireEvent.click(await screen.findByText('verifyGetBadge'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('verifyNotEligible'));
    expect(screen.getByTestId('verify-item-address').className).toContain('todo');
  });

  it('handles 429 COOLDOWN and hides the button', async () => {
    api.getMyVerification.mockResolvedValue({ status: 'rejected', eligible: true, missing: [], note: 'name mismatch' });
    api.requestMyVerification.mockRejectedValue(err(429, { code: 'COOLDOWN', retryAt: '2999-01-01T00:00:00Z' }));
    render(<VerificationCard t={t} user={{}} />);
    expect(await screen.findByText(/name mismatch/)).toBeTruthy();
    fireEvent.click(screen.getByText('verifyRequestAgain'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('verifyCooldown'));
    expect(screen.queryByText('verifyRequestAgain')).toBeNull();
  });

  it('shows verified state with expiry and falls back to user.verification on 404', async () => {
    api.getMyVerification.mockRejectedValue(err(404));
    render(<VerificationCard t={t} user={{ verification: { status: 'verified', verifiedAt: '2026-01-01', expiresAt: '2999-01-01' } }} />);
    await waitFor(() => expect(api.getMyVerification).toHaveBeenCalled());
    expect(screen.getByTestId('verification-status').textContent).toBe('verifyStatus_verified');
    expect(screen.getByText('verifyValidUntil')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('SupportPage', () => {
  it('shows "coming soon" when the endpoint is not deployed', async () => {
    api.listMyTickets.mockRejectedValue(err(404));
    render(<SupportPage t={t} handleBackToMain={() => {}} />);
    expect(await screen.findByText('supportUnavailable')).toBeTruthy();
  });

  it('lists tickets, opens a thread, replies and closes', async () => {
    api.listMyTickets.mockResolvedValue([{ id: 'tkt_1', subject: 'Login issue', status: 'answered', category: 'account', updatedAt: '2026-10-01T00:00:00Z' }]);
    api.getTicket.mockResolvedValue({ id: 'tkt_1', subject: 'Login issue', status: 'answered', category: 'account', messages: [{ from: 'user', body: 'Help', at: '2026-10-01T00:00:00Z' }, { from: 'admin', body: 'Try again', at: '2026-10-02T00:00:00Z' }] });
    api.replyTicket.mockResolvedValue({ id: 'tkt_1', subject: 'Login issue', status: 'open', category: 'account', messages: [{ from: 'user', body: 'Help', at: '1' }, { from: 'admin', body: 'Try again', at: '2' }, { from: 'user', body: 'Works', at: '3' }] });
    api.closeTicket.mockResolvedValue({ id: 'tkt_1', subject: 'Login issue', status: 'closed', category: 'account', messages: [] });
    render(<SupportPage t={t} handleBackToMain={() => {}} />);
    fireEvent.click(await screen.findByText('Login issue'));
    expect(await screen.findByText('Try again')).toBeTruthy();
    fireEvent.change(document.getElementById('support-reply'), { target: { value: 'Works' } });
    fireEvent.click(document.getElementById('support-reply-send'));
    expect(await screen.findByText('Works')).toBeTruthy();
    expect(api.replyTicket).toHaveBeenCalledWith('tkt_1', 'Works');
    fireEvent.click(document.getElementById('support-close'));
    expect(await screen.findByText('supportClosedNote')).toBeTruthy();
  });

  it('validates and creates a ticket', async () => {
    api.listMyTickets.mockResolvedValue([]);
    api.createTicket.mockResolvedValue({ id: 'tkt_2', subject: 'S', status: 'open', category: 'bug', messages: [{ from: 'user', body: 'B', at: '1' }] });
    render(<SupportPage t={t} handleBackToMain={() => {}} />);
    fireEvent.click(await screen.findByText('supportNewTicket'));
    fireEvent.click(document.getElementById('support-submit'));
    expect(screen.getAllByText('supportFieldRequired').length).toBe(2);
    expect(api.createTicket).not.toHaveBeenCalled();
    fireEvent.change(document.getElementById('support-subject'), { target: { value: 'S' } });
    fireEvent.change(document.getElementById('support-category'), { target: { value: 'bug' } });
    fireEvent.change(document.getElementById('support-message'), { target: { value: 'B' } });
    fireEvent.click(document.getElementById('support-submit'));
    await waitFor(() => expect(api.createTicket).toHaveBeenCalledWith({ subject: 'S', category: 'bug', body: 'B' }));
  });
});

describe('DriverLicenseCard', () => {
  it('renders nothing when the endpoint is not deployed', async () => {
    api.getMyLicense.mockRejectedValue(err(404));
    const { container } = render(<DriverLicenseCard t={t} />);
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });

  it('shows the status chip and Japanese type name', async () => {
    api.getMyLicense.mockResolvedValue({ license: { type: 'ogata', expiresAt: '2999-05-01', status: 'verified' } });
    render(<DriverLicenseCard t={t} />);
    await waitFor(() => expect(screen.getByTestId('license-status').textContent).toBe('licenseStatus_verified'));
    expect(screen.getByText('大型')).toBeTruthy();
  });

  it('shows the form with all 9 types when nothing was submitted', async () => {
    api.getMyLicense.mockResolvedValue({ license: null });
    render(<DriverLicenseCard t={t} />);
    await waitFor(() => expect(document.getElementById('license-type-select')).toBeTruthy());
    expect(document.querySelectorAll('#license-type-select option').length).toBe(10);
    fireEvent.click(document.getElementById('license-submit-btn'));
    expect(screen.getByRole('alert').textContent).toBe('licenseFormIncomplete');
  });
});

describe('Account deletion', () => {
  it('banner shows when deletion is scheduled and cancels', async () => {
    api.cancelAccountDeletion.mockResolvedValue({ success: true });
    const refreshUser = vi.fn();
    render(<DeletionBanner t={t} user={{ deletion: { deleteAt: '2026-11-04T00:00:00Z' } }} refreshUser={refreshUser} />);
    fireEvent.click(document.getElementById('deletion-cancel-btn'));
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });

  it('banner is hidden without a scheduled deletion', () => {
    const { container } = render(<DeletionBanner t={t} user={{}} />);
    expect(container.innerHTML).toBe('');
  });

  it('settings section confirms before requesting deletion', async () => {
    api.requestAccountDeletion.mockResolvedValue({ success: true });
    render(<DeleteAccountSection t={t} user={{ id: 'u1' }} refreshUser={vi.fn()} />);
    fireEvent.click(document.getElementById('delete-account-btn'));
    expect(api.requestAccountDeletion).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getAllByText('deleteAccountBtn').pop());
    await waitFor(() => expect(api.requestAccountDeletion).toHaveBeenCalled());
  });
});
