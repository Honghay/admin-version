const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Note' },
    versions: [
        {
            content: String,
            createdAt: { type: Date, default: Date.now } // ✅ Adds timestamp
        }
    ]
});

module.exports = mongoose.model('Version', VersionSchema);
