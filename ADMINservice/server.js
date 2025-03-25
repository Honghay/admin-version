const express = require('express');
const mongoose = require('./db');
const path = require('path');
const jwt = require('jsonwebtoken');

const Note = require('./note.model.js');
const User = require('./user.model.js');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = 8008;
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// ✅ Middleware: Authenticate Admin
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    const token = header && header.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized: Token required" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });

        if (user.role !== 'admin') return res.status(403).json({ error: "Forbidden: Admins only" });

        req.user = user;
        next();
    });
}

// ✅ Get All Users (Admins Only)
app.get('/admin/users', authenticate, async (req, res) => {
    try {
        const users = await User.find({}, 'username role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Promote a User to Admin (Admins Only)
app.patch('/admin/promote/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { role: 'admin' }, { new: true });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User promoted to admin", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete Any User (Admins Only)
app.delete('/admin/delete/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Start Admin Service
app.listen(PORT, () => console.log(`🛠️ Admin Service running on port ${PORT}`));
