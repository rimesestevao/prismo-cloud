import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'not connected',
      postgresql: 'not connected',
    },
  });
});

describe('GET /api/v1/health', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
