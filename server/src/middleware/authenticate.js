const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');

// Verifies the Bearer access token and attaches `req.user` = { id, role }.
// Only KMITL-verified accounts may use the API (registration enforces
// studentId + @kmitl.ac.th / SSO before setting kmitlVerified).
async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('_id role kmitlVerified');
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (!user.kmitlVerified) {
      throw ApiError.forbidden('Only verified KMITL students can use this app');
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    if (err.isApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

module.exports = authenticate;
