const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { Pool } = require('pg');

// Initialize PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Utility function to handle errors
const handleError = (err, res, message = 'Internal server error') => {
  console.error(message, err);
  res.status(500).json({ error: message });
};

// Middleware for token validation
const validateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // You can add JWT token verification here, or assume token is valid for now.
  next();
};

/* -------------------- ORDER ROUTES -------------------- */

// 1. Place a new order
router.post(
  '/orders',
  validateToken,
  [
    body('user_id').isInt({ min: 1 }).withMessage('User ID must be a valid integer'),
    body('total_price').isFloat({ min: 0.01 }).withMessage('Total price must be a valid amount'),
    body('address_id').isInt({ min: 1 }).withMessage('Address ID must be a valid integer'),
    body('cart_items').isArray().withMessage('Cart items must be an array of items'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, total_price, address_id, cart_items } = req.body;

    try {
      // 1. Create a new order
      const orderResult = await pool.query(
        `INSERT INTO orders (user_id, total_price, address_id, placed_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [user_id, total_price, address_id]
      );

      const newOrder = orderResult.rows[0];
      const orderId = newOrder.order_id;

      // 2. Add items to 'order_items' table
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, dish_id, quantity, price)
        VALUES ($1, $2, $3, $4)
      `;

      const orderItemsPromises = cart_items.map((item) =>
        pool.query(orderItemsQuery, [orderId, item.dish_id, item.quantity, item.price])
      );

      await Promise.all(orderItemsPromises);

      res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
    } catch (err) {
      handleError(err, res, 'Failed to place order');
    }
  }
);

// 2. Get all orders for a user
router.get('/orders/user/:user_id', validateToken, async (req, res) => {
  const userId = parseInt(req.params.user_id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID provided' });
  }

  try {
    const ordersResult = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC', [userId]);

    if (ordersResult.rows.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(ordersResult.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch user orders');
  }
});

// 3. Get details of a specific order
router.get('/orders/:order_id', validateToken, async (req, res) => {
  const orderId = parseInt(req.params.order_id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID provided' });
  }

  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Fetch order items
    const orderItemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

    res.status(200).json({ order, items: orderItemsResult.rows });
  } catch (err) {
    handleError(err, res, 'Failed to fetch order details');
  }
});

// 4. Get all items for a specific order
router.get('/orders/:order_id/items', async (req, res) => {
  const { order_id } = req.params;

  try {
    const query = `
      SELECT 
        oi.order_item_id,
        oi.order_id,
        oi.dish_id,
        d.dish_name,
        oi.quantity,
        oi.price,
        oi.status
      FROM order_items oi
      LEFT JOIN dishes d ON oi.dish_id = d.dish_id
      WHERE oi.order_id = $1;
    `;

    const result = await pool.query(query, [order_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No order items found for this order.' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch order items');
  }
});

// Route to get all orders (Admin view)
router.get('/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT 
        orders.order_id, 
        orders.total_price, 
        orders.status, 
        orders.delivery_type, 
        orders.placed_at, 
        users.username, 
        users.email, 
        addresses.address_line, 
        addresses.city, 
        addresses.state, 
        addresses.country, 
        addresses.postal_code
      FROM orders
      LEFT JOIN users ON orders.user_id = users.user_id
      LEFT JOIN addresses ON orders.address_id = addresses.address_id
      ORDER BY orders.placed_at DESC
    `);

    res.status(200).json(ordersResult.rows);
  } catch (err) {
    console.error('Failed to fetch orders', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 5. Update order status to "Done Preparing"
router.put('/orders/:order_id/status', validateToken, async (req, res) => {
  const orderId = parseInt(req.params.order_id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID provided' });
  }

  try {
    // Update the status of the order to "Done Preparing"
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *',
      ['Done Preparing', orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated to "Done Preparing"', order: result.rows[0] });
  } catch (err) {
    console.error('Failed to update order status', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Route to fetch all order items sorted by order_id
router.get('/order-items', async (req, res) => {
  try {
    const query = `
      SELECT 
        oi.order_item_id, 
        oi.order_id, 
        d.dish_name, 
        oi.quantity, 
        oi.price,
        oi.status  -- Include status in the select query
      FROM order_items oi
      JOIN dishes d ON oi.dish_id = d.dish_id
      ORDER BY oi.order_id;
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No order items found' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    handleError(err, res, 'Failed to fetch order items');
  }
});

// Update the status of an order item to "Done Preparing"
router.put('/order-items/:order_item_id/status', async (req, res) => {
  const { order_item_id } = req.params;

  try {
    const updateQuery = `
      UPDATE order_items 
      SET status = 'Done Preparing' 
      WHERE order_item_id = $1 
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [order_item_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    res.status(200).json({ message: 'Status updated to "Done Preparing"', orderItem: result.rows[0] });
  } catch (err) {
    console.error('Error updating order item status', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
