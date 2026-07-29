const express = require('express');
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// CREATE order (checkout) - logged in users only
router.post('/', verifyToken, async (req, res) => {
  const { items } = req.body; // items = [{ product_id, quantity }, ...]
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalPrice = 0;
    const itemDetails = [];

    for (const item of items) {
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      const product = productResult.rows[0];

      if (!product) {
        throw new Error('Product ${item.product_id} not found');
      }
      if (product.stock < item.quantity) {
        throw new Error('Not enough stock for ${product.name}');
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;
      itemDetails.push({ product_id: product.id, quantity: item.quantity, price: product.price });

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, product.id]);
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *',
      [userId, totalPrice]
    );
    const order = orderResult.rows[0];

    for (const item of itemDetails) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Order failed' });
  } finally {
    client.release();
  }
});

// GET logged-in user's own orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET all orders (admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;