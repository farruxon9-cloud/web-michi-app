import { describe, it, vi, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import DriverFeed from './DriverFeed';

vi.mock('leaflet', () => ({
  default: {
    map: () => ({
      setView: vi.fn(),
      fitBounds: vi.fn(),
      panTo: vi.fn(),
      remove: vi.fn(),
      invalidateSize: vi.fn()
    }),
    tileLayer: () => ({
      addTo: vi.fn()
    }),
    layerGroup: () => ({
      addTo: vi.fn(),
      clearLayers: vi.fn(),
      addLayer: vi.fn()
    }),
    divIcon: vi.fn(),
    marker: () => ({
      on: vi.fn(),
      addTo: vi.fn()
    })
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { language: 'uz', changeLanguage: () => Promise.resolve() }
  })
}));

describe('DriverFeed Component Render', () => {
  it('renders successfully with default empty lists', () => {
    const html = renderToString(
      <DriverFeed 
        jobs={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
        applications={[]} 
      />
    );
    expect(html).toContain('feed-container');
  });

  it('renders successfully with mock data props', () => {
    const mockJobs = [
      {
        id: 99,
        company: 'Test Sagawa',
        title: 'Delivery Driver',
        salary: '¥300,000 / oyiga',
        type: 'fulltime',
        location: 'Tokyo',
        fullAddress: 'Tokyo Address',
        logo: 'https://ui-avatars.com/api/?name=Test',
        verified: true
      }
    ];
    const html = renderToString(
      <DriverFeed 
        jobs={mockJobs} 
        verifiedCompanies={['Test Sagawa']} 
        isContractActive={true} 
        applications={[]} 
      />
    );
    expect(html).toContain('Test Sagawa');
  });

  it('renders 92px compact trailing dock clearance spacer', () => {
    const html = renderToString(
      <DriverFeed 
        jobs={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
        applications={[]} 
      />
    );
    expect(html).toContain('height:92px');
  });
});
