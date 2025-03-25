const mongoose = require('./db');

const NoteSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    content: String
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
