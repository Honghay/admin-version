const mongoose = require('./db');

const CommentSchema = new mongoose.Schema({
    noteId: mongoose.Schema.Types.ObjectId,
    text: String
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
