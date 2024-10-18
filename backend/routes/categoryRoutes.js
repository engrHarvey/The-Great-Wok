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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Failed to authenticate token' });
  }
};

// Middleware to verify Admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

// Centralized Error Handling Middleware
const handleError = (err, res, message = 'Internal server error') => {
  console.error(message, err);
  res.status(500).json({ error: message });
};

/* -------------------- CATEGORY ROUTES -------------------- */

// 1. Get all categories (Public)
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch categories');
  }
});

// 2. Add a new category (Admin Only)
router.post('/categories', verifyJWT, verifyAdmin, async (req, res) => {
  const { category_name } = req.body;

  // Validate the category name
  if (!category_name || category_name.trim().length < 3) {
    return res.status(400).json({ error: 'Category name must be at least 3 characters long' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
      [category_name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to add category');
  }
});

// 3. Retrieve a single category by ID (Public)
router.get('/categories/:id', async (req, res) => {
  const categoryId = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to retrieve category');
  }
});

// 4. Update a category by ID (Admin Only)
router.put(
  '/categories/:id',
  verifyJWT,
  verifyAdmin,
  body('category_name').isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = parseInt(req.params.id);
    const { category_name } = req.body;

    try {
      const result = await pool.query(
        'UPDATE categories SET category_name = $1, updated_at = NOW() WHERE category_id = $2 RETURNING *',
        [category_name.trim(), categoryId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to update category');
    }
  }
);

// 5. Delete a category by ID (Admin Only)
router.delete('/categories/:id', verifyJWT, verifyAdmin, async (req, res) => {
  const categoryId = parseInt(req.params.id);

  try {
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    handleError(err, res, 'Failed to delete category');
  }
});

module.exports = router;
