const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { generateAlias } = require('../services/aliasService');
const kmitlOidc = require('../services/kmitlOidc');
const { normalizeFacultyMajor } = require('../config/kmitlCatalog');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
  refreshCookieOptions,
  clearRefreshCookieOptions,
  ssoTicketCookieOptions,
  clearSsoTicketCookieOptions,
  REFRESH_COOKIE_NAME,
  SSO_TICKET_COOKIE,
} = require('../services/tokenService');
const securityLog = require('../utils/securityLog');

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
 * Registration is SSO-only: a valid httpOnly ssoTicket cookie (from the
 * KMITL OIDC callback) is required. Non-SSO / verifyStudent signups are rejected.
 */
const register = asyncHandler(async (req, res) => {
  const { studentId, email, faculty, major, year, password } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();
  const ssoTicket = req.cookies?.[SSO_TICKET_COOKIE];

  if (!ssoTicket) {
    throw ApiError.badRequest(
      'KMITL SSO is required to register. Please continue with KMITL first.',
    );
  }

  const existing = await User.findOne({ $or: [{ studentId }, { email: normalizedEmail }] });
  if (existing) {
    throw ApiError.conflict('An account with this studentId or email already exists');
  }

  // Ticket proves the student authenticated with KMITL; submitted identity
  // must still match what SSO attested.
  let attested;
  try {
    attested = kmitlOidc.verifySsoTicket(ssoTicket);
  } catch {
    res.clearCookie(SSO_TICKET_COOKIE, clearSsoTicketCookieOptions());
    throw ApiError.badRequest(
      'KMITL SSO ticket is invalid or expired, please sign in with KMITL again',
    );
  }
  if (attested.studentId !== studentId || attested.email !== normalizedEmail) {
    throw ApiError.badRequest('Submitted identity does not match the KMITL SSO login');
  }
  if (attested.year != null && Number(year) !== attested.year) {
    throw ApiError.badRequest('Submitted year of study does not match the KMITL SSO login');
  }
  const verification = { verified: true, method: 'sso' };

  let canonical;
  try {
    canonical = normalizeFacultyMajor(faculty, major);
  } catch (err) {
    throw ApiError.badRequest('Invalid faculty or major', {
      reason: err.message,
      faculty,
      major,
    });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    studentId,
    email: normalizedEmail,
    passwordHash,
    faculty: canonical.faculty,
    major: canonical.major,
    year,
    alias: generateAlias(),
    kmitlVerified: true,
    verificationMethod: verification.method,
  });

  res.clearCookie(SSO_TICKET_COOKIE, clearSsoTicketCookieOptions());
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
  if (!user) {
    securityLog('auth_failure', { reason: 'unknown_user', studentId, ip: req.ip });
    throw ApiError.unauthorized('Invalid student ID or password');
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    securityLog('auth_failure', { reason: 'bad_password', studentId, ip: req.ip });
    throw ApiError.unauthorized('Invalid student ID or password');
  }

  if (!user.kmitlVerified) {
    securityLog('auth_failure', { reason: 'unverified', studentId, ip: req.ip });
    throw ApiError.forbidden('Only verified KMITL students can sign in');
  }

  const accessToken = await issueSession(res, user);
  securityLog('auth_success', { userId: user._id.toString(), studentId, ip: req.ip });

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
  if (!user.kmitlVerified) {
    throw ApiError.forbidden('Only verified KMITL students can use this app');
  }

  const isExpired = !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now();
  const isMismatch = user.refreshTokenHash !== hashToken(token);

  if (isExpired || isMismatch) {
    // Possible token reuse/theft — revoke the session entirely.
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();
    if (isMismatch) {
      securityLog('refresh_reuse', { userId: user._id.toString(), ip: req.ip });
    }
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
 * then either logs the student in (existing account) or sets a short-lived
 * httpOnly SSO ticket cookie for registration (new account). Always redirects
 * back to the client, encoding errors in the query string so the UI can
 * display them.
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

    // Re-map legacy English / broad-major labels onto the Thai catalog so
    // returning SSO users stop splitting stats by language.
    const remapped = normalizeFacultyMajor(user.faculty, user.major, { soft: true });
    if (remapped.ok && (remapped.faculty !== user.faculty || remapped.major !== user.major)) {
      user.faculty = remapped.faculty;
      user.major = remapped.major;
    } else if (!remapped.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[kmitlSso] Could not normalize faculty/major for ${user.studentId}: ${remapped.reason}`
      );
    }

    await issueSession(res, user);
    return res.redirect(`${clientUrl}/?sso=success`);
  }

  // New student: set a verified-identity ticket cookie, then send them to
  // finish registration (ticket never appears in the URL or response body).
  const ticket = kmitlOidc.createSsoTicket(identity);
  res.cookie(SSO_TICKET_COOKIE, ticket, ssoTicketCookieOptions());
  return res.redirect(`${clientUrl}/register`);
});

/**
 * GET /api/auth/sso-prefill
 * Returns the identity attested by the httpOnly SSO ticket cookie so the
 * register form can prefill studentId/email/year without reading the JWT
 * in the browser.
 */
const ssoPrefill = asyncHandler(async (req, res) => {
  const ticket = req.cookies?.[SSO_TICKET_COOKIE];
  if (!ticket) {
    throw ApiError.badRequest('No KMITL SSO registration session found');
  }

  let attested;
  try {
    attested = kmitlOidc.verifySsoTicket(ticket);
  } catch {
    res.clearCookie(SSO_TICKET_COOKIE, clearSsoTicketCookieOptions());
    throw ApiError.badRequest('KMITL SSO ticket is invalid or expired, please sign in with KMITL again');
  }

  res.json({
    success: true,
    data: {
      studentId: attested.studentId,
      email: attested.email,
      year: attested.year,
    },
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
  ssoPrefill,
};
