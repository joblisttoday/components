import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getJobs } from '../../src/providers/lever.js';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Lever Provider', () => {
  test('should fetch jobs from Lever API', async () => {
    const mockResponse = [
      {
        id: 'abc-123',
        text: 'Backend Engineer',
        description: '<p>Job description</p>',
        descriptionPlain: 'Job description',
        additional: '<p>Additional info</p>',
        additionalPlain: 'Additional info',
        createdAt: 1640995200000,
        country: 'US',
        hostedUrl: 'https://jobs.lever.co/test/abc-123',
        applyUrl: 'https://jobs.lever.co/test/abc-123/apply',
        categories: {
          location: 'New York, NY',
          commitment: 'Full-time',
          department: 'Engineering',
          team: 'Backend'
        }
      }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.lever.co/v0/postings/test-company'
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      name: 'Backend Engineer',
      location: 'New York, NY, US',
      companyTitle: 'Test Company',
      companyId: 'test-company-id'
    });
    expect(jobs[0].id).toContain('lever-test-company');
  });

  test('should handle non-array responses', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({ error: 'Company not found' })
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
    const mockResponse = [
      {
        id: 'job-1',
        text: 'Engineer 1',
        categories: { location: 'San Francisco, CA' },
        country: 'US',
        hostedUrl: 'https://jobs.lever.co/test/job-1',
        createdAt: 1640995200000
      },
      {
        id: 'job-2',
        text: 'Engineer 2', 
        categories: { location: 'New York, NY' },
        country: 'US',
        hostedUrl: 'https://jobs.lever.co/test/job-2',
        createdAt: 1640995200000
      }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({
      hostname: 'test-company',
      city: 'san francisco'
    });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].location).toBe('San Francisco, CA, US');
  });

  test('should handle missing categories gracefully', async () => {
    const mockResponse = [
      {
        id: 'job-1',
        text: 'Engineer',
        country: 'US',
        hostedUrl: 'https://jobs.lever.co/test/job-1',
        createdAt: 1640995200000
        // No categories object
      }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Engineer');
    expect(jobs[0].location).toBe('US');
  });

  test('should handle workplace type field', async () => {
    const mockResponse = [
      {
        id: 'job-1',
        text: 'Remote Engineer',
        workplaceType: 'remote',
        country: 'US',
        hostedUrl: 'https://jobs.lever.co/test/job-1',
        createdAt: 1640995200000,
        categories: {
          location: 'Remote'
        }
      }
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse)
    });

    const jobs = await getJobs({ hostname: 'test-company' });

    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Remote Engineer');
  });
});