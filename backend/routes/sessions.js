const express = require('express');
const router = express.Router();
const ChunkSession = require('../models/ChunkSession');
const { protect } = require('../middleware/auth');

// @route   POST /api/sessions
// @desc    Save a new chunk session
router.post('/', protect, async (req, res) => {
    const { name, rawCode, settings, stats } = req.body;
    try {
        const session = await ChunkSession.create({
            userId: req.user._id,
            name,
            rawCode,
            settings,
            stats
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/sessions
// @desc    Get all sessions for the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const sessions = await ChunkSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/sessions/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const session = await ChunkSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json({ message: "Workspace deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;