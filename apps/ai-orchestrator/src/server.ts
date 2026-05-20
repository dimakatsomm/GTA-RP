import Fastify from 'fastify';
import { generateRoutes } from './routes/generate.js';
import { adminRoutes } from './admin/routes.js';

export async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(generateRoutes);
  await app.register(adminRoutes, {
    getRecentUsage: async () => [],
    getMetricsSummary: async () => ({
      totalCostUsd24h: 0,
      callsByTier: {},
      callsByPurpose: {},
      cacheHitRate: 0,
    }),
  });
  return app;
}
