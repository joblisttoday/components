import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getJobs } from '../../src/providers/smartrecruiters.js';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SmartRecruiters Provider', () => {
  test('should fetch jobs and descriptions', async () => {
    const mockJobsResponse = {
      offset: 0,
      limit: 100,
      totalFound: 1,
      content: [
        {
          id: '744000077603107',
          name: 'Product Manager',
          uuid: '22af8b3f-3d9b-41fa-9ed7-43d504a255b9',
          jobAdId: '19d2f0af-a26b-4197-93f2-d8f990a7a08b',
          defaultJobAd: true,
          refNumber: 'REF850R',
          company: { identifier: 'test', name: 'Test Company' },
          releasedDate: '2025-08-22T07:31:19.597Z',
          location: {
            city: 'Berlin',
            region: 'BE',
            country: 'de',
            remote: false,
            fullLocation: 'Berlin, BE, Germany'
          }
        }
      ]
    };

    const mockJobDetailsResponse = {
      jobAd: {
        sections: {
          jobDescription: { text: 'Job description content' },
          qualifications: { text: 'Required qualifications' },
          additionalInformation: { text: 'Additional information' }
        }
      }
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockJobsResponse)
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockJobDetailsResponse)
      });

    const jobs = await getJobs({
      hostname: 'test-company',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.smartrecruiters.com/v1/companies/test-company/postings'
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.smartrecruiters.com/v1/companies/test-company/postings/744000077603107'
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      name: 'Product Manager',
      location: 'Berlin, BE, Germany',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });
    expect(jobs[0].id).toContain('smartrecruiters-test-company');
  });

  test('should filter jobs by city', async () => {
    const mockResponse = {
      content: [
        {
          id: '1',
          name: 'Engineer',
          uuid: 'uuid-1',
          location: {
            city: 'Berlin',
            country: 'de'
          }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      city: 'berlin'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.smartrecruiters.com/v1/companies/test-company/postings?city=Berlin'
    );
  });

  test('should handle API errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'));

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toBeUndefined();
  });

  test('should handle empty job list', async () => {
    const mockResponse = {
      content: []
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toHaveLength(0);
  });

  test('should handle job details fetch error', async () => {
    const mockJobsResponse = {
      content: [
        {
          id: '1',
          name: 'Engineer',
          uuid: 'uuid-1',
          location: { city: 'Berlin', country: 'de' }
        }
      ]
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockJobsResponse)
      })
      .mockRejectedValueOnce(new Error('Details fetch failed'));

    const jobs = await getJobs({ hostname: 'test-company' });

    // Should still return job even if details fetch fails
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Engineer');
  });
});