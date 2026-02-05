const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
                presets: user.presets // Added so your presets load when you sign in
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const { protect } = require('../middleware/auth');

// @route   PUT /api/auth/presets
// @desc    Add a new preset to user profile
router.put('/presets', protect, async (req, res) => {
    const { name, prefix, suffix } = req.body;
    try {
        const user = await User.findById(req.user._id);
        user.presets.push({ name, prefix, suffix });
        await user.save();
        res.json(user.presets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/auth/presets/:id
// @desc    Remove a preset
router.delete('/presets/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.presets = user.presets.filter(p => p._id.toString() !== req.params.id);
        await user.save();
        res.json(user.presets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
