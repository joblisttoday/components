import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getJobs } from '../../src/providers/ashby.js';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Ashby Provider', () => {
  test('should fetch jobs from GraphQL API', async () => {
    const mockGraphQLResponse = {
      data: {
        jobBoard: {
          jobPostings: [
            {
              id: 'test-job-123',
              title: 'Frontend Engineer',
              locationName: 'Remote',
              employmentType: 'FULL_TIME',
              secondaryLocations: []
            }
          ]
        }
      }
    };

    const mockJobDetailsResponse = {
      data: {
        jobPosting: {
          descriptionHtml: '<p>Job description content</p>'
        }
      }
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockGraphQLResponse)
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
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      name: 'Frontend Engineer',
      location: 'Remote',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });
    expect(jobs[0].id).toContain('ashby-test-company');
  });

  test('should handle GraphQL errors', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({ data: null })
    });

    const jobs = await getJobs({ hostname: 'invalid-company' });

    expect(jobs).toHaveLength(0);
  });

  test('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toBeUndefined();
  });

  test('should filter jobs by location when city is provided', async () => {
    const mockResponse = {
      data: {
        jobBoard: {
          jobPostings: [
            {
              id: 'job-1',
              title: 'Engineer 1',
              locationName: 'San Francisco',
              employmentType: 'FULL_TIME',
              secondaryLocations: []
            },
            {
              id: 'job-2', 
              title: 'Engineer 2',
              locationName: 'New York',
              employmentType: 'FULL_TIME',
              secondaryLocations: []
            }
          ]
        }
      }
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      city: 'san francisco'
    });

    // Should only return San Francisco job
    expect(jobs).toHaveLength(1);
    expect(jobs[0].location).toBe('San Francisco');
  });

  test('should handle secondary locations', async () => {
    const mockResponse = {
      data: {
        jobBoard: {
          jobPostings: [
            {
              id: 'job-1',
              title: 'Engineer',
              locationName: 'San Francisco',
              employmentType: 'FULL_TIME',
              secondaryLocations: ['New York', 'Remote']
            }
          ]
        }
      }
    };

    const mockJobDetails = {
      data: {
        jobPosting: {
          descriptionHtml: '<p>Job description</p>'
        }
      }
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockJobDetails)
      });

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].location).toContain('San Francisco');
  });
});