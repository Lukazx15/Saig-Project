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

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Converts JWT_REFRESH_EXPIRES_IN (e.g. "7d", "15m") into a future Date.
function refreshExpiryDate() {
  return new Date(Date.now() + durationMs(env.jwt.refreshExpiresIn));
}

const REFRESH_COOKIE_NAME = 'refreshToken';
const SSO_TICKET_COOKIE = 'ssoTicket';
const SHORT_LIVED_COOKIE_MAX_AGE_MS = durationMs('15m');

function baseAuthCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/api/auth',
    maxAge,
  };
}

function refreshCookieOptions() {
  return baseAuthCookieOptions(durationMs(env.jwt.refreshExpiresIn));
}

function ssoTicketCookieOptions() {
  return baseAuthCookieOptions(SHORT_LIVED_COOKIE_MAX_AGE_MS);
}

// clearCookie must match the attributes used when the cookie was set,
// otherwise browsers keep the old refreshToken and the next page load
// silently restores the session.
function clearRefreshCookieOptions() {
  const { maxAge: _maxAge, ...opts } = refreshCookieOptions();
  return opts;
}

function clearSsoTicketCookieOptions() {
  const { maxAge: _maxAge, ...opts } = ssoTicketCookieOptions();
  return opts;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
  refreshCookieOptions,
  clearRefreshCookieOptions,
  ssoTicketCookieOptions,
  clearSsoTicketCookieOptions,
  REFRESH_COOKIE_NAME,
  SSO_TICKET_COOKIE,
};
