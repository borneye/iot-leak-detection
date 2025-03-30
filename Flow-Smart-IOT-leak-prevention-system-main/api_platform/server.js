// Add to very top of server.js
const originalEmit = process.emit;
process.emit = function (event, error) {
  if (event === 'warning' && 
      ['inflight', 'lodash.get', 'glob'].some(msg => error.message.includes(msg))) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};
cat << 'EOF' > server.js
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
//const swaggerUi = require('swagger-ui-express');
//const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Add this after your other middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174'
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// MongoDB Connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_leak_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Leak Data Schema
const leakSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, index: true },
  location: { type: String, required: true, index: true },
  pressure: { type: Number, required: true },
  isLeaking: { type: Boolean, default: false, index: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

const LeakData = mongoose.model('LeakData', leakSchema);

// Swagger Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'operational',
    message: 'IoT Leak Detection API',
    documentation: '/api-docs'
  });
});

app.post('/api/sensor-data', async (req, res) => {
  try {
    if (!req.body.sensorId || !req.body.location || req.body.pressure === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newReading = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: req.body.pressure,
      isLeaking: req.body.pressure > 3.5
    });

    await newReading.save();
    res.status(201).json(newReading);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF
