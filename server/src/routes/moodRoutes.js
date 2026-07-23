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
 *             type: object
 *             required: [moodType, message]
 *             properties:
 *               moodType: { type: string, enum: [happy, calm, tired, stressed, sad, excited, angry] }
 *               message: { type: string, maxLength: 280 }
 *     responses:
 *       201: { description: Mood created }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 *   get:
 *     summary: List mood notes with filters + pagination
 *     tags: [Moods]
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
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of moods }
 *       401: { description: Not authenticated }
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Mood found }
 *       401: { description: Not authenticated }
 *       404: { description: Mood not found }
 *   patch:
 *     summary: Update a mood note (owner only)
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moodType: { type: string, enum: [happy, calm, tired, stressed, sad, excited, angry] }
 *               message: { type: string, maxLength: 280 }
 *     responses:
 *       200: { description: Mood updated }
 *       403: { description: Not the owner }
 *       404: { description: Mood not found }
 *   delete:
 *     summary: Delete a mood note (owner or admin)
 *     tags: [Moods]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Mood deleted }
 *       403: { description: Not the owner or admin }
 *       404: { description: Mood not found }
 */
router.get('/:id', authenticate, moodIdValidator, validate, moodController.getMood);
router.patch('/:id', authenticate, updateMoodValidator, validate, moodController.updateMood);
router.delete('/:id', authenticate, moodIdValidator, validate, moodController.deleteMood);

module.exports = router;
