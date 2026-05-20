import 'dotenv/config';
import { buildServer } from './server.js';

const port = Number(process.env['AI_ORCHESTRATOR_PORT'] ?? 3002);
const app = await buildServer();

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
