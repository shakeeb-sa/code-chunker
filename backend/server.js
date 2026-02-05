require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- 1. PRO-DATABASE CONNECTION (Vercel Stable Pattern) ---
const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log("🚀 MongoDB Connected successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
    }
};

// Middleware: Force every request to wait for the DB connection
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- 2. Test Route ---
app.get('/', (req, res) => {
    res.send(`Code Chunker API is Online. DB Connected: ${isConnected ? 'Yes' : 'No'}`);
});

// --- 3. Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));

// --- 4. Export for Vercel ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local Server Running on ${PORT}`));
}

module.exports = app;