const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/auth/register ───
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, signupMethod, countryCode, phoneNumber } = req.body;

    // Validate required fields
    if (!fullName || !password) {
      return res.status(400).json({ ok: false, error: 'Full name and password are required.' });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({ ok: false, error: 'Full name must be at least 2 characters.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 8 characters.' });
    }

    // Check if email or phone already exists
    if (email) {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing.length > 0) {
        return res.status(409).json({ ok: false, error: 'Email already registered.' });
      }
    }

    if (phoneNumber) {
      const [existing] = await db.query('SELECT id FROM users WHERE phoneNumber = ?', [phoneNumber]);
      if (existing.length > 0) {
        return res.status(409).json({ ok: false, error: 'Phone number already registered.' });
      }
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (fullName, email, countryCode, phoneNumber, passwordHash)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fullName.trim(),
        email ? email.toLowerCase().trim() : null,
        countryCode || null,
        phoneNumber || null,
        passwordHash,
      ]
    );

    const token = generateToken({
      id: result.insertId,
      email: email ? email.toLowerCase().trim() : null,
      fullName: fullName.trim(),
    });

    res.status(201).json({
      ok: true,
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertId,
        fullName: fullName.trim(),
        email: email ? email.toLowerCase().trim() : null,
        phoneNumber: phoneNumber || null,
      },
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to create account.' });
  }
});

// ─── POST /api/auth/login ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    res.json({
      ok: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to sign in.' });
  }
});

// ─── GET /api/auth/me ───
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, fullName, email, countryCode, phoneNumber, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }

    res.json({ ok: true, user: users[0] });
  } catch (err) {
    console.error('GET USER ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch user details.' });
  }
});

module.exports = router;

