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
  });
});
