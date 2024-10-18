const express = require('express');
const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware to verify JWT token
const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided, access denied' });

  // Split 'Bearer <token>' and extract the token part
  const actualToken = token.split(' ')[1]; // Extract only the token
  console.log(`Extracted Token: ${actualToken}`);

  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log(`Decoded JWT: ${JSON.stringify(decoded)}`);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Failed to authenticate token', err);
    return res.status(403).json({ error: 'Failed to authenticate token' });
  }
};

// Middleware to verify Admin role
const verifyAdmin = (req, res, next) => {
  console.log(`User role: ${req.user?.role}`); // Log the user role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

/* -------------------- DISH ROUTES -------------------- */

// 1. Get all dishes (Public)
router.get('/dishes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dishes ORDER BY created_at DESC');
    res.status(200).json(result.rows); // Send only the rows array
  } catch (err) {
    console.error('Failed to fetch dishes:', err);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Get a single dish by ID (Public)
router.get('/dishes/:id', async (req, res) => {
  const dishId = parseInt(req.params.id);
  if (isNaN(dishId)) {
    return res.status(400).json({ error: "Invalid dish ID provided. ID must be a number." });
  }

  // Continue processing with a valid ID
  const result = await pool.query('SELECT * FROM dishes WHERE dish_id = $1', [dishId]);
  res.json(result.rows);
});

// 3. Create a new dish (Admin Only)
// Ensure correct order of middlewares
router.post(
  '/dishes',
  verifyJWT,      // Verify JWT first
  verifyAdmin,    // Then verify Admin role
  [
    body('dish_name').isLength({ min: 3 }).withMessage('Dish name must be at least 3 characters long'),
    body('price').isDecimal().withMessage('Price must be a valid decimal number'),
    body('category_id').optional().isInt().withMessage('Category ID must be a valid integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dish_name, description, price, category_id, image_url, is_available } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO dishes (dish_name, description, price, category_id, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [dish_name, description, price, category_id || null, image_url, is_available || true]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Failed to add dish:', err);
      res.status(500).json({ error: 'Failed to add dish' });
    }
  }
);

// Update a dish by ID (Admin Only)
router.put('/dishes/:id', verifyJWT, verifyAdmin, [
  body('dish_name').optional().isLength({ min: 3 }).withMessage('Dish name must be at least 3 characters long.'),
  body('price').optional().isDecimal().withMessage('Price must be a valid decimal number.'),
  body('category_id').optional().isInt().withMessage('Category ID must be a valid integer.'),
  body('image_url').optional().isURL().withMessage('Image URL must be a valid URL.'),
], async (req, res) => {
  // Log the incoming request for better visibility
  console.log('Incoming PUT Request Data:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const dishId = parseInt(req.params.id, 10); // Ensure dishId is parsed as an integer

  // Check if dishId is a valid number
  if (isNaN(dishId)) {
    return res.status(400).json({ error: 'Invalid dish ID provided. ID must be a number.' });
  }

  const { dish_name, description, price, category_id, image_url, is_available } = req.body;

  // Log the parsed values for debugging
  console.log('Parsed Values:', {
    dish_name,
    description,
    price,
    category_id,
    image_url,
    is_available,
  });

  try {
    // Updated query with additional logging
    const result = await pool.query(
      'UPDATE dishes SET dish_name = COALESCE($1, dish_name), description = COALESCE($2, description), price = COALESCE($3, price), category_id = COALESCE($4, category_id), image_url = COALESCE($5, image_url), is_available = COALESCE($6, is_available), updated_at = NOW() WHERE dish_id = $7 RETURNING *',
      [dish_name, description, price, category_id, image_url, is_available, dishId]
    );

    if (result.rows.length === 0) {
      console.log('No dish found with this ID');
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Log successful update
    console.log('Dish updated successfully:', result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update dish:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Delete a dish by ID (Admin Only)
router.delete('/dishes/:id', verifyJWT, verifyAdmin, async (req, res) => {
  const dishId = parseInt(req.params.id);

  try {
    const result = await pool.query('DELETE FROM dishes WHERE dish_id = $1 RETURNING *', [dishId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Dish not found.' });
    }

    res.status(200).json({ success: true, message: 'Dish deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete dish:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
