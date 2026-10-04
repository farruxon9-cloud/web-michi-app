import { describe, it, expect, beforeEach } from 'vitest';
import { michiLocalStorageEngine } from './michiLocalStorageEngine';

describe('FAZA 3: Michi Local Storage & Offline Cache Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should cache and retrieve jobs list', () => {
    const jobs = [
      { id: 1, title: 'Haydovchi', salary: '¥350,000 / oyiga' },
      { id: 2, title: 'Kuryer', salary: '¥300,000 / oyiga' }
    ];

    michiLocalStorageEngine.cacheJobs(jobs);
    const cached = michiLocalStorageEngine.getCachedJobs();

    expect(cached).toHaveLength(2);
    expect(cached[0].title).toBe('Haydovchi');
  });

  it('should cache and retrieve driving schools list', () => {
    const schools = [
      { id: 101, name: 'Tokyo Driving Academy', price: '¥300,000' }
    ];

    michiLocalStorageEngine.cacheSchools(schools);
    const cached = michiLocalStorageEngine.getCachedSchools();

    expect(cached).toHaveLength(1);
    expect(cached[0].name).toBe('Tokyo Driving Academy');
  });

  it('should queue pending job posts for offline synchronization', () => {
    const jobPayload = {
      title: 'Kuryer E\'lon',
      company: 'Sagawa Express',
      salary: 380000,
      licenses: ['lic_futsu']
    };

    michiLocalStorageEngine.queuePendingJobPost(jobPayload);
    const pending = michiLocalStorageEngine.getPendingJobPosts();

    expect(pending).toHaveLength(1);
    expect(pending[0].company).toBe('Sagawa Express');
    expect(pending[0]._clientTimestamp).toBeDefined();

    michiLocalStorageEngine.clearPendingJobPosts();
    expect(michiLocalStorageEngine.getPendingJobPosts()).toHaveLength(0);
  });

  it('should queue pending school posts for offline synchronization', () => {
    const schoolPayload = {
      name: 'Fuji Gasshuku School',
      price: 280000,
      licenses: ['oogata']
    };

    michiLocalStorageEngine.queuePendingSchoolPost(schoolPayload);
    const pending = michiLocalStorageEngine.getPendingSchoolPosts();

    expect(pending).toHaveLength(1);
    expect(pending[0].name).toBe('Fuji Gasshuku School');

    michiLocalStorageEngine.clearPendingSchoolPosts();
    expect(michiLocalStorageEngine.getPendingSchoolPosts()).toHaveLength(0);
  });
});
