const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Mood of the Major API listening on http://localhost:${env.port}`);
    // eslint-disable-next-line no-console
    console.log(`[server] Swagger docs at http://localhost:${env.port}/api-docs`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
