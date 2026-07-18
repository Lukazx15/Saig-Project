const express = require('express');
const statsController = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get mood distribution stats (overall, by faculty, by major) and the dominant campus mood
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Aggregated mood statistics }
 *       401: { description: Not authenticated }
 */
router.get('/', authenticate, statsController.getStats);

module.exports = router;
