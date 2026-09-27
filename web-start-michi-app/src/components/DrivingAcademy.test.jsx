import { describe, it, vi, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import DrivingAcademy from './DrivingAcademy';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { language: 'uz', changeLanguage: () => Promise.resolve() }
  })
}));

describe('DrivingAcademy Component Render', () => {
  it('renders successfully with default empty lists', () => {
    const html = renderToString(
      <DrivingAcademy 
        schools={[]} 
        schoolApplications={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
      />
    );
    expect(html).toContain('feed-container');
  });

  it('renders successfully with mock school data', () => {
    const mockSchools = [
      {
        id: 99,
        name: 'Koyama Academy',
        type: 'Driving School',
        price: '¥250,000',
        location: 'Tokyo',
        image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800',
        shoukaiFee: 10000
      }
    ];
    const html = renderToString(
      <DrivingAcademy 
        schools={mockSchools} 
        schoolApplications={[]} 
        verifiedCompanies={['Koyama Academy']} 
        isContractActive={true} 
      />
    );
    expect(html).toContain('Koyama Academy');
  });

  it('contains filter search trigger button', () => {
    const html = renderToString(
      <DrivingAcademy 
        schools={[]} 
        schoolApplications={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
      />
    );
    expect(html).toContain('feed-container');
    expect(html).toContain('filter-toggle-btn');
  });

  it('renders active filter chips safely when searchQuery is present without crashing', () => {
    const html = renderToString(
      <DrivingAcademy 
        schools={[]} 
        schoolApplications={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
        searchQuery="Tokyo"
        setSearchQuery={vi.fn()}
      />
    );
    expect(html).toContain('active-filter-chips-row');
    expect(html).toContain('Tokyo');
    expect(html).toContain('リセット');
  });

  it('renders default closed accordion sections upon reset', () => {
    const html = renderToString(
      <DrivingAcademy 
        schools={[]} 
        schoolApplications={[]} 
        verifiedCompanies={[]} 
        isContractActive={false} 
      />
    );
    // Verified accordion default collapsed state (Rule 20)
    expect(html).not.toContain('selected-prefecture-chip');
  });
});

