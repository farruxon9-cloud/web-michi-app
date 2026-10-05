import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('leaflet', () => ({
  default: {
    map: () => ({ setView: vi.fn(), fitBounds: vi.fn(), panTo: vi.fn(), remove: vi.fn(), invalidateSize: vi.fn() }),
    tileLayer: () => ({ addTo: vi.fn() }),
    layerGroup: () => ({ addTo: vi.fn(), clearLayers: vi.fn(), addLayer: vi.fn() }),
    divIcon: vi.fn(),
    marker: () => ({ on: vi.fn(), addTo: vi.fn() }),
  },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
    i18n: { language: 'ja', changeLanguage: () => Promise.resolve() },
  }),
}));

import DriverFeed, { MOCK_JOBS } from './DriverFeed';

afterEach(() => cleanup());

const job = (id, company, verified, extra = {}) => ({
  id, company, title: `Job ${id}`, salary: '', location: 'Tokyo', type: 'fulltime', logo: '', image: '', verified, ...extra,
});

describe('DriverFeed ⭐ verified companies', () => {
  it('sample jobs never carry the ⭐', () => {
    expect(MOCK_JOBS.some((j) => j.verified === true)).toBe(false);
  });

  it('shows the badge only next to server-verified companies and filters with the toggle', () => {
    const jobs = [job('1', 'Verified Co', true, { verifiedAt: '2026-04-01T00:00:00' }), job('2', 'Plain Co', false)];
    render(<DriverFeed jobs={jobs} onJobClick={() => {}} userRole="driver" profileData={{}} />);
    expect(screen.getByText('Verified Co')).toBeTruthy();
    expect(screen.getByText('Plain Co')).toBeTruthy();
    // one badge inside the toggle + one next to the verified company
    expect(screen.getAllByTestId('verified-badge')).toHaveLength(2);

    const toggle = document.getElementById('verified-only-toggle');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Verified Co')).toBeTruthy();
    expect(screen.queryByText('Plain Co')).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByText('Plain Co')).toBeTruthy();
  });
});
