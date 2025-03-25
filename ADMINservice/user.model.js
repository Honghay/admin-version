const mongoose = require('./db');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
