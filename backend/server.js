const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');

const app = express();

// Allow the Next.js frontend (different port) to call this API and
// send/receive the session cookie.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth routes
app.use('/api/auth', authRoutes);
// Services routes
app.use('/api/services', servicesRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, fullName, email, createdAt FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
