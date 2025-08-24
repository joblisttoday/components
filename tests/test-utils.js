/**
 * @fileoverview Test utilities for web component testing
 */

import { vi } from 'vitest';

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const wait = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for component to be fully initialized and rendered
 * @param {HTMLElement} component - Component to wait for
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
export const waitForComponent = async (component, timeout = 500) => {
  await wait(timeout);
  // Additional checks could be added here for specific component states
};

/**
 * Create a mock SDK instance with common methods
 * @returns {Object} Mock SDK object
 */
export const createMockSDK = () => ({
  initialize: vi.fn().mockResolvedValue(),
  dispose: vi.fn().mockResolvedValue(),
  getColumns: vi.fn().mockResolvedValue(['id', 'title', 'description']),
  searchCompanies: vi.fn().mockResolvedValue([]),
  searchJobs: vi.fn().mockResolvedValue([]),
  getCompany: vi.fn().mockResolvedValue({}),
  getCompaniesHighlighted: vi.fn().mockResolvedValue([]),
  getJobsFromHighlightedCompanies: vi.fn().mockResolvedValue([]),
  getCompanyHeatmap: vi.fn().mockResolvedValue([]),
  getJobsHeatmap: vi.fn().mockResolvedValue([]),
  query: vi.fn().mockResolvedValue([])
});

/**
 * Setup a web component for testing
 * @param {string} tagName - Component tag name
 * @param {Class} ComponentClass - Component class
 * @param {Object} attributes - Attributes to set on component
 * @returns {HTMLElement} Created and configured component
 */
export const setupComponent = async (tagName, ComponentClass, attributes = {}) => {
  // Register custom element if not already registered
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ComponentClass);
  }

  // Create element
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (typeof value === 'object') {
      element.setAttribute(key, JSON.stringify(value));
    } else {
      element.setAttribute(key, String(value));
    }
  });

  // Append to document to trigger connectedCallback
  document.body.appendChild(element);

  // Wait for component initialization
  await waitForComponent(element);

  return element;
};

/**
 * Clean up after component tests
 */
export const cleanup = () => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
};

/**
 * Simulate user input on an element
 * @param {HTMLElement} element - Target element
 * @param {string} value - Value to input
 * @param {string} eventType - Type of event to dispatch
 * @returns {Promise<void>}
 */
export const simulateInput = async (element, value, eventType = 'input') => {
  element.value = value;
  const event = new Event(eventType, { bubbles: true });
  element.dispatchEvent(event);
  await wait(50); // Small delay for event processing
};

/**
 * Simulate click on an element
 * @param {HTMLElement} element - Target element
 * @returns {Promise<void>}
 */
export const simulateClick = async (element) => {
  const event = new MouseEvent('click', { bubbles: true });
  element.dispatchEvent(event);
  await wait(50);
};

/**
 * Create a mock company object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock company object
 */
export const createMockCompany = (overrides = {}) => ({
  id: 'test-company',
  title: 'Test Company',
  description: 'A test company for testing purposes',
  company_url: 'https://example.com',
  tags: [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'Remote', slug: 'remote' }
  ],
  job_board_provider: 'greenhouse',
  job_board_hostname: 'boards.greenhouse.io',
  ...overrides
});

/**
 * Create a mock job object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock job object
 */
export const createMockJob = (overrides = {}) => ({
  id: 'test-job',
  name: 'Test Job',
  company_id: 'test-company',
  company_title: 'Test Company',
  location: 'Remote',
  ...overrides
});

/**
 * Assert that a component renders expected DOM structure
 * @param {HTMLElement} component - Component to check
 * @param {string} selector - CSS selector to find
 * @param {boolean} shouldExist - Whether element should exist
 */
export const assertElementExists = (component, selector, shouldExist = true) => {
  const element = component.querySelector(selector);
  if (shouldExist) {
    if (!element) {
      throw new Error(`Expected element "${selector}" to exist in component`);
    }
  } else {
    if (element) {
      throw new Error(`Expected element "${selector}" to not exist in component`);
    }
  }
  return element;
};

/**
 * Mock fetch globally for tests
 * @param {Object} mockResponse - Response to return
 */
export const mockFetch = (mockResponse = {}) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockResponse),
    text: () => Promise.resolve(JSON.stringify(mockResponse)),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    ...mockResponse
  });
};

/**
 * Mock console methods to suppress output during tests
 * @returns {Object} Object with restore function
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.info = vi.fn();

  return {
    restore: () => {
      Object.assign(console, originalConsole);
    }
  };
};