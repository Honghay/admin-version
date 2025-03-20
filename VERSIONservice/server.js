const express = require('express');
const mongoose = require('./db');
const Version = require('./version.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = 8007;
const JWT_SECRETE = process.env.JWT_SECRETE; // Ensure this is set

// Middleware to check authentication
function authToken(req, res, next) {
    console.log("🔍 Checking Authorization Header:", req.headers.authorization);
    
    const header = req.headers.authorization;
    const token = header && header.split(' ')[1];

    if (!token) {
        console.log("⛔ Unauthorized: No Token Provided");
        return res.status(401).json({ error: "Unauthorized: Token required" });
    }

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) {
            console.log("⛔ Invalid Token:", err.message);
            return res.status(403).json({ error: "Invalid token" });
        }
        req.user = user;
        console.log("✅ Token Verified. User:", user);
        next();
    });
}

// Middleware to restrict access to admins only
function authRole(role) {
    return (req, res, next) => {
        console.log(`🔍 Checking User Role: ${req.user.role}, Required: ${role}`);
        
        if (!req.user || req.user.role !== role) {
            console.log("⛔ Forbidden: Insufficient Permissions");
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }
        
        console.log("✅ Role Verified. Access Granted.");
        next();
    };
}

// Apply authentication middleware to ALL routes
app.use(authToken);

// ✅ Secure `/versions` (Only Admins Allowed)
app.post('/versions', authRole('user'), async (req, res) => {
    try {
        const { noteId, content } = req.body;
        let version = await Version.findOne({ noteId });

        if (!version) {
            version = new Version({ noteId, versions: [{ content }] });
        } else {
            version.versions.push({ content });
        }

        await version.save();
        res.status(201).json({ message: 'Version saved', version });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get all versions of a note (Admins Only)
app.get('/versions/:noteId', authRole('admin'), async (req, res) => {
    try {
        const { noteId } = req.params;
        const version = await Version.findOne({ noteId });

        if (!version) {
            return res.status(404).json({ error: "No versions found for this note" });
        }

        res.json(version);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Delete a specific version (Admins Only)
app.delete('/versions/:noteId/:versionIndex', authRole('admin'), async (req, res) => {
    try {
        const { noteId, versionIndex } = req.params;
        let version = await Version.findOne({ noteId });

        if (!version) {
            return res.status(404).json({ error: "No versions found for this note" });
        }

        if (version.versions.length <= versionIndex) {
            return res.status(400).json({ error: "Invalid version index" });
        }

        version.versions.splice(versionIndex, 1);
        await version.save();
        res.json({ message: "Version deleted successfully", version });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Restore a previous version as the latest (Admins Only)
app.put('/versions/restore/:noteId/:versionIndex', authRole('admin'), async (req, res) => {
    try {
        const { noteId, versionIndex } = req.params;
        let version = await Version.findOne({ noteId });

        if (!version) {
            return res.status(404).json({ error: "No versions found for this note" });
        }

        if (version.versions.length <= versionIndex) {
            return res.status(400).json({ error: "Invalid version index" });
        }

        // Move selected version to the end (making it the latest)
        const restoredVersion = version.versions.splice(versionIndex, 1)[0];
        version.versions.push(restoredVersion);
        await version.save();

        res.json({ message: "Version restored as the latest", version });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.listen(PORT, () => console.log(`🚀 Versioning Service running on port ${PORT}`));
