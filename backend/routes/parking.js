const express = require('express');
const router  = express.Router();
const db      = require('../db');
const protect = require('../middleware');

// POST /api/parking/entry
// Body: { Vehicle_ID, slot_type }
// Calls sp_vehicle_entry stored procedure
router.post('/entry', protect, (req, res) => {
    const { Vehicle_ID, slot_type } = req.body;
    if (!Vehicle_ID || !slot_type) {
        return res.status(400).json({ message: 'Vehicle_ID and slot_type are required' });
    }

    db.query('CALL sp_vehicle_entry(?, ?)', [Vehicle_ID, slot_type], (err, results) => {
        if (err) return res.status(400).json({ message: err.sqlMessage || 'Entry failed' });
        res.json({ message: 'Entry logged', data: results[0][0] });
    });
});

// POST /api/parking/exit
// Body: { Record_ID, payment_mode }
// Calls sp_vehicle_exit stored procedure
router.post('/exit', protect, (req, res) => {
    const { Record_ID, payment_mode } = req.body;
    if (!Record_ID || !payment_mode) {
        return res.status(400).json({ message: 'Record_ID and payment_mode are required' });
    }

    db.query('CALL sp_vehicle_exit(?, ?)', [Record_ID, payment_mode], (err, results) => {
        if (err) return res.status(400).json({ message: err.sqlMessage || 'Exit failed' });
        res.json({ message: 'Exit logged', data: results[0][0] });
    });
});

// GET /api/parking/active — all vehicles currently inside
router.get('/active', protect, (req, res) => {
    const sql = `
        SELECT
            pr.Record_ID,
            v.Vehicle_Number,
            v.Vehicle_Type,
            o.Owner_Name,
            o.Phone,
            ps.Slot_Number,
            ps.Floor,
            pr.Entry_Time
        FROM   PARKING_RECORD pr
        JOIN   VEHICLE        v  ON pr.Vehicle_ID = v.Vehicle_ID
        JOIN   OWNER          o  ON v.Owner_ID    = o.Owner_ID
        JOIN   PARKING_SLOT   ps ON pr.Slot_ID    = ps.Slot_ID
        WHERE  pr.Exit_Time IS NULL
        ORDER  BY pr.Entry_Time ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// GET /api/parking/history — all completed sessions
router.get('/history', protect, (req, res) => {
    const sql = `
        SELECT
            pr.Record_ID,
            v.Vehicle_Number,
            v.Vehicle_Type,
            o.Owner_Name,
            ps.Slot_Number,
            pr.Entry_Time,
            pr.Exit_Time,
            pr.Amount,
            p.Payment_Mode
        FROM   PARKING_RECORD pr
        JOIN   VEHICLE        v  ON pr.Vehicle_ID = v.Vehicle_ID
        JOIN   OWNER          o  ON v.Owner_ID    = o.Owner_ID
        JOIN   PARKING_SLOT   ps ON pr.Slot_ID    = ps.Slot_ID
        LEFT JOIN PAYMENT     p  ON pr.Record_ID  = p.Record_ID
        WHERE  pr.Exit_Time IS NOT NULL
        ORDER  BY pr.Exit_Time DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

module.exports = router;
