const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');

// Populates req.user when a valid Bearer token is present, but never
// rejects the request. Loads role from the DB (not JWT) so ownership
// flags cannot trust a stale token claim.
async function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select('_id role kmitlVerified');
      if (user && user.kmitlVerified) {
        req.user = { id: user._id.toString(), role: user.role };
      }
    } catch {
      // Invalid/expired token on a public route — just treat as anonymous.
    }
  }

  next();
}

module.exports = optionalAuthenticate;
