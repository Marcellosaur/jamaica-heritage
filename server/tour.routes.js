const express = require('express');
const pool = require('./db');
const auth = require('./auth');

const router = express.Router();
let tableReady = false;

async function ensureTourBookingsTable() {
  if (tableReady) {
    return;
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS tour_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tour_type VARCHAR(120) NOT NULL,
      group_size INT NULL,
      preferred_date DATE NULL,
      notes TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );

  tableReady = true;
}

router.post('/book', auth, async (req, res) => {
  const { tourType, groupSize, preferredDate, notes } = req.body;

  const normalizedTourType = tourType ? String(tourType).trim() : '';
  if (normalizedTourType.length < 3 || normalizedTourType.length > 120) {
    return res.status(400).json({ message: 'Tour type is required' });
  }

  const parsedGroupSize = groupSize === null || groupSize === undefined || groupSize === ''
    ? null
    : Number(groupSize);

  if (parsedGroupSize !== null && (!Number.isInteger(parsedGroupSize) || parsedGroupSize <= 0 || parsedGroupSize > 500)) {
    return res.status(400).json({ message: 'Group size must be a positive number up to 500' });
  }

  const parsedDate = preferredDate ? String(preferredDate).slice(0, 10) : null;
  if (parsedDate && !/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
    return res.status(400).json({ message: 'Preferred date is invalid' });
  }

  const normalizedNotes = notes ? String(notes).trim() : null;
  if (normalizedNotes && normalizedNotes.length > 1000) {
    return res.status(400).json({ message: 'Notes must be 1000 characters or less' });
  }

  try {
    await ensureTourBookingsTable();

    const [result] = await pool.query(
      `INSERT INTO tour_bookings (user_id, tour_type, group_size, preferred_date, notes, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [
        req.user.userId,
        normalizedTourType,
        parsedGroupSize,
        parsedDate,
        normalizedNotes
      ]
    );

    return res.status(201).json({
      bookingId: result.insertId,
      status: 'pending'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
});

router.get('/my-bookings', auth, async (req, res) => {
  try {
    await ensureTourBookingsTable();

    const [rows] = await pool.query(
      `SELECT id, tour_type, group_size, preferred_date, notes, status, created_at
       FROM tour_bookings
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch tour bookings' });
  }
});

module.exports = router;
