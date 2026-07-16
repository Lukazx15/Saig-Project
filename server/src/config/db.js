const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log(`[db] Mongoose connected -> ${env.mongodbUri}`);
  });

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[db] Mongoose connection error:', err.message);
  });

  await mongoose.connect(env.mongodbUri);
  return mongoose.connection;
}

module.exports = connectDB;
