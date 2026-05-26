import Fastify from 'fastify';
import { generateRoutes } from './routes/generate.js';
import { adminRoutes, type AdminDeps } from './admin/routes.js';

const STUB_ADMIN_DEPS: AdminDeps = {
  getRecentUsage: async () => [],
  getMetricsSummary: async () => ({
    totalCostUsd24h: 0,
    callsByTier: {},
    callsByPurpose: {},
    cacheHitRate: 0,
  }),
};

export interface BuildServerOptions {
  adminDeps?: AdminDeps;
}

export async function buildServer(opts: BuildServerOptions = {}) {
  const app = Fastify({ logger: true });
  await app.register(generateRoutes);
  if (opts.adminDeps === undefined) {
    app.log.warn(
      'buildServer: no AdminDeps injected — /admin/ai-usage and /metrics will return empty data',
    );
  }
  await app.register(adminRoutes, opts.adminDeps ?? STUB_ADMIN_DEPS);
  return app;
}
