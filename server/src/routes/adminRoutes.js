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
 *     summary: Admin moderation list — same filters as the public feed
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/MoodTypeQuery'
 *       - $ref: '#/components/parameters/FacultyQuery'
 *       - $ref: '#/components/parameters/MajorQuery'
 *       - $ref: '#/components/parameters/DateFromQuery'
 *       - $ref: '#/components/parameters/DateToQuery'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Paginated moderation list
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoodListResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/moods', authenticate, authorize('admin'), listMoodsValidator, validate, moodController.listMoods);

module.exports = router;
