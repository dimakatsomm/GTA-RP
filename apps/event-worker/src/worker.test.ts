import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { healthzPlugin } from './healthz.js';

describe('event-worker /healthz', () => {
  it('returns 200 with status ok and a time string', async () => {
    const app = Fastify({ logger: false });
    await app.register(healthzPlugin);

    const res = await app.inject({ method: 'GET', url: '/healthz' });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body) as { status: string; time: string };
    expect(body.status).toBe('ok');
    expect(() => new Date(body.time).toISOString()).not.toThrow();
  });
});
