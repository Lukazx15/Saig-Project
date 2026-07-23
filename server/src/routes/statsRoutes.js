const express = require('express');
const statsController = require('../controllers/statsController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get mood distribution, faculty/major breakdown, and dominant campus mood
 *     tags: [Stats]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated mood statistics
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StatsResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', authenticate, statsController.getStats);

module.exports = router;
