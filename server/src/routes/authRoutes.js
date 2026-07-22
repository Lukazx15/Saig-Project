const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../validators/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new student account (requires KMITL SSO ticket cookie)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, email, faculty, major, year, password]
 *             properties:
 *               studentId: { type: string, example: "65010001" }
 *               email: { type: string, example: "65010001@kmitl.ac.th" }
 *               faculty: { type: string, example: "Engineering" }
 *               major: { type: string, example: "Computer Engineering" }
 *               year: { type: integer, example: 2 }
 *               password: { type: string, example: "SuperSecret123" }
 *     responses:
 *       201:
 *         description: Account created, session started
 *       400:
 *         description: Missing/invalid SSO ticket, identity mismatch, or validation failure
 *       409:
 *         description: Account already exists
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with studentId + password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, password]
 *             properties:
 *               studentId: { type: string, example: "65010001" }
 *               password: { type: string, example: "SuperSecret123" }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Rotate the refresh token (httpOnly cookie) and issue a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Missing/invalid/expired refresh token
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Revoke the current refresh token and clear the cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /api/auth/kmitl:
 *   get:
 *     summary: Start KMITL SSO login (redirects to the KMITL OIDC login page)
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to sso.kmitl.ac.th
 *       400:
 *         description: SSO not configured on this server
 */
router.get('/kmitl', authController.kmitlSsoStart);

/**
 * @openapi
 * /api/auth/kmitl/callback:
 *   get:
 *     summary: KMITL SSO redirect target (exchanges code, then redirects to the client)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *     responses:
 *       302:
 *         description: Redirect to the client (logged in, register with SSO cookie, or error)
 */
router.get('/kmitl/callback', authController.kmitlSsoCallback);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, authController.me);

/**
 * @openapi
 * /api/auth/sso-prefill:
 *   get:
 *     summary: Prefill register form from the httpOnly SSO ticket cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Attested studentId, email, and optional year
 *       400:
 *         description: Missing, invalid, or expired SSO ticket cookie
 */
router.get('/sso-prefill', authController.ssoPrefill);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Verify studentId + email and set a password-reset cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, email]
 *             properties:
 *               studentId: { type: string, example: "65010001" }
 *               email: { type: string, example: "65010001@kmitl.ac.th" }
 *     responses:
 *       200:
 *         description: Reset session cookie set (token not returned in body)
 *       400:
 *         description: Identity not found or invalid
 */
router.post(
  '/forgot-password',
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Set a new password using the httpOnly reset cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, example: "NewSecret123" }
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid or expired reset session
 */
router.post(
  '/reset-password',
  resetPasswordValidator,
  validate,
  authController.resetPassword
);

module.exports = router;
