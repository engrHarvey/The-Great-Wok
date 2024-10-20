const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const app = express();
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Import category routes
const uploadRoutes = require('./routes/uploadRoutes'); // Import the upload routes
const dishesRoutes = require('./routes/dishesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewroutes = require('./routes/reviewroutes');

// Environment Variable Check
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('Missing required environment variables: DATABASE_URL or JWT_SECRET');
}

// Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const allowedOrigins = ['https://the-great-wok.vercel.app'];

// Middleware Setup
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// JWT Verification Middleware
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
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = decoded; // Attach the decoded token to the request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Admin Route
app.get('/api/admin', verifyAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin panel!' });
});

// Use Routes
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', uploadRoutes);
app.use('/api', dishesRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', cartRoutes);
app.use('/api', addressRoutes);
app.use('/api', orderRoutes);
app.use('/api', reviewroutes);

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', dbConnected: true });
  } catch (err) {
    logger.error('Health check failed', err);
    res.status(500).json({ status: 'DOWN', dbConnected: false });
  }
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Graceful Shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  pool.end(() => {
    logger.info('PostgreSQL pool has ended');
    process.exit(0);
  });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
