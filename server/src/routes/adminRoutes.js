const express = require('express');
const moodController = require('../controllers/moodController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../validators/validate');
const { listMoodsValidator } = require('../validators/moodValidators');

const router = express.Router();

/**
 * @openapi
 * /api/admin/moods:
 *   get:
 *     summary: Admin moderation list — same filters as the public feed, admin-only
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: moodType
 *         schema: { type: string, enum: [happy, calm, tired, stressed, sad, excited, angry] }
 *       - in: query
 *         name: faculty
 *         schema: { type: string }
 *       - in: query
 *         name: major
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated moderation list }
 *       401: { description: Not authenticated }
 *       403: { description: Not an admin }
 */
router.get('/moods', authenticate, authorize('admin'), listMoodsValidator, validate, moodController.listMoods);

module.exports = router;
