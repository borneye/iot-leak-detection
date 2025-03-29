// 1. Load environment variables FIRST
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
console.log('Environment Variables Loaded:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT
});

// 2. Initialize Mongoose
const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Silence deprecation warning

// 3. Connect to MongoDB with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};
connectDB();

// 4. Basic Express Server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
