const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { generateAlias } = require('../services/aliasService');
const { verifyStudent } = require('../services/kmitlVerify');
const kmitlOidc = require('../services/kmitlOidc');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
  hashToken,
  refreshExpiryDate,
  refreshCookieOptions,
  clearRefreshCookieOptions,
  REFRESH_COOKIE_NAME,
} = require('../services/tokenService');

const BCRYPT_ROUNDS = 12;

async function issueSession(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = refreshExpiryDate();
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { studentId, email, faculty, major, year, password, ssoTicket } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const existing = await User.findOne({ $or: [{ studentId }, { email: normalizedEmail }] });
  if (existing) {
    throw ApiError.conflict('An account with this studentId or email already exists');
  }

  // An SSO ticket proves the student already authenticated with the real
  // KMITL identity provider — trust it over the format/API check, but only
  // if the submitted identity matches what SSO attested.
  let verification;
  if (ssoTicket) {
    let attested;
    try {
      attested = kmitlOidc.verifySsoTicket(ssoTicket);
    } catch {
      throw ApiError.badRequest('KMITL SSO ticket is invalid or expired, please sign in with KMITL again');
    }
    if (attested.studentId !== studentId || attested.email !== normalizedEmail) {
      throw ApiError.badRequest('Submitted identity does not match the KMITL SSO login');
    }
    verification = { verified: true, method: 'sso' };
  } else {
    verification = await verifyStudent({ studentId, email: normalizedEmail, year });
    if (!verification.verified) {
      throw ApiError.badRequest('KMITL student verification failed', { reason: verification.reason });
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    studentId,
    email: normalizedEmail,
    passwordHash,
    faculty,
    major,
    year,
    alias: generateAlias(),
    kmitlVerified: true,
    verificationMethod: verification.method,
  });

  const accessToken = await issueSession(res, user);

  res.status(201).json({
    success: true,
    data: {
      user: user.toPublicProfile(),
      accessToken,
    },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;

  const user = await User.findOne({ studentId }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid student ID or password');

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) throw ApiError.unauthorized('Invalid student ID or password');

  const accessToken = await issueSession(res, user);

  res.json({
    success: true,
    data: {
      user: user.toPublicProfile(),
      accessToken,
    },
  });
});

/**
 * POST /api/auth/refresh
 * Rotates the refresh token: the cookie's token is verified against the
 * hash stored on the user, a brand-new refresh token is issued, and the
 * old one is invalidated. Any mismatch (reuse/theft) revokes the session.
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash +refreshTokenExpiresAt');
  if (!user || !user.refreshTokenHash) throw ApiError.unauthorized('Session not found, please log in again');

  const isExpired = !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now();
  const isMismatch = user.refreshTokenHash !== hashToken(token);

  if (isExpired || isMismatch) {
    // Possible token reuse/theft — revoke the session entirely.
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();
    throw ApiError.unauthorized('Session invalid, please log in again');
  }

  const accessToken = await issueSession(res, user); // rotates refresh token too

  res.json({ success: true, data: { accessToken } });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.sub, {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      });
    } catch {
      // token already invalid/expired — still clear the cookie below.
    }
  }
  // Match path/sameSite/secure from setCookie so the browser actually drops it.
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());

  // Also end the KMITL SSO session when OIDC is configured, otherwise
  // "Sign in with KMITL" would reuse the IdP cookie and skip the login form.
  let kmitlLogoutUrl = null;
  try {
    kmitlLogoutUrl = await kmitlOidc.buildLogoutUrl();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[logout] Could not build KMITL logout URL:', err.message);
  }

  res.json({
    success: true,
    data: { kmitlLogoutUrl },
    message: 'Logged out',
  });
});

/**
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user: user.toPublicProfile() } });
});

/**
 * GET /api/auth/kmitl
 * Starts the KMITL SSO (OIDC) flow by redirecting to the KMITL login page.
 */
const kmitlSsoStart = asyncHandler(async (_req, res) => {
  if (!kmitlOidc.isEnabled()) {
    throw ApiError.badRequest('KMITL SSO is not configured on this server');
  }
  const url = await kmitlOidc.buildAuthorizationUrl();
  res.redirect(url);
});

/**
 * GET /api/auth/kmitl/callback
 * OIDC redirect target. Exchanges the code, resolves the KMITL identity,
 * then either logs the student in (existing account) or hands the register
 * page a short-lived SSO ticket (new account). Always redirects back to the
 * client, encoding errors in the query string so the UI can display them.
 */
const kmitlSsoCallback = asyncHandler(async (req, res) => {
  const clientUrl = env.clientUrl.replace(/\/$/, '');
  const fail = (reason) =>
    res.redirect(`${clientUrl}/login?ssoError=${encodeURIComponent(reason)}`);

  if (!kmitlOidc.isEnabled()) return fail('KMITL SSO is not configured');

  const { code, state, error, error_description: errorDescription } = req.query;
  if (error) return fail(errorDescription || error);
  if (!code || !state) return fail('Missing authorization code');

  try {
    kmitlOidc.verifyState(String(state));
  } catch {
    return fail('Login session expired, please try again');
  }

  let identity;
  try {
    const tokens = await kmitlOidc.exchangeCodeForTokens(String(code));
    const userInfo = await kmitlOidc.fetchUserInfo(tokens.access_token);
    identity = kmitlOidc.extractIdentity(userInfo);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[kmitlSso] OIDC exchange failed:', err.message);
    return fail('Could not verify your KMITL login, please try again');
  }

  if (!identity.studentId) {
    return fail('This KMITL account is not a student account');
  }

  const user = await User.findOne({
    $or: [{ studentId: identity.studentId }, { email: identity.email }],
  });

  if (user) {
    if (!user.kmitlVerified || user.verificationMethod !== 'sso') {
      user.kmitlVerified = true;
      user.verificationMethod = 'sso';
    }
    await issueSession(res, user);
    return res.redirect(`${clientUrl}/?sso=success`);
  }

  // New student: send them to finish registration with a verified-identity ticket.
  const ticket = kmitlOidc.createSsoTicket(identity);
  return res.redirect(`${clientUrl}/register?ssoTicket=${encodeURIComponent(ticket)}`);
});

/**
 * POST /api/auth/forgot-password
 * Verifies studentId + email match, then issues a short-lived reset token.
 * (No email delivery yet — the client continues to the reset form with the token.)
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { studentId, email } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ studentId, email: normalizedEmail });
  if (!user) {
    throw ApiError.badRequest('No account found with this student ID and email');
  }

  const resetToken = signPasswordResetToken(user);

  res.json({
    success: true,
    data: {
      resetToken,
      expiresIn: '15m',
      message: 'Identity verified. You can set a new password now.',
    },
  });
});

/**
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, password } = req.body;

  let payload;
  try {
    payload = verifyPasswordResetToken(resetToken);
  } catch {
    throw ApiError.badRequest('Reset link is invalid or expired. Please try again.');
  }

  const user = await User.findById(payload.sub).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');

  user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  // Force re-login after reset
  user.refreshTokenHash = null;
  user.refreshTokenExpiresAt = null;
  await user.save();

  res.json({
    success: true,
    data: { message: 'Password updated. You can sign in with your new password.' },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  kmitlSsoStart,
  kmitlSsoCallback,
  forgotPassword,
  resetPassword,
};
