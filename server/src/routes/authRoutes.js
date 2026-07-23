const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const requireSameOrigin = require('../middleware/requireSameOrigin');
const { authStrictLimiter } = require('../middleware/rateLimit');
const validate = require('../validators/validate');
const { registerValidator } = require('../validators/authValidators');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new student account (SSO ticket cookie required; no password)
 *     description: Requires httpOnly cookie `ssoTicket` from KMITL SSO callback, plus same-origin Origin header.
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/OriginHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created, session started (sets refreshToken cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/UserProfile' }
 *                     accessToken: { type: string }
 *       400:
 *         description: Missing/invalid SSO ticket, identity mismatch, or validation failure
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Account already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  '/register',
  authStrictLimiter,
  requireSameOrigin,
  registerValidator,
  validate,
  authController.register
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Rotate refresh token cookie and issue a new access token
 *     description: Requires httpOnly cookie `refreshToken` and same-origin Origin header.
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/OriginHeader'
 *     responses:
 *       200:
 *         description: New access token issued (refresh cookie rotated)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AccessTokenResponse' }
 *       401:
 *         description: Missing/invalid/expired refresh token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/refresh', authStrictLimiter, requireSameOrigin, authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Revoke refresh token and clear the cookie
 *     description: Requires same-origin Origin header. May return KMITL logout URL.
 *     tags: [Auth]
 *     parameters:
 *       - $ref: '#/components/parameters/OriginHeader'
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Logged out" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     kmitlLogoutUrl: { type: string, nullable: true }
 */
router.post('/logout', requireSameOrigin, authController.logout);

/**
 * @openapi
 * /api/auth/kmitl:
 *   get:
 *     summary: Start KMITL SSO login (browser redirect)
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to sso.kmitl.ac.th
 *       400:
 *         description: SSO not configured on this server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/kmitl', authController.kmitlSsoStart);

/**
 * @openapi
 * /api/auth/kmitl/callback:
 *   get:
 *     summary: KMITL SSO callback (exchanges code, redirects to client)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/UserProfile' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/me', authenticate, authController.me);

/**
 * @openapi
 * /api/auth/sso-prefill:
 *   get:
 *     summary: Prefill register form from the httpOnly SSO ticket cookie
 *     description: Requires cookie `ssoTicket` set after first-time KMITL SSO when no account exists yet.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Attested studentId, email, and optional year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId: { type: string, example: "65010001" }
 *                     email: { type: string, example: "65010001@kmitl.ac.th" }
 *                     year: { type: integer, nullable: true, example: 2 }
 *       400:
 *         description: Missing, invalid, or expired SSO ticket cookie
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/sso-prefill', authController.ssoPrefill);

module.exports = router;
