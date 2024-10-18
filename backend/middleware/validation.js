const { body } = require('express-validator');

const createAdminValidation = [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').isMobilePhone(),
];

const guestOrderValidation = [
  body('name').isLength({ min: 2 }).trim().escape(),
  body('phone').isMobilePhone(),
  body('address_line').notEmpty().trim().escape(),
  body('city').notEmpty().trim().escape(),
  body('state').notEmpty().trim().escape(),
  body('country').notEmpty().trim().escape(),
  body('postal_code').notEmpty().trim().escape(),
  body('total_price').isFloat({ min: 0 }),
  body('delivery_type').isIn(['pickup', 'delivery']),
  body('items').isArray({ min: 1 }),
];

module.exports = { createAdminValidation, guestOrderValidation };