const express = require('express');
const authRoutes = require('./authRoutes');
const moodRoutes = require('./moodRoutes');
const statsRoutes = require('./statsRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     status: { type: string, example: "ok" }
 */
router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/moods', moodRoutes);
router.use('/stats', statsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
