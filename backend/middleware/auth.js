const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = userResult.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Failed to authenticate token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access forbidden: Admins only' });
  }
  next();
};

module.exports = { verifyToken, adminOnly };