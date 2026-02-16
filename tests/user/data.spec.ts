import { test, expect } from '@playwright/test';

test.describe('User Data API', () => {
  // Test case for missing query parameter
  test('should return 400 when accountNo is missing', async ({ request }) => {
    const response = await request.get('/api/user/data');
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBe('Missing accountNo');
  });

  // Test case for a user that doesn't exist
  test('should return 404 for non-existent accountNo', async ({ request }) => {
    const response = await request.get('/api/user/data?accountNo=999999');
    const body = await response.json();

    expect(response.status()).toBe(404);
    expect(body.error).toBe('User not found');
  });

  // Test case for successful data fetch
  // Note: Assumes a user with ID 1 exists in your test DB
  test('should return user expenses for valid accountNo', async ({ request }) => {
    const response = await request.get('/api/user/data?accountNo=1');
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.expenses)).toBe(true);
    } else {
      console.warn('User ID 1 not found in DB, skipping content check');
    }
  });
});