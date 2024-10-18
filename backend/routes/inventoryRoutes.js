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

/* -------------------- INVENTORY ROUTES -------------------- */

// 1. Get all inventory items
// Get inventory with dish names
router.get('/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        inventory.inventory_id, 
        inventory.quantity_in_stock, 
        inventory.last_updated, 
        dishes.dish_name 
      FROM inventory 
      JOIN dishes ON inventory.dish_id = dishes.dish_id 
      ORDER BY inventory.inventory_id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Failed to fetch inventory with dish names:', err);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// 2. Get a single inventory item by ID
router.get('/inventory/:id', async (req, res) => {
  const inventoryId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query('SELECT * FROM inventory WHERE inventory_id = $1', [inventoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to fetch inventory item');
  }
});

// 3. Create a new inventory item
router.post('/inventory', async (req, res) => {
  const { dish_id, quantity_in_stock } = req.body;

  if (!dish_id || quantity_in_stock === undefined) {
    return res.status(400).json({ error: 'dish_id and quantity_in_stock are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO inventory (dish_id, quantity_in_stock) VALUES ($1, $2) RETURNING *',
      [dish_id, quantity_in_stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to create inventory item');
  }
});

// 4. Update Existing Inventory Item by ID
router.put(
  '/inventory/:id',
  [
    body('quantity_in_stock').optional().isInt({ min: 0 }).withMessage('Quantity in stock must be a non-negative integer'),
  ],
  async (req, res) => {
    const inventoryId = parseInt(req.params.id);
    if (isNaN(inventoryId)) {
      return res.status(400).json({ error: 'Invalid inventory ID provided. ID must be a number.' });
    }

    const { quantity_in_stock } = req.body;

    try {
      const result = await pool.query(
        'UPDATE inventory SET quantity_in_stock = COALESCE($1, quantity_in_stock), last_updated = NOW() WHERE inventory_id = $2 RETURNING *',
        [quantity_in_stock, inventoryId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Failed to update inventory item:', err);
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }
);

// 5. Delete an inventory item by ID
router.delete('/inventory/:id', async (req, res) => {
  const inventoryId = parseInt(req.params.id, 10);

  try {
    const result = await pool.query('DELETE FROM inventory WHERE inventory_id = $1 RETURNING *', [inventoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    handleError(err, res, 'Failed to delete inventory item');
  }
});

// 6. Get an inventory item by dish_id
router.get('/inventory/dish/:dish_id', async (req, res) => {
  const dishId = parseInt(req.params.dish_id, 10);

  if (isNaN(dishId)) {
    return res.status(400).json({ error: 'Invalid dish ID provided. ID must be a number.' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        inventory.*, 
        dishes.dish_name 
      FROM inventory 
      JOIN dishes ON inventory.dish_id = dishes.dish_id 
      WHERE inventory.dish_id = $1
    `, [dishId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No inventory found for the provided dish ID' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    handleError(err, res, 'Failed to fetch inventory item by dish ID');
  }
});

module.exports = router;
