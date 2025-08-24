import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import JoblistHeatmap from '../../src/components/heatmap.js';

// Mock the SDK
vi.mock('../../src/libs/sdk-duckdb.js', () => ({
  default: {
    initialize: vi.fn(),
    getJobsHeatmap: vi.fn(),
    getCompanyHeatmap: vi.fn()
  },
  JoblistDuckDBSDK: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    getJobsHeatmap: vi.fn(),
    getCompanyHeatmap: vi.fn()
  }))
}));

// Mock the API SDK
vi.mock('../../src/libs/sdk-api.js', () => ({
  JoblistApiSDK: vi.fn().mockImplementation(() => ({
    getJobsHeatmap: vi.fn(),
    getCompanyHeatmap: vi.fn()
  }))
}));

// Mock the heatmap plot function
vi.mock('../../src/plots/heatmap.js', () => ({
  default: vi.fn().mockImplementation(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    return canvas;
  })
}));

beforeEach(() => {
  if (!customElements.get('joblist-heatmap')) {
    customElements.define('joblist-heatmap', JoblistHeatmap);
  }
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Heatmap Component', () => {
  test('should create heatmap element', () => {
    const heatmap = document.createElement('joblist-heatmap');
    expect(heatmap).toBeInstanceOf(JoblistHeatmap);
  });

  test('should render with default properties', async () => {
    const { JoblistApiSDK } = await import('../../src/libs/sdk-api.js');
    
    const mockSDK = new JoblistApiSDK();
    mockSDK.getJobsHeatmap.mockResolvedValue([
      { date: '2024-01-01', total: 5 },
      { date: '2024-01-02', total: 3 }
    ]);

    const heatmap = document.createElement('joblist-heatmap');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for connectedCallback

    expect(heatmap.querySelector('canvas')).toBeTruthy();
  });

  test('should handle company-id attribute', async () => {
    const { JoblistApiSDK } = await import('../../src/libs/sdk-api.js');
    
    const mockSDK = new JoblistApiSDK();
    mockSDK.getCompanyHeatmap.mockResolvedValue([
      { date: '2024-01-01', total: 5 },
      { date: '2024-01-02', total: 3 }
    ]);

    const heatmap = document.createElement('joblist-heatmap');
    heatmap.setAttribute('company-id', 'test-company');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(heatmap.querySelector('canvas')).toBeTruthy();
  });

  test('should handle days attribute', async () => {
    const { JoblistApiSDK } = await import('../../src/libs/sdk-api.js');
    
    const mockSDK = new JoblistApiSDK();
    mockSDK.getJobsHeatmap.mockResolvedValue([]);

    const heatmap = document.createElement('joblist-heatmap');
    heatmap.setAttribute('days', '180');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(heatmap.days).toBe(180);
    expect(heatmap.getAttribute('no-data')).toBe('true'); // No data should set the attribute
  });

  test('should abort previous requests when disconnected', async () => {
    const heatmap = document.createElement('joblist-heatmap');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 50));

    // Store reference to abort controller
    const controller = heatmap.abortController;

    // Disconnect should abort the signal
    document.body.removeChild(heatmap);

    // Check that the abort controller was called
    expect(controller?.signal.aborted).toBe(true);
    expect(heatmap.abortController).toBe(null);
  });

  test('should handle data loading errors gracefully', async () => {
    const { JoblistApiSDK } = await import('../../src/libs/sdk-api.js');
    
    const mockSDK = new JoblistApiSDK();
    mockSDK.getJobsHeatmap.mockRejectedValue(new Error('Network error'));

    const heatmap = document.createElement('joblist-heatmap');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not throw error and should set no-data attribute
    expect(heatmap.getAttribute('no-data')).toBe('true');
  });

  test('should update when attributes change', async () => {
    const heatmap = document.createElement('joblist-heatmap');
    document.body.appendChild(heatmap);

    await new Promise(resolve => setTimeout(resolve, 50));

    // Change the days attribute
    heatmap.setAttribute('days', '90');

    await new Promise(resolve => setTimeout(resolve, 50));

    // Should have updated the days property
    expect(heatmap.days).toBe(90);
  });
});