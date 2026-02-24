const express = require('express');
const pool = require('./db');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url FROM products WHERE active = 1 ORDER BY id DESC'
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url FROM products WHERE id = ? AND active = 1 LIMIT 1',
      [productId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});

module.exports = router;
