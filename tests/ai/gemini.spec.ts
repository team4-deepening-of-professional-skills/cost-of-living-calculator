import { test, expect } from '@playwright/test';

test.describe('Gemini AI API', () => {
  test('should generate savings tips based on expenses', async ({ request }) => {
    const payload = {
      category: 'Groceries',
      expenses: [
        { item: 'Organic Milk', cost: 10 },
        { item: 'Avocado Toast', cost: 25 }
      ],
      from: 'USD',
      to: 'GBP'
    };

    const response = await request.post('/api/gemini', {
      data: payload
    });

    const body = await response.json();

    // Check for 200 OK
    expect(response.status()).toBe(200);
  
    expect(body).toHaveProperty('output');
    expect(typeof body.output).toBe('string');
    expect(body.output.length).toBeGreaterThan(10);
  });
});