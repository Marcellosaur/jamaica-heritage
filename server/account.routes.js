const express = require('express');
const pool = require('./db');
const auth = require('./auth');

const router = express.Router();
let tableReady = false;

async function ensureUserProfilesTable() {
  if (tableReady) {
    return;
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      full_name VARCHAR(150) NULL,
      phone VARCHAR(40) NULL,
      address_line1 VARCHAR(255) NULL,
      address_line2 VARCHAR(255) NULL,
      city VARCHAR(120) NULL,
      parish_state VARCHAR(120) NULL,
      postal_code VARCHAR(40) NULL,
      country VARCHAR(120) NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );

  tableReady = true;
}

function normalizeString(value, maxLen) {
  const normalized = value ? String(value).trim() : '';
  return normalized.slice(0, maxLen);
}

router.get('/profile', auth, async (req, res) => {
  try {
    await ensureUserProfilesTable();

    const [rows] = await pool.query(
      `SELECT full_name, phone, address_line1, address_line2, city, parish_state, postal_code, country
       FROM user_profiles
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.userId]
    );

    if (!rows.length) {
      return res.json({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        parish_state: '',
        postal_code: '',
        country: ''
      });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  const payload = {
    full_name: normalizeString(req.body.full_name, 150),
    phone: normalizeString(req.body.phone, 40),
    address_line1: normalizeString(req.body.address_line1, 255),
    address_line2: normalizeString(req.body.address_line2, 255),
    city: normalizeString(req.body.city, 120),
    parish_state: normalizeString(req.body.parish_state, 120),
    postal_code: normalizeString(req.body.postal_code, 40),
    country: normalizeString(req.body.country, 120)
  };

  if (!payload.full_name || !payload.address_line1 || !payload.city || !payload.country) {
    return res.status(400).json({ message: 'Full name, address line 1, city, and country are required' });
  }

  if (payload.phone && !/^[0-9+()\s-]{7,40}$/.test(payload.phone)) {
    return res.status(400).json({ message: 'Phone number format is invalid' });
  }

  if (payload.postal_code && !/^[A-Za-z0-9\s-]{3,20}$/.test(payload.postal_code)) {
    return res.status(400).json({ message: 'Postal code format is invalid' });
  }

  try {
    await ensureUserProfilesTable();

    await pool.query(
      `INSERT INTO user_profiles
         (user_id, full_name, phone, address_line1, address_line2, city, parish_state, postal_code, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         phone = VALUES(phone),
         address_line1 = VALUES(address_line1),
         address_line2 = VALUES(address_line2),
         city = VALUES(city),
         parish_state = VALUES(parish_state),
         postal_code = VALUES(postal_code),
         country = VALUES(country)`,
      [
        req.user.userId,
        payload.full_name,
        payload.phone,
        payload.address_line1,
        payload.address_line2,
        payload.city,
        payload.parish_state,
        payload.postal_code,
        payload.country
      ]
    );

    return res.json({ message: 'Profile saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to save profile' });
  }
});

module.exports = router;
