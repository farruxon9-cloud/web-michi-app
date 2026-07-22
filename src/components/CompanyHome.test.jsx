import { describe, it, vi, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import CompanyHome from './CompanyHome';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: { language: 'uz', changeLanguage: () => Promise.resolve() }
  })
}));

describe('CompanyHome Component Render', () => {
  it('renders successfully with default empty lists', () => {
    const html = renderToString(
      <CompanyHome 
        jobs={[]} 
        schools={[]} 
        applications={[]} 
        schoolApplications={[]} 
        profileData={{ fullName: 'Sagawa Express', companyType: 'logistics' }}
      />
    );
    expect(html).toContain('jobs-list');
  });

  it('renders successfully with mock jobs and courses', () => {
    const mockJobs = [
      {
        id: 99,
        company: 'Sagawa Express',
        title: 'Local Delivery',
        salary: '¥300,000',
        type: 'fulltime',
        location: 'Tokyo',
        logo: 'https://ui-avatars.com/api/?name=Sagawa',
        verified: true
      }
    ];
    const html = renderToString(
      <CompanyHome 
        jobs={mockJobs} 
        schools={[]} 
        applications={[]} 
        schoolApplications={[]} 
        profileData={{ fullName: 'Sagawa Express', companyType: 'logistics' }}
      />
    );
    expect(html).toContain('Local Delivery');
  });
});
