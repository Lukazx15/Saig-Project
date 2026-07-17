const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');

// Verifies the Bearer access token and attaches `req.user` = { id, role }.
// Does NOT hit the database on every request (fast path) — controllers
// that need the full user document load it themselves.
async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };

    // Cheap existence check so deleted/banned users are rejected immediately.
    const exists = await User.exists({ _id: payload.sub });
    if (!exists) throw ApiError.unauthorized('User no longer exists');

    next();
  } catch (err) {
    if (err.isApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

module.exports = authenticate;
