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
                                 
