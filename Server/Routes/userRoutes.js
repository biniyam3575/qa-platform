const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const authMiddleware = require('../middleware/auth'); 

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { userName, first_name, last_name, email, password } = req.body;
        
        // Basic validation
        if (!userName || !first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Check if user exists
        const [existing] = await promisePool.query(
            'SELECT * FROM users WHERE userName = ? OR email = ?',
            [userName, email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10); 
        
        // Insert user
        const [result] = await promisePool.query(
            'INSERT INTO users (userName, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)',
            [userName, first_name, last_name, email, hashedPassword]
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await promisePool.query(
            'SELECT * FROM users WHERE userName = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];

        // 1. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 2. IMMEDIATELY DELETE THE HASH
        delete user.password_hash; 

        // 3. Generate JWT
        const token = jwt.sign(
            { userId: user.user_id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 4. Send response
        res.json({
            success: true,
            token: token,
            user: user // Now safe to send because the hash is gone!
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Because of the middleware, we have access to req.user
        const userId = req.user.userId;
        
        const [user] = await promisePool.query(
            'SELECT user_id, userName, email, first_name, last_name, profile_image FROM users WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            data: user[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user profile (name, username, avatar URL)
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { userName, first_name, last_name, profile_image } = req.body;

        await promisePool.query(
            'UPDATE users SET userName = ?, first_name = ?, last_name = ?, profile_image = ? WHERE user_id = ?',
            [userName, first_name, last_name, profile_image, userId]
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Change password (separate from profile update — requires current password check)
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }

        const [rows] = await promisePool.query(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await promisePool.query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [newHash, userId]
        );

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;