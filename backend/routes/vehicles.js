const express = require('express');
const router  = express.Router();
const db      = require('../db');
const protect = require('../middleware');

// GET /api/vehicles — list all vehicles with owner name
router.get('/', protect, (req, res) => {
    const sql = `
        SELECT v.*, o.Owner_Name, o.Phone
        FROM   VEHICLE v
        JOIN   OWNER   o ON v.Owner_ID = o.Owner_ID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// GET /api/vehicles/search?number=PB08AB1234
router.get('/search', protect, (req, res) => {
    const { number } = req.query;
    if (!number) return res.status(400).json({ message: 'Provide a vehicle number' });

    const sql = `
        SELECT v.*, o.Owner_Name, o.Phone
        FROM   VEHICLE v
        JOIN   OWNER   o ON v.Owner_ID = o.Owner_ID
        WHERE  v.Vehicle_Number LIKE ?
    `;
    db.query(sql, [`%${number}%`], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// POST /api/vehicles — register a new vehicle
// Body: { Vehicle_Number, Vehicle_Type, Owner_ID }
router.post('/', protect, (req, res) => {
    const { Vehicle_Number, Vehicle_Type, Owner_ID } = req.body;
    if (!Vehicle_Number || !Vehicle_Type || !Owner_ID) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO VEHICLE (Vehicle_Number, Vehicle_Type, Owner_ID) VALUES (?, ?, ?)';
    db.query(sql, [Vehicle_Number, Vehicle_Type, Owner_ID], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY')
                return res.status(400).json({ message: 'Vehicle already registered' });
            return res.status(500).json({ message: 'Server error' });
        }
        res.json({ message: 'Vehicle registered', Vehicle_ID: result.insertId });
    });
});

module.exports = router;
