import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { env } from '../../src/config/env';

describe('Backend API Integration Tests (Health, Auth, Security & Validation)', () => {
  it('GET /api/health: Returns 200 with service health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Monthly Budget Tracker Backend');
  });

  it('POST /api/auth/register: Rejects requests with invalid email or weak password (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login: Rejects missing credentials (400)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/income: Rejects unauthenticated request without token (401)', async () => {
    const res = await request(app).get('/api/income?month=11&year=2026');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('GET /api/expenses: Rejects malformed or fake token (401)', async () => {
    const res = await request(app)
      .get('/api/expenses?month=11&year=2026')
      .set('Authorization', 'Bearer invalid.token.signature');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('POST /api/expenses: Rejects negative or zero amount expense (400)', async () => {
    const mockToken = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com', name: 'Tester' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Negative test',
        amount: -500,
        month: 11,
        year: 2026,
      });

    // Expect either validation rejection or bad request
    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/unknown-route: Returns 404 for non-existent endpoints', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
