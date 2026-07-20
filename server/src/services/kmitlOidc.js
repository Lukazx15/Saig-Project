const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { inferYearOfStudyFromStudentId } = require('./kmitlVerify');

/**
 * KMITL SSO via OpenID Connect (Keycloak realm "kmitl").
 * Client credentials are self-service issued at
 * https://developer.kmitl.ac.th/console/sso
 */

let discoveryCache = null;
let discoveryFetchedAt = 0;
const DISCOVERY_TTL_MS = 60 * 60 * 1000;

function isEnabled() {
  return Boolean(env.oidc.clientId && env.oidc.clientSecret);
}

async function getDiscovery() {
  const fresh = discoveryCache && Date.now() - discoveryFetchedAt < DISCOVERY_TTL_MS;
  if (fresh) return discoveryCache;

  const url = `${env.oidc.issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`OIDC discovery failed with status ${response.status}`);
  }
  discoveryCache = await response.json();
  discoveryFetchedAt = Date.now();
  return discoveryCache;
}

/**
 * The `state` parameter is a short-lived signed JWT so the callback can be
 * verified statelessly (no session store needed).
 */
function createState() {
  return jwt.sign({ nonce: crypto.randomUUID(), purpose: 'kmitl-sso' }, env.jwt.accessSecret, {
    expiresIn: '10m',
  });
}

function verifyState(state) {
  const payload = jwt.verify(state, env.jwt.accessSecret);
  if (payload.purpose !== 'kmitl-sso') throw new Error('Invalid state purpose');
  return payload;
}

async function buildAuthorizationUrl() {
  const discovery = await getDiscovery();
  const state = createState();
  const params = new URLSearchParams({
    client_id: env.oidc.clientId,
    redirect_uri: env.oidc.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    // Force the KMITL login form every time. Without this, an existing
    // SSO cookie at sso.kmitl.ac.th silently re-authenticates the user
    // even after they logged out of Mood of the Major.
    prompt: 'login',
  });
  return `${discovery.authorization_endpoint}?${params.toString()}`;
}

/**
 * RP-initiated logout URL for KMITL Keycloak.
 * No post_logout_redirect_uri — the client loads this in a hidden iframe
 * so the IdP cookie is cleared without navigating the user away.
 */
async function buildLogoutUrl() {
  if (!isEnabled()) return null;
  const discovery = await getDiscovery();
  if (!discovery.end_session_endpoint) return null;

  const params = new URLSearchParams({
    client_id: env.oidc.clientId,
  });
  return `${discovery.end_session_endpoint}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const discovery = await getDiscovery();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.oidc.redirectUri,
    client_id: env.oidc.clientId,
    client_secret: env.oidc.clientSecret,
  });

  const response = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Token exchange failed (${response.status}): ${text.slice(0, 200)}`);
  }
  return response.json();
}

async function fetchUserInfo(accessToken) {
  const discovery = await getDiscovery();
  const response = await fetch(discovery.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Userinfo request failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Extracts the KMITL identity from OIDC userinfo claims. Student emails are
 * `<8-digit-studentId>@kmitl.ac.th`, so the studentId can be derived from
 * the email/username claim. Year of study is not in userinfo — it is
 * estimated from the student ID entry-year prefix.
 */
function extractIdentity(userInfo) {
  const email = String(userInfo.email || userInfo.preferred_username || '').toLowerCase().trim();
  const name = String(userInfo.name || '').trim();
  const match = email.match(/^(\d{8})@kmitl\.ac\.th$/);
  const studentId = match ? match[1] : null;
  return {
    email,
    name,
    studentId,
    year: studentId ? inferYearOfStudyFromStudentId(studentId) : null,
  };
}

/**
 * Short-lived signed ticket handed to the register page when an
 * SSO-verified student does not have a local account yet. Registration
 * presents it back so the server can trust studentId/email/year without a
 * format re-check.
 */
function createSsoTicket({ studentId, email, year }) {
  return jwt.sign(
    { studentId, email, year: year ?? null, purpose: 'kmitl-sso-register' },
    env.jwt.accessSecret,
    { expiresIn: '15m' }
  );
}

function verifySsoTicket(ticket) {
  const payload = jwt.verify(ticket, env.jwt.accessSecret);
  if (payload.purpose !== 'kmitl-sso-register') throw new Error('Invalid ticket purpose');
  const year =
    typeof payload.year === 'number' && Number.isInteger(payload.year) ? payload.year : null;
  return { studentId: payload.studentId, email: payload.email, year };
}

module.exports = {
  isEnabled,
  buildAuthorizationUrl,
  buildLogoutUrl,
  verifyState,
  exchangeCodeForTokens,
  fetchUserInfo,
  extractIdentity,
  createSsoTicket,
  verifySsoTicket,
};
