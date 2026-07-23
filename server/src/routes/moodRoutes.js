const express = require('express');
const moodController = require('../controllers/moodController');
const authenticate = require('../middleware/authenticate');
const validate = require('../validators/validate');
const {
  createMoodValidator,
  updateMoodValidator,
  moodIdValidator,
  listMoodsValidator,
} = require('../validators/moodValidators');

const router = express.Router();

/**
 * @openapi
 * /api/moods:
 *   post:
 *     summary: Pin a new anonymous mood note
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMoodRequest'
 *     responses:
 *       201:
 *         description: Mood created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoodResponse' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   get:
 *     summary: List mood notes with filters + pagination
 *     tags: [Moods]
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
 *         description: Paginated list of moods
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoodListResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', authenticate, createMoodValidator, validate, moodController.createMood);
router.get('/', authenticate, listMoodsValidator, validate, moodController.listMoods);

/**
 * @openapi
 * /api/moods/{id}:
 *   get:
 *     summary: Get a single mood note
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/MoodId'
 *     responses:
 *       200:
 *         description: Mood found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoodResponse' }
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Mood not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   patch:
 *     summary: Update a mood note (owner only)
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/MoodId'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMoodRequest'
 *     responses:
 *       200:
 *         description: Mood updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MoodResponse' }
 *       403:
 *         description: Not the owner
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Mood not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   delete:
 *     summary: Delete a mood note (owner or admin)
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/MoodId'
 *     responses:
 *       200:
 *         description: Mood deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { nullable: true, example: null }
 *                 message: { type: string, example: "Mood deleted" }
 *       403:
 *         description: Not the owner or admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Mood not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id', authenticate, moodIdValidator, validate, moodController.getMood);
router.patch('/:id', authenticate, updateMoodValidator, validate, moodController.updateMood);
router.delete('/:id', authenticate, moodIdValidator, validate, moodController.deleteMood);

module.exports = router;
