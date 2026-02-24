require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth.routes');
const productRoutes = require('./products.routes');
const orderRoutes = require('./order.routes');
const tourRoutes = require('./tour.routes');
const accountRoutes = require('./account.routes');

const app = express();

const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

app.use(cors({
  origin(origin, callback) {
    if (!origin || localDevOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  }
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/tours', tourRoutes);
app.use('/account', accountRoutes);

// Centralized fallback error response for unexpected failures.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
