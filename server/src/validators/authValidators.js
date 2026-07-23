const { body } = require('express-validator');

const registerValidator = [
  body('studentId')
    .trim()
    .matches(/^\d{8}$/)
    .withMessage('studentId must be exactly 8 digits'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('email must be a valid email address')
    .bail()
    .custom((value, { req }) => value === `${req.body.studentId}@kmitl.ac.th`)
    .withMessage('email must be <studentId>@kmitl.ac.th'),
  body('faculty').trim().notEmpty().withMessage('faculty is required'),
  body('major').trim().notEmpty().withMessage('major is required'),
  body('year')
    .isInt({ min: 1, max: 8 })
    .withMessage('year must be an integer between 1 and 8'),
];

module.exports = {
  registerValidator,
};
