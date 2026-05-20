import Fastify from 'fastify';
import { generateRoutes } from './routes/generate.js';

export function buildServer() {
  const app = Fastify({ logger: true });
  void app.register(generateRoutes);
  return app;
}
