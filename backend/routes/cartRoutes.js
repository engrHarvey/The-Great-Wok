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

/* -------------------- CART ROUTES -------------------- */

// 1. Get all cart items for a user
// Modify the cart retrieval to include price in the SELECT query
router.get('/cart/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        cart_items.cart_item_id, 
        cart_items.user_id, 
        cart_items.dish_id, 
        cart_items.quantity, 
        dishes.dish_name, 
        dishes.price  -- Include the price here
      FROM cart_items
      LEFT JOIN dishes ON cart_items.dish_id = dishes.dish_id
      WHERE cart_items.user_id = $1
      ORDER BY cart_items.cart_item_id ASC
    `, [userId]);

    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch cart items for the user');
  }
});

// 2. Get a single cart item by its ID
router.get('/cart/item/:cart_item_id', async (req, res) => {
  const cartItemId = parseInt(req.params.cart_item_id, 10);

  if (isNaN(cartItemId)) {
    return res.status(400).json({ error: 'Invalid cart item ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query('SELECT * FROM cart_items WHERE cart_item_id = $1', [cartItemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to fetch the cart item');
  }
});

// 3. Create a new cart item for a user or update if item exists
router.post(
  '/cart',
  [
    body('user_id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    body('dish_id').isInt().withMessage('Dish ID must be a valid integer'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array()); // Log validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, dish_id, quantity = 1 } = req.body;

    try {
      // Check if the item already exists in the cart
      const existingCartItem = await pool.query(
        'SELECT * FROM cart_items WHERE user_id = $1 AND dish_id = $2',
        [user_id, dish_id]
      );

      if (existingCartItem.rows.length > 0) {
        // Item exists, update quantity
        const newQuantity = existingCartItem.rows[0].quantity + quantity;
        const updateResult = await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *',
          [newQuantity, existingCartItem.rows[0].cart_item_id]
        );
        return res.status(200).json(updateResult.rows[0]);
      }

      // Item does not exist, insert a new cart item
      const result = await pool.query(
        'INSERT INTO cart_items (user_id, dish_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user_id, dish_id, quantity]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to create or update cart item');
    }
  }
);

// 4. Update the quantity of an existing cart item
router.put(
  '/cart/item/:cart_item_id',
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  async (req, res) => {
    const cartItemId = parseInt(req.params.cart_item_id, 10);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ error: 'Invalid cart item ID provided. ID must be a number.' });
    }

    const { quantity } = req.body;

    try {
      const result = await pool.query(
        'UPDATE cart_items SET quantity = COALESCE($1, quantity) WHERE cart_item_id = $2 RETURNING *',
        [quantity, cartItemId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      handleError(err, res, 'Failed to update cart item');
    }
  }
);

// 5. Delete a cart item by its ID
router.delete('/cart/item/:cart_item_id', async (req, res) => {
  const cartItemId = parseInt(req.params.cart_item_id, 10);

  if (isNaN(cartItemId)) {
    return res.status(400).json({ error: 'Invalid cart item ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query('DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *', [cartItemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    handleError(err, res, 'Failed to delete cart item');
  }
});

module.exports = router;
