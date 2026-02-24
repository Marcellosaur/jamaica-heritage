const express = require('express');
const pool = require('./db');
const auth = require('./auth');

const router = express.Router();

router.post('/checkout', auth, async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  if (items.length > 100) {
    return res.status(400).json({ message: 'Too many cart items' });
  }

  for (const item of items) {
    const qty = Number(item?.qty);
    const productId = Number(item?.productId);

    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(qty) || qty <= 0 || qty > 100) {
      return res.status(400).json({ message: 'Invalid cart item payload' });
    }
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let total = 0;
    const detailedItems = [];

    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT id, price FROM products WHERE id = ? AND active = 1',
        [item.productId]
      );

      if (!rows.length) {
        throw new Error(`Invalid product id: ${item.productId}`);
      }

      const unitPrice = Number(rows[0].price);
      const lineTotal = unitPrice * item.qty;
      total += lineTotal;

      detailedItems.push({
        productId: rows[0].id,
        qty: Number(item.qty),
        unitPrice
      });
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.user.userId, total, 'paid']
    );

    for (const item of detailedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.productId, item.qty, item.unitPrice]
      );
    }

    await conn.commit();

    return res.status(201).json({
      orderId: orderResult.insertId,
      total
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(400).json({ message: err.message || 'Checkout failed' });
  } finally {
    conn.release();
  }
});

router.get('/my-orders', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         o.id AS order_id,
         o.total,
         o.status,
         o.created_at,
         oi.qty,
         oi.unit_price,
         p.name AS product_name
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC, oi.id ASC`,
      [req.user.userId]
    );

    const byOrder = new Map();

    for (const row of rows) {
      if (!byOrder.has(row.order_id)) {
        byOrder.set(row.order_id, {
          id: row.order_id,
          total: Number(row.total),
          status: row.status,
          created_at: row.created_at,
          items: []
        });
      }

      if (row.product_name) {
        byOrder.get(row.order_id).items.push({
          productName: row.product_name,
          qty: Number(row.qty),
          unitPrice: Number(row.unit_price),
          lineTotal: Number(row.qty) * Number(row.unit_price)
        });
      }
    }

    return res.json(Array.from(byOrder.values()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

module.exports = router;
