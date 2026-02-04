require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB Connected: Code Chunker DB ready"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- 2. Test Route ---
app.get('/', (req, res) => {
    res.send("Code Chunker Pro API is Online...");
});

// --- 3. Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions')); // ADDED

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;