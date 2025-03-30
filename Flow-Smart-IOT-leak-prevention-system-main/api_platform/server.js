// 1. Warning filter at the very top
const originalEmit = process.emit;
process.emit = function (event, error) {
  if (event === 'warning' && 
      ['inflight', 'lodash.get', 'glob'].some(msg => error.message.includes(msg))) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

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
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'development'
  });
});

// New status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
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

// Enhanced Server Startup with Port Handling
function startServer(port = process.env.PORT || 5000) {
  const server = app.listen(port, () => {
    console.log(`
🚀 Server running on port ${port}
📅 ${new Date().toLocaleString()}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📌 API Version: ${process.env.API_VERSION || '1.0'}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  return server;
}

// Start the server
startServer();// 1. Warning filter at the very top
const originalEmit = process.emit;
process.emit = function (event, error) {
  if (event === 'warning' && 
      ['inflight', 'lodash.get', 'glob'].some(msg => error.message.includes(msg))) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

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
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'development'
  });
});

// New status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
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

// Enhanced Server Startup with Port Handling
function startServer(port = process.env.PORT || 5000) {
  const server = app.listen(port, () => {
    console.log(`
🚀 Server running on port ${port}
📅 ${new Date().toLocaleString()}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📌 API Version: ${process.env.API_VERSION || '1.0'}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  return server;
}

// Start the server
startServer();
