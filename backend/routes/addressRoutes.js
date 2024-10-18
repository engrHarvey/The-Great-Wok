const express = require('express');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware for error handling
const handleError = (err, res, message = 'Internal server error') => {
  console.error(message, err);
  res.status(500).json({ error: message });
};

/* -------------------- ADDRESS ROUTES -------------------- */

// 1. Get all addresses for a user
router.get('/addresses/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY address_id ASC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch addresses for the user.');
  }
});

// 2. Get a specific address by its ID
router.get('/address/:address_id', async (req, res) => {
  const addressId = parseInt(req.params.address_id, 10);

  if (isNaN(addressId)) {
    return res.status(400).json({ error: 'Invalid address ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query('SELECT * FROM addresses WHERE address_id = $1', [addressId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to fetch the address.');
  }
});

// 3. Create a new address for a user
router.post(
  '/address',
  [
    body('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    body('address_line').notEmpty().withMessage('Address line is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('postal_code').notEmpty().withMessage('Postal code is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, address_line, city, state, country, postal_code } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO addresses (user_id, address_line, city, state, country, postal_code)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [user_id, address_line, city, state, country, postal_code]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to create a new address.');
    }
  }
);

// 4. Update an existing address by its ID
router.put(
  '/address/:address_id',
  [
    body('address_line').optional().notEmpty().withMessage('Address line is required'),
    body('city').optional().notEmpty().withMessage('City is required'),
    body('state').optional().notEmpty().withMessage('State is required'),
    body('country').optional().notEmpty().withMessage('Country is required'),
    body('postal_code').optional().notEmpty().withMessage('Postal code is required'),
  ],
  async (req, res) => {
    const addressId = parseInt(req.params.address_id, 10);
    if (isNaN(addressId)) {
      return res.status(400).json({ error: 'Invalid address ID provided. ID must be a number.' });
    }

    const { address_line, city, state, country, postal_code } = req.body;

    try {
      const result = await pool.query(
        `UPDATE addresses SET 
          address_line = COALESCE($1, address_line), 
          city = COALESCE($2, city), 
          state = COALESCE($3, state), 
          country = COALESCE($4, country), 
          postal_code = COALESCE($5, postal_code), 
          updated_at = NOW()
         WHERE address_id = $6 RETURNING *`,
        [address_line, city, state, country, postal_code, addressId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found.' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to update the address.');
    }
  }
);

// 5. Delete an address by its ID
router.delete('/address/:address_id', async (req, res) => {
  const addressId = parseInt(req.params.address_id, 10);

  if (isNaN(addressId)) {
    return res.status(400).json({ error: 'Invalid address ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query('DELETE FROM addresses WHERE address_id = $1 RETURNING *', [addressId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found.' });
    }

    res.status(200).json({ message: 'Address deleted successfully.' });
  } catch (err) {
    handleError(err, res, 'Failed to delete the address.');
  }
});

module.exports = router;
