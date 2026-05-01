const express = require('express');
const router  = express.Router();
const db      = require('../db');
const protect = require('../middleware');

// GET /api/owners — list all owners
router.get('/', protect, (req, res) => {
    db.query('SELECT * FROM OWNER', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// POST /api/owners — add a new owner
// Body: { Owner_Name, Phone, Email }
router.post('/', protect, (req, res) => {
    const { Owner_Name, Phone, Email } = req.body;
    if (!Owner_Name || !Phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
    }

    const sql = 'INSERT INTO OWNER (Owner_Name, Phone, Email) VALUES (?, ?, ?)';
    db.query(sql, [Owner_Name, Phone, Email || null], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY')
                return res.status(400).json({ message: 'Phone number already registered' });
            return res.status(500).json({ message: 'Server error' });
        }
        res.json({ message: 'Owner added', Owner_ID: result.insertId });
    });
});

module.exports = router;
