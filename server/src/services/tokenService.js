const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const durationMs = require('./durationMs');

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), jti: crypto.randomUUID() },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/** Short-lived token for password reset (15 minutes). */
function signPasswordResetToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), purpose: 'password-reset' },
    env.jwt.accessSecret,
    { expiresIn: '15m' }
  );
}

function verifyPasswordResetToken(token) {
  const payload = jwt.verify(token, env.jwt.accessSecret);
  if (payload.purpose !== 'password-reset') {
    const err = new Error('Invalid password reset token');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return payload;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Converts JWT_REFRESH_EXPIRES_IN (e.g. "7d", "15m") into a future Date.
function refreshExpiryDate() {
  return new Date(Date.now() + durationMs(env.jwt.refreshExpiresIn));
}

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: durationMs(env.jwt.refreshExpiresIn),
  };
}

// clearCookie must match the attributes used when the cookie was set,
// otherwise browsers keep the old refreshToken and the next page load
// silently restores the session.
function clearRefreshCookieOptions() {
  const { maxAge: _maxAge, ...opts } = refreshCookieOptions();
  return opts;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
  hashToken,
  refreshExpiryDate,
  refreshCookieOptions,
  clearRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
};
