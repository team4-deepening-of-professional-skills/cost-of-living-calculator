// command to run: npx playwright test tests/user/login.spec.ts --project=chromium

import { test, expect } from '@playwright/test';


const BASE_URL = 'http://localhost:3000';

test.describe('Login API', () => {

  test('should return 401 for invalid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/user/login`, {
      data: {
        username: 'wronguser',
        password: 'wrongpassword'
      }
    });

    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Invalid username or password');
  });


  test('should return 200 for valid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/user/login`, {
      data: {
        username: 'username', 
        password: 'password'
      }
    });

    const body = await response.json();

    if (response.ok()) {
        expect(response.status()).toBe(200);
        expect(body.success).toBe(true);
        expect(body).toHaveProperty('accountNo');
    }
  });
});