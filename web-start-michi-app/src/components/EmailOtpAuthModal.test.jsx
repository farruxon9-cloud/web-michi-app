import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailOtpAuthModal from './EmailOtpAuthModal';
import { sendEmailOtpViaN8n } from '../services/n8nEmailOtpService';

vi.mock('../services/n8nEmailOtpService', async () => {
  const actual = await vi.importActual('../services/n8nEmailOtpService');
  return {
    ...actual,
    sendEmailOtpViaN8n: vi.fn(),
    verifyEmailOtpCodeViaN8n: vi.fn()
  };
});

describe('EmailOtpAuthModal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call updated sendEmailOtpViaN8n when send button is clicked', async () => {
    sendEmailOtpViaN8n.mockResolvedValueOnce({
      success: true,
      message: 'Tasdiqlash kodi pochtangizga yuborildi',
      sessionId: 'sess_test_123',
      cooldownSeconds: 60
    });

    render(
      <EmailOtpAuthModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const emailInput = screen.getByPlaceholderText('masalan: user@example.com');
    fireEvent.change(emailInput, { target: { value: 'testuser@michi.jp' } });

    const submitBtn = screen.getByText('Tasdiqlash kodini yuborish').closest('button');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(sendEmailOtpViaN8n).toHaveBeenCalledTimes(1);
      expect(sendEmailOtpViaN8n).toHaveBeenCalledWith('testuser@michi.jp');
    });
  });
});
