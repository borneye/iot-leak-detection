cat > server.js << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_leak_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Connection Error:', err.message));

// Express server
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API Running'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF
