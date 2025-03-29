// Get .env data
// 1. Load environment variables FIRST
require('dotenv').config({ path: `${__dirname}/.env` }); // Explicit path

// 2. Debug log to verify loading
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// 3. Configure Mongoose BEFORE connecting
const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Silences the warning

// 4. Connect with error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_leak_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// 5. Rest of your server code...
// Load environment variables FIRST
require('dotenv').config();
console.log('Environment:', process.env.MONGODB_URI); // Debug line

// Fix Mongoose warning
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Connection Error:', err.message));
require('dotenv').config(); // This must be FIRST
console.log('MongoDB URI:', process.env.MONGODB_URI); // Debug line

const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Fixes the warning

require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const expressEjslayouts = require("express-ejs-layouts");
const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use(bodyParser.json());
const DbConnect = async () => {
  try {
    await mongoose.connect(process.env.MongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected");
  } catch (err) {
    console.log(err.message);

    // Exit Process with Failure
    process.exit(1);
  }
};

//Connect Database
DbConnect();

app.use(expressEjslayouts);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Server Routes
app.use("/", require("./routes/sensor"));

app.get("/", (req, res) => {
  return res.render("index");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
