const { body, param, query } = require('express-validator');
const { MOOD_TYPES } = require('../config/constants');

const createMoodValidator = [
  body('moodType')
    .trim()
    .isIn(MOOD_TYPES)
    .withMessage(`moodType must be one of: ${MOOD_TYPES.join(', ')}`),
  body('message')
    .trim()
    .isLength({ min: 1, max: 280 })
    .withMessage('message must be between 1 and 280 characters'),
];

const updateMoodValidator = [
  param('id').isMongoId().withMessage('invalid mood id'),
  body('moodType')
    .optional()
    .trim()
    .isIn(MOOD_TYPES)
    .withMessage(`moodType must be one of: ${MOOD_TYPES.join(', ')}`),
  body('message')
    .optional()
    .trim()
    .isLength({ min: 1, max: 280 })
    .withMessage('message must be between 1 and 280 characters'),
];

const moodIdValidator = [param('id').isMongoId().withMessage('invalid mood id')];

const listMoodsValidator = [
  query('moodType').optional().trim().isIn(MOOD_TYPES).withMessage('invalid moodType filter'),
  query('faculty').optional().trim().isString(),
  query('major').optional().trim().isString(),
  query('dateFrom').optional().isISO8601().withMessage('dateFrom must be an ISO8601 date'),
  query('dateTo').optional().isISO8601().withMessage('dateTo must be an ISO8601 date'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
];

module.exports = {
  createMoodValidator,
  updateMoodValidator,
  moodIdValidator,
  listMoodsValidator,
};
