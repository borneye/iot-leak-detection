// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Print ALL environment variables
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('=============================');

// Initialize Mongoose
const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Silence warning

// Hardcoded fallback URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_leak_db';
console.log('Using MongoDB URI:', MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Failed:', err.message);
  console.log('Trying direct connection...');
  
  // Attempt direct connection without any variables
  mongoose.connect('mongodb://localhost:27017/iot_leak_db')
    .then(() => console.log('✅ Connected to fallback URI'))
    .catch(err => console.error('❌ Fallback connection failed:', err.message));
});

// Basic Express Server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API Running'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
