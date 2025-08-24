import { describe, test, expect } from 'vitest';
import { Company, Job, Provider } from '../../src/utils/models.js';

describe('Company Model', () => {
  test('should create Company instance with basic data', () => {
    const companyData = {
      id: 'test-company',
      title: 'Test Company',
      description: 'A test company'
    };
    
    const company = new Company(companyData);
    
    expect(company.id).toBe('test-company');
    expect(company.title).toBe('Test Company');
    expect(company.description).toBe('A test company');
  });

  test('should serialize positions when option is enabled', () => {
    const companyData = {
      id: 'test-company',
      title: 'Test Company',
      positions: [{ lat: 37.7749, lng: -122.4194, name: 'San Francisco' }]
    };
    
    const company = new Company(companyData, { serializePositions: true });
    
    expect(company.positions).toBeDefined();
    expect(Array.isArray(company.positions)).toBe(true);
  });

  test('should handle tags array', () => {
    const companyData = {
      id: 'test-company',
      title: 'Test Company',
      tags: ['tech', 'startup', 'remote']
    };
    
    const company = new Company(companyData);
    
    expect(company.tags).toBeDefined();
    expect(Array.isArray(company.tags)).toBe(true);
    expect(company.tags).toContain('tech');
  });
});

describe('Job Model', () => {
  test('should create Job instance with required fields', () => {
    const jobData = {
      id: 'job-123',
      name: 'Software Engineer',
      url: 'https://example.com/jobs/123',
      companyTitle: 'Test Company',
      companyId: 'test-company'
    };
    
    const job = new Job(jobData);
    
    expect(job.id).toBe('job-123');
    expect(job.name).toBe('Software Engineer');
    expect(job.url).toBe('https://example.com/jobs/123');
    expect(job.companyTitle).toBe('Test Company');
    expect(job.companyId).toBe('test-company');
  });

  test('should handle optional fields', () => {
    const jobData = {
      id: 'job-123',
      name: 'Software Engineer',
      url: 'https://example.com/jobs/123',
      companyTitle: 'Test Company',
      companyId: 'test-company',
      location: 'San Francisco, CA',
      description: 'Job description',
      publishedDate: '2024-01-01'
    };
    
    const job = new Job(jobData);
    
    expect(job.location).toBe('San Francisco, CA');
    expect(job.description).toBe('Job description');
    expect(job.publishedDate).toBe('2024-01-01');
  });
});

describe('Provider Model', () => {
  test('should create Provider instance with provider data', () => {
    const providerData = {
      name: 'greenhouse',
      hostname: 'boards.greenhouse.io',
      supported: true
    };
    
    const provider = new Provider(providerData);
    
    expect(provider.name).toBe('greenhouse');
    expect(provider.hostname).toBe('boards.greenhouse.io');
    expect(provider.supported).toBe(true);
  });

  test('should handle provider configuration', () => {
    const providerData = {
      name: 'lever',
      hostname: 'jobs.lever.co',
      supported: true,
      apiUrl: 'https://api.lever.co/v0/postings'
    };
    
    const provider = new Provider(providerData);
    
    expect(provider.apiUrl).toBe('https://api.lever.co/v0/postings');
  });
});