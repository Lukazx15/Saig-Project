const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === env.clientUrl) return true;
  if (env.nodeEnv === 'production') return false;
  try {
    const { hostname, protocol } = new URL(origin);
    return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1'].includes(hostname);
  } catch {
    return false;
  }
}

function originFromReferer(referer) {
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * CSRF defense for cookie-authenticated mutating routes.
 * Requires Origin (or Referer origin) to match CLIENT_URL / localhost in non-prod.
 */
function requireSameOrigin(req, _res, next) {
  const origin = req.get('Origin') || originFromReferer(req.get('Referer'));
  if (!isAllowedOrigin(origin)) {
    return next(ApiError.forbidden('Request origin is not allowed'));
  }
  return next();
}

module.exports = requireSameOrigin;
