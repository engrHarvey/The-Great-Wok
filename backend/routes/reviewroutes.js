const express = require('express');
const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');  // Import the pg Pool
const router = express.Router();

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },  // Ensure SSL is enabled for production
});

// Utility function to handle errors
const handleError = (err, res, message = 'Internal server error') => {
  console.error(message, err);
  res.status(500).json({ error: message });
};

// Middleware for token validation (optional depending on your authentication setup)
const validateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Add JWT validation here if necessary
  next();
};

/* ----------------- Review Routes ----------------- */

// 1. Create a new review (POST /api/reviews)
router.post('/reviews', async (req, res) => {
  const { user_id, dish_id, rating, comment } = req.body;

  try {
    // Log dish_id to debug the issue
    console.log("Creating review for dish_id:", dish_id);
    
    // Ensure dish_id exists in the dishes table before inserting the review
    const dishExists = await pool.query('SELECT * FROM dishes WHERE dish_id = $1', [dish_id]);
    if (dishExists.rows.length === 0) {
      return res.status(400).json({ error: "Invalid dish_id. The dish does not exist." });
    }
    
    const result = await pool.query(
      'INSERT INTO reviews (user_id, dish_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, dish_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create review", err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// 2. Get all reviews for a specific dish (GET /api/reviews/:dish_id)
router.get('/reviews/:dish_id', async (req, res) => {
  const dish_id = parseInt(req.params.dish_id, 10);

  if (isNaN(dish_id)) {
    return res.status(400).json({ error: 'Invalid dish ID' });
  }

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE dish_id = $1', [dish_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this dish' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch reviews');
  }
});

// 3. Get all reviews by a specific user (GET /api/reviews/user/:user_id)
router.get('/reviews/user/:user_id', async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);

  if (isNaN(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query('SELECT * FROM reviews WHERE user_id = $1', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this user' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch reviews');
  }
});

// 4. Update a review (PUT /api/reviews/:review_id)
router.put(
  '/reviews/:review_id',
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res) => {
    const review_id = parseInt(req.params.review_id, 10);

    if (isNaN(review_id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    const { rating, comment } = req.body;

    try {
      const result = await pool.query(
        `UPDATE reviews 
         SET rating = COALESCE($1, rating), comment = COALESCE($2, comment), updated_at = NOW() 
         WHERE review_id = $3 RETURNING *`,
        [rating, comment, review_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to update review');
    }
  }
);

// 5. Delete a review (DELETE /api/reviews/:review_id)
router.delete('/reviews/:review_id', async (req, res) => {
  const review_id = parseInt(req.params.review_id, 10);

  if (isNaN(review_id)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const result = await pool.query('DELETE FROM reviews WHERE review_id = $1 RETURNING *', [review_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    handleError(err, res, 'Failed to delete review');
  }
});

// reviewroutes.js
router.get('/reviews', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.review_id, 
        r.rating, 
        r.comment, 
        d.dish_name, 
        u.username 
      FROM reviews r
      JOIN dishes d ON r.dish_id = d.dish_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
