const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimit');
const ApiError = require('./utils/ApiError');

const app = express();
const allowedOrigins = new Set([env.clientUrl]);
const isDevLocalhostOrigin = (origin) => {
  if (env.nodeEnv === 'production') return false;
  try {
    const { hostname, protocol } = new URL(origin);
    return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1'].includes(hostname);
  } catch {
    return false;
  }
};

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isDevLocalhostOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(ApiError.forbidden('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);
app.use(hpp());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

if (env.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
}

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
