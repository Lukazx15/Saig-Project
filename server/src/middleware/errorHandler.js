const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err.isApiError ? err.statusCode : err.name === 'ValidationError' ? 400 : 500;
  const message = err.isApiError ? err.message : statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err.details,
    ...(env.nodeEnv !== 'production' && statusCode === 500 ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
