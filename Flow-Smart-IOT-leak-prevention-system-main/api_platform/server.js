require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_leak_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ Connection Error:', err));

// Express server
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API Running'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
cat >> server.js << 'EOF'

// API Routes
app.get('/', (req, res) => res.send('IoT Leak Detection API'));

// POST endpoint for IoT devices
app.post('/api/leak-data', async (req, res) => {
  try {
    const leakData = new LeakData({
      ...req.body,
      isLeaking: req.body.pressure > 3.5 // 3.5 bar threshold
    });
    await leakData.save();
    res.status(201).json(leakData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET endpoint for frontend
app.get('/api/leak-data', async (req, res) => {
  try {
    const data = await LeakData.find().sort({ timestamp: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
EOF
cat >> server.js << 'EOF'

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
});
EOF
cat >> server.js << 'EOF'

// ======================
// API ENDPOINTS
// ======================

// Health check endpoint
app.get('/', (req, res) => res.send('IoT Leak Detection API - Operational'));

// POST endpoint for IoT devices to submit data
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.sensorId || !req.body.location || !req.body.pressure) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new leak data record
    const leakData = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: req.body.pressure,
      isLeaking: req.body.pressure > 3.5, // 3.5 bar = leak threshold
      timestamp: new Date()
    });

    await leakData.save();
    res.status(201).json(leakData);
    
  } catch (err) {
    console.error('Error saving sensor data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET endpoint for frontend to retrieve data
app.get('/api/sensor-data', async (req, res) => {
  try {
    const data = await LeakData.find()
      .sort({ timestamp: -1 }) // Newest first
      .limit(100); // Limit to 100 most recent readings
    res.json(data);
  } catch (err) {
    console.error('Error fetching sensor data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================
// SERVER STARTUP
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌐 Endpoints:`);
  console.log(`   - POST /api/sensor-data - For IoT devices to submit data`);
  console.log(`   - GET  /api/sensor-data - For frontend to retrieve data`);
  console.log(`🔒 Allowed origins: ${process.env.FRONTEND_URL || 'http://localhost:5174'}\n`);
});
EOF 
cat >> server.js << 'EOF'

// ======================
// API ENDPOINTS
// ======================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'operational',
    message: 'IoT Leak Detection API',
    endpoints: {
      submitData: 'POST /api/sensor-data',
      getData: 'GET /api/sensor-data'
    }
  });
});

// POST endpoint for IoT devices
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Input validation
    if (!req.body.sensorId || !req.body.location || typeof req.body.pressure !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid input',
        required: ['sensorId (string)', 'location (string)', 'pressure (number)']
      });
    }

    // Create and save new reading
    const newReading = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: req.body.pressure,
      isLeaking: req.body.pressure > 3.5, // 3.5 bar threshold
      timestamp: new Date()
    });

    await newReading.save();
    
    // Return the saved document
    res.status(201).json({
      message: 'Data saved successfully',
      data: newReading
    });

  } catch (err) {
    console.error('Error saving sensor data:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// GET endpoint for frontend
app.get('/api/sensor-data', async (req, res) => {
  try {
    // Get last 100 readings, newest first
    const readings = await LeakData.find()
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json({
      count: readings.length,
      data: readings
    });
  } catch (err) {
    console.error('Error fetching sensor data:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// ======================
// SERVER STARTUP
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██║     ██╔═══██╗██║    ██║
  █████╗  ██║     ██║   ██║██║ █╗ ██║
  ██╔══╝  ██║     ██║   ██║██║███╗██║
  ██║     ███████╗╚██████╔╝╚███╔███╔╝
  ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
  
  🚀 Server running on port ${PORT}
  🌐 Allowed Origin: ${process.env.FRONTEND_URL || 'http://localhost:5174'}
  
  📊 Available Endpoints:
  POST /api/sensor-data - Submit sensor readings
  GET  /api/sensor-data - Retrieve sensor data
  `);
});
EOF
cat >> server.js << 'EOF'

// ======================
// API ENDPOINTS
// ======================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'operational',
    message: 'IoT Leak Detection API',
    endpoints: {
      submitData: 'POST /api/sensor-data',
      getData: 'GET /api/sensor-data'
    }
  });
});

// Handle sensor data submissions
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.sensorId || !req.body.location || !req.body.pressure) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['sensorId', 'location', 'pressure']
      });
    }

    // Create new reading with leak detection
    const newReading = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: parseFloat(req.body.pressure),
      isLeaking: parseFloat(req.body.pressure) > 3.5, // 3.5 bar threshold
      timestamp: new Date()
    });

    await newReading.save();
    res.status(201).json(newReading);

  } catch (err) {
    console.error('Error saving sensor data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve sensor data
app.get('/api/sensor-data', async (req, res) => {
  try {
    const data = await LeakData.find()
      .sort({ timestamp: -1 }) // Newest first
      .limit(100); // Limit to 100 most recent readings
    res.json(data);
  } catch (err) {
    console.error('Error fetching sensor data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// START THE SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  --------------------------------
  🌐 HTTP Endpoints:
  POST /api/sensor-data - Submit sensor data
  GET  /api/sensor-data - Retrieve sensor data
  GET  /               - API status check
  `);
});
EOF
cat >> server.js << 'EOF'

// ======================
// API ENDPOINTS
// ======================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'operational',
    message: 'IoT Leak Detection API',
    version: '1.0.0',
    endpoints: {
      submitData: 'POST /api/sensor-data',
      getData: 'GET /api/sensor-data',
      getAlerts: 'GET /api/leak-alerts'
    }
  });
});

// Handle sensor data submissions
app.post('/api/sensor-data', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.sensorId || !req.body.location || req.body.pressure === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: {
          sensorId: 'String (unique device identifier)',
          location: 'String (installation location)',
          pressure: 'Number (in bar)'
        }
      });
    }

    const pressure = parseFloat(req.body.pressure);
    if (isNaN(pressure)) {
      return res.status(400).json({ error: 'Pressure must be a number' });
    }

    // Create new reading with leak detection
    const newReading = new LeakData({
      sensorId: req.body.sensorId,
      location: req.body.location,
      pressure: pressure,
      isLeaking: pressure > 3.5, // 3.5 bar threshold
      timestamp: new Date()
    });

    await newReading.save();
    
    // Return success response
    res.status(201).json({
      message: 'Data saved successfully',
      data: newReading,
      leakDetected: newReading.isLeaking
    });

  } catch (err) {
    console.error('Error saving sensor data:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Retrieve all sensor data
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
    console.error('Error fetching sensor data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get only leak alerts
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
    console.error('Error fetching leak alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// START THE SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██║     ██╔═══██╗██║    ██║
  █████╗  ██║     ██║   ██║██║ █╗ ██║
  ██╔══╝  ██║     ██║   ██║██║███╗██║
  ██║     ███████╗╚██████╔╝╚███╔███╔╝
  ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
  
  🚀 Server running on port ${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 Allowed Origin: ${process.env.FRONTEND_URL || 'http://localhost:5174'}
  
  📊 Available Endpoints:
  POST /api/sensor-data - Submit sensor readings
  GET  /api/sensor-data - Retrieve all readings
  GET  /api/leak-alerts - Get only leak alerts
  `);
});
EOF
