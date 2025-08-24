import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getJobs } from '../../src/providers/workable.js';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Workable Provider', () => {
  test('should fetch jobs from widget API', async () => {
    const mockResponse = {
      name: 'Test Company',
      description: 'Company description',
      jobs: [
        {
          id: 'ABC123',
          title: 'UX Designer',
          shortcode: 'ABC123',
          code: '',
          employment_type: 'Full-time',
          telecommuting: false,
          department: 'Design',
          url: 'https://apply.workable.com/test/j/ABC123',
          shortlink: 'https://apply.workable.com/j/ABC123',
          application_url: 'https://apply.workable.com/j/ABC123/apply',
          published_on: '2025-08-11',
          created_at: '2025-08-11',
          country: 'United States',
          city: 'San Francisco',
          state: 'California',
          education: ''
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://apply.workable.com/api/v1/widget/accounts/test-company',
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json' }
      })
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      name: 'UX Designer',
      location: 'San Francisco, United States',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });
    expect(jobs[0].id).toContain('workable-test-company');
  });

  test('should handle missing company data', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({ jobs: null })
    });

    const jobs = await getJobs({ hostname: 'invalid-company' });

    expect(jobs).toHaveLength(0);
  });

  test('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toBeUndefined();
  });

  test('should filter jobs by city when provided', async () => {
    const mockResponse = {
      jobs: [
        {
          id: 'job-1',
          title: 'Engineer 1',
          shortcode: 'job-1',
          city: 'San Francisco',
          country: 'United States',
          url: 'https://apply.workable.com/test/j/job-1',
          published_on: '2025-08-11'
        },
        {
          id: 'job-2',
          title: 'Engineer 2',
          shortcode: 'job-2', 
          city: 'New York',
          country: 'United States',
          url: 'https://apply.workable.com/test/j/job-2',
          published_on: '2025-08-11'
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      city: 'san francisco'
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].location).toBe('San Francisco, United States');
  });

  test('should handle remote jobs', async () => {
    const mockResponse = {
      jobs: [
        {
          id: 'remote-job',
          title: 'Remote Engineer',
          shortcode: 'remote-job',
          telecommuting: true,
          country: 'United States',
          url: 'https://apply.workable.com/test/j/remote-job',
          published_on: '2025-08-11'
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Remote Engineer');
  });
});