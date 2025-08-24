import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import JoblistSearch from '../../src/components/search.js';

// Mock the SDK
vi.mock('../../src/libs/sdk-duckdb.js', () => ({
  JoblistDuckDBSDK: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(),
    getColumns: vi.fn().mockResolvedValue(['id', 'title', 'description']),
    searchCompanies: vi.fn().mockResolvedValue([]),
    searchJobs: vi.fn().mockResolvedValue([]),
    getCompaniesHighlighted: vi.fn().mockResolvedValue([]),
    getJobsFromHighlightedCompanies: vi.fn().mockResolvedValue([])
  }))
}));

beforeEach(() => {
  if (!customElements.get('joblist-search')) {
    customElements.define('joblist-search', JoblistSearch);
  }
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Search Component', () => {
  test('should create search element', () => {
    const search = document.createElement('joblist-search');
    expect(search).toBeInstanceOf(JoblistSearch);
  });

  test('should render search form', async () => {
    const search = document.createElement('joblist-search');
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(search.querySelector('.search-container')).toBeTruthy();
    expect(search.querySelector('input[type="search"]')).toBeTruthy();
  });

  test('should handle search query attribute', async () => {
    const search = document.createElement('joblist-search');
    search.setAttribute('query', 'javascript developer');
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    const input = search.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    expect(input.value).toBe('javascript developer');
  });

  test('should perform company search', async () => {
    const search = document.createElement('joblist-search');
    search.setAttribute('search-type', 'companies');
    search.setAttribute('limit', '100');
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate input change
    const input = search.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    
    input.value = 'test query';
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for debounce

    expect(search.joblistSDK.searchCompanies).toHaveBeenCalled();
  });

  test('should perform job search', async () => {
    const search = document.createElement('joblist-search');
    search.setAttribute('search-type', 'jobs');
    search.setAttribute('limit', '100');
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate input change
    const input = search.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    
    input.value = 'developer';
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for debounce

    expect(search.joblistSDK.searchJobs).toHaveBeenCalled();
  });

  test('should handle limit attribute', async () => {
    const search = document.createElement('joblist-search');
    search.setAttribute('limit', '50');
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Check that limit property works
    expect(search.limit).toBe(50);

    // Simulate search
    const input = search.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    
    input.value = 'test';
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(search.joblistSDK.searchCompanies).toHaveBeenCalled();
  });

  test('should handle search errors gracefully', async () => {
    const search = document.createElement('joblist-search');
    
    // Mock search method to throw error
    search.joblistSDK = {
      initialize: vi.fn().mockResolvedValue(),
      getColumns: vi.fn().mockResolvedValue([]),
      searchCompanies: vi.fn().mockRejectedValue(new Error('Search failed')),
      searchJobs: vi.fn().mockRejectedValue(new Error('Search failed')),
      getCompaniesHighlighted: vi.fn().mockResolvedValue([]),
      getJobsFromHighlightedCompanies: vi.fn().mockResolvedValue([])
    };
    
    document.body.appendChild(search);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate search that will fail
    const input = search.querySelector('input[type="search"]');
    expect(input).toBeTruthy();
    
    input.value = 'test';
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Should not crash and should handle error gracefully
    expect(search).toBeTruthy();
  });
});