const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Untitled Workspace' },
    rawCode: { type: String, required: true },
    settings: {
        mode: String,
        lineCount: Number,
        partCount: Number,
        useContext: Boolean
    },
    stats: {
        lines: Number,
        chars: Number,
        tokens: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('ChunkSession', sessionSchema);