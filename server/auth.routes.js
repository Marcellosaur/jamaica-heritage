const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const router = express.Router();

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isStrongPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 72;
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8 to 72 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [normalizedEmail, hash]
    );

    return res.status(201).json({
      id: result.insertId,
      email: normalizedEmail
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password must be 8 to 72 characters' });
  }

  try {
    const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [normalizedEmail]);

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
