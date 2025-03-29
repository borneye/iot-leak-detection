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
