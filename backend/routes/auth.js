const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');

const JWT_SECRET = 'parkinglot2025secret';

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    const sql = 'SELECT * FROM ADMIN WHERE Username = ? AND Password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err)             return res.status(500).json({ message: 'Server error' });
        if (!results.length) return res.status(401).json({ message: 'Invalid credentials' });

        const user  = results[0];
        const token = jwt.sign(
            { id: user.Admin_ID, role: user.Role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, name: user.Name, role: user.Role });
    });
});

module.exports = router;