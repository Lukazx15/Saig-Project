const { verifyAccessToken } = require('../services/tokenService');

// Populates req.user = { id, role } when a valid Bearer token is present,
// but never rejects the request — used on public routes (e.g. the mood
// feed) that still need to know "is this viewer the author?" for the
// isOwner/canEdit/canDelete flags without requiring authentication.
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
