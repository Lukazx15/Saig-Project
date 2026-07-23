const rateLimit = require('express-rate-limit');
const securityLog = require('../utils/securityLog');

function onLimitReached(req, _res, _options) {
  securityLog('rate_limited', {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
}

/** Milder limit for all /api traffic. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
  handler(req, res, _next, options) {
    onLimitReached(req);
    res.status(options.statusCode).json(options.message);
  },
});

/** Strict limit for login / register / refresh. */
const authStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later' },
  handler(req, res, _next, options) {
    onLimitReached(req);
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  apiLimiter,
  authStrictLimiter,
};
