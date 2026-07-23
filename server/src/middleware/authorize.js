const ApiError = require('../utils/ApiError');
const securityLog = require('../utils/securityLog');

// Usage: authorize('admin') or authorize('admin', 'student')
function authorize(...allowedRoles) {
  return function authorizeMiddleware(req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      securityLog('access_denied', {
        userId: req.user.id,
        role: req.user.role,
        required: allowedRoles,
        path: req.originalUrl,
        ip: req.ip,
      });
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = authorize;
