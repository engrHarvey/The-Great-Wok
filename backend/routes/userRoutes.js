const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const logger = require('winston');

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Utility function to hash passwords
const hashPassword = async (plainPassword) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (err) {
    logger.error('Password hashing failed', err);
    throw new Error('Password hashing failed');
  }
};

// JWT Signing Function (Updated)
const createJWT = (user) => {
  return jwt.sign(
    { id: user.user_id, username: user.username, email: user.email, role: user.role }, // Include role in JWT
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Route for User Signup (Updated to include role)
router.post(
  '/users',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, phone } = req.body;

    try {
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await hashPassword(password);
      // By default, assign role "user" for every signup. Admin role can be assigned manually in the DB.
      const role = 'user';
      const newUserResult = await pool.query(
        'INSERT INTO users (username, email, password, phone, role, is_guest) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *',
        [username, email, hashedPassword, phone, role]
      );

      const newUser = newUserResult.rows[0];
      const token = createJWT(newUser);

      res.status(201).json({ user: newUser, token });
    } catch (err) {
      logger.error('User creation failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Route for User Login (Include Role in Response)
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'User not found. Please register first.' });
      }

      const user = userResult.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }

      const token = createJWT(user);
      res.status(200).json({ user, token });
    } catch (err) {
      logger.error('User login failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Route to get current user profile (Include Role)
router.get('/profile', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const userResult = await pool.query('SELECT user_id, username, email, phone, role FROM users WHERE user_id = $1', [userId]); // Include role
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.status(200).json({ user });
  } catch (err) {
    logger.error('Failed to fetch user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT user_id, username, email, phone, role FROM users');
    res.status(200).json(usersResult.rows); // Return the user data as a JSON array
  } catch (err) {
    logger.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update phone number
router.put(
  '/profile/phone',
  [
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  ],
  async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];  // Get token from header

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;

      // Update the phone number in the database
      const result = await pool.query(
        'UPDATE users SET phone = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
        [phone, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'Phone number updated successfully' });
    } catch (err) {
      console.error('Error updating phone number:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Route for Guest Login
router.post('/guest', async (req, res) => {
  try {
    // Create a new guest user with a unique username (e.g., 'Guest_' + timestamp)
    const guestUsername = `Guest_${Date.now()}`;

    // Insert guest user into the database
    const guestUserResult = await pool.query(
      'INSERT INTO users (username, is_guest, role) VALUES ($1, TRUE, $2) RETURNING *',
      [guestUsername, 'guest']
    );

    const guestUser = guestUserResult.rows[0];

    // Generate a token for the guest user
    const token = createJWT(guestUser);

    res.status(201).json({ user: guestUser, token });
  } catch (err) {
    logger.error('Guest login failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
