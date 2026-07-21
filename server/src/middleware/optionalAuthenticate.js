const { verifyAccessToken } = require('../services/tokenService');

// Populates req.user when a valid Bearer token is present, but never
// rejects the request. Kept for any route that personalizes a response
// without requiring a session.
async function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Invalid/expired token on a public route — just treat as anonymous.
    }
  }

  next();
}

module.exports = optionalAuthenticate;
