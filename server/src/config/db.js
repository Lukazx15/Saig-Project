const mongoose = require('mongoose');
const env = require('./env');

function redactMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    return `${parsed.protocol}//${parsed.host}${dbName}`;
  } catch {
    return '[invalid-mongodb-uri]';
  }
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log(`[db] Mongoose connected -> ${redactMongoUri(env.mongodbUri)}`);
  });

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[db] Mongoose connection error:', err.message);
  });

  await mongoose.connect(env.mongodbUri);
  return mongoose.connection;
}

module.exports = connectDB;
