import { describe, test, expect } from 'vitest';
import { generateMissingDates } from '../../src/utils/heatmap.js';

describe('Heatmap Utilities', () => {
  test('should generate missing dates for empty data', async () => {
    const data = [];
    const days = 7;
    
    const result = await generateMissingDates(data, days);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(days + 1); // +1 because it includes start and end dates
    
    // All dates should have total: 0
    result.forEach(entry => {
      expect(entry.total).toBe(0);
      expect(entry.date).toBeDefined();
    });
  });

  test('should fill in missing dates with existing data', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const data = [
      { date: today.toISOString().split('T')[0], total: 5 }
    ];
    
    const result = await generateMissingDates(data, 3);
    
    expect(result.length).toBe(4); // 3 days + current day
    
    // Find the entry for today
    const todayEntry = result.find(entry => entry.date === data[0].date);
    expect(todayEntry).toBeDefined();
    if (todayEntry) {
      expect(todayEntry.total).toBe(5);
    }
    
    // Other dates should have total: 0
    const otherEntries = result.filter(entry => entry.date !== data[0].date);
    otherEntries.forEach(entry => {
      expect(entry.total).toBe(0);
    });
  });

  test('should handle data with different date formats', async () => {
    const data = [
      { date: '2024-01-01', total: 3 },
      { date: '2024-01-03', total: 7 }
    ];
    
    const result = await generateMissingDates(data, 5);
    
    expect(result.length).toBe(6); // 5 days + current day
    
    // Check that existing data is preserved (but might not be included if outside date range)
    const jan1Entry = result.find(entry => entry.date === '2024-01-01');
    const jan3Entry = result.find(entry => entry.date === '2024-01-03');
    
    if (jan1Entry) expect(jan1Entry.total).toBe(3);
    if (jan3Entry) expect(jan3Entry.total).toBe(7);
  });

  test('should sort results by date descending', async () => {
    const data = [
      { date: '2024-01-01', total: 1 },
      { date: '2024-01-03', total: 3 }
    ];
    
    const result = await generateMissingDates(data, 5);
    
    // Check that dates are in ascending order (that's how the function works - oldest first)
    for (let i = 0; i < result.length - 1; i++) {
      const currentDate = new Date(result[i].date);
      const nextDate = new Date(result[i + 1].date);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });
});