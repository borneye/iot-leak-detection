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

// ======================
// API ENDPOINTS
// ======================

// 1. Base API Info
app.get('/', (req, res) => {
  res.json({
    status: 'operational',
    message: 'IoT Leak Detection API',
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      status: 'GET /api/status',
      submitData: 'POST /api/sensor-data',
      getData: 'GET /api/sensor-data',
      getAlerts: 'GET /api/leak-alerts'
    }
  });
});

// 2. System Status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'operational',
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// 3. Data Submission
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Validation
    if (!req.body.sensorId || !req.body.location || req.body.pressure === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['sensorId (string)', 'location (string)', 'pressure (number)']
      });
    }

    // Create new reading
    const newReading = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: req.body.pressure,
      isLeaking: req.body.pressure > 3.5 // 3.5 bar threshold
    });

    await newReading.save();
    
    res.status(201).json({
      message: 'Data saved successfully',
      data: newReading,
      leakDetected: newReading.isLeaking
    });

  } catch (err) {
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 4. Get All Sensor Data
app.get('/api/sensor-data', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = await LeakData.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({
      count: data.length,
      results: data
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Get Leak Alerts
app.get('/api/leak-alerts', async (req, res) => {
  try {
    const alerts = await LeakData.find({ isLeaking: true })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      alertCount: alerts.length,
      alerts: alerts
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// SERVER STARTUP
// ======================
function startServer(port = process.env.PORT || 5000) {
  const server = app.listen(port, () => {
    console.log(`
🚀 Server running on port ${port}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📅 ${new Date().toLocaleString()}
📌 Version: ${process.env.API_VERSION || '1.0'}
📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    
📚 API Documentation: http://localhost:${port}/api-docs
    `);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  return server;
}

// Start the server
startServer();
