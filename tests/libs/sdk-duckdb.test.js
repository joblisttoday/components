import { describe, test, expect, vi, beforeEach } from 'vitest';
import { JoblistDuckDBSDK } from '../../src/libs/sdk-duckdb.js';

// Mock DuckDB WASM
vi.mock('@duckdb/duckdb-wasm', () => ({
  getJsDelivrBundles: vi.fn(() => ({})),
  selectBundle: vi.fn(() => Promise.resolve({
    mainWorker: 'mock-worker.js',
    mainModule: 'mock-module.wasm',
    pthreadWorker: 'mock-pthread.js'
  })),
  ConsoleLogger: vi.fn(),
  AsyncDuckDB: vi.fn().mockImplementation(() => ({
    instantiate: vi.fn(),
    connect: vi.fn(() => Promise.resolve({
      query: vi.fn(() => Promise.resolve({
        toArray: vi.fn(() => []),
        schema: { fields: [] }
      })),
      close: vi.fn()
    })),
    registerFileBuffer: vi.fn()
  }))
}));

// Mock global fetch
global.fetch = vi.fn();
global.URL = { createObjectURL: vi.fn(() => 'blob:mock-url') };
global.Worker = vi.fn();

describe('JoblistDuckDBSDK', () => {
  let sdk;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = new JoblistDuckDBSDK();
  });

  test('should create SDK instance with default configuration', () => {
    expect(sdk.baseParquetUrl).toBe('https://workers.joblist.today');
    expect(sdk.mode).toBe('buffer');
    expect(sdk.db).toBe(null);
    expect(sdk.conn).toBe(null);
  });

  test('should create SDK instance with custom base URL', () => {
    const customSdk = new JoblistDuckDBSDK('https://custom.example.com/');
    expect(customSdk.baseParquetUrl).toBe('https://custom.example.com');
  });

  test('should generate parquet URLs correctly', () => {
    const url = sdk.parquetUrl('companies');
    expect(url).toBe('https://workers.joblist.today/companies.parquet');
  });

  test('should sanitize table names in parquet URLs', () => {
    const url = sdk.parquetUrl('test-table$%^&*');
    expect(url).toBe('https://workers.joblist.today/test-table.parquet');
  });

  test('should initialize DuckDB successfully', async () => {
    await sdk.initialize();
    
    expect(sdk.db).toBeTruthy();
    expect(sdk.conn).toBeTruthy();
  });

  test('should not reinitialize if already initialized', async () => {
    // First initialization
    await sdk.initialize();
    const firstDb = sdk.db;
    
    // Second initialization should not create new instance
    await sdk.initialize();
    expect(sdk.db).toBe(firstDb);
  });

  test('should handle query with parameters', async () => {
    await sdk.initialize();
    
    const mockTable = {
      toArray: vi.fn(() => [['test', 'Test Company']]),
      schema: { 
        fields: [
          { name: 'id' },
          { name: 'name' }
        ]
      }
    };
    
    sdk.conn.query.mockResolvedValue(mockTable);
    
    const result = await sdk.query('SELECT * FROM companies WHERE id = ?', ['test']);
    
    expect(result).toEqual([{ id: 'test', name: 'Test Company' }]);
    expect(sdk.conn.query).toHaveBeenCalledWith("SELECT * FROM companies WHERE id = 'test'");
  });

  test('should fetch and register parquet files', async () => {
    await sdk.initialize();
    
    global.fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
    });
    
    const result = await sdk.fetchAndRegister('test.parquet', 'https://example.com/test.parquet');
    
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/test.parquet', { mode: 'cors' });
    expect(result).toBe('test.parquet');
    expect(sdk._registered.has('test.parquet')).toBe(true);
  });

  test('should handle fetch errors gracefully', async () => {
    await sdk.initialize();
    
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    });
    
    await expect(sdk.fetchAndRegister('test.parquet', 'https://example.com/test.parquet'))
      .rejects.toThrow('Failed to fetch https://example.com/test.parquet: 404');
  });

  test('should dispose resources properly', async () => {
    await sdk.initialize();
    
    const mockClose = vi.fn();
    sdk.conn.close = mockClose;
    
    await sdk.dispose();
    
    expect(mockClose).toHaveBeenCalled();
    expect(sdk.conn).toBe(null);
    expect(sdk.db).toBe(null);
  });
});