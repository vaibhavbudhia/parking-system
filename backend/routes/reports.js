const express = require('express');
const router  = express.Router();
const db      = require('../db');
const protect = require('../middleware');

// GET /api/reports/revenue — daily revenue from view
router.get('/revenue', protect, (req, res) => {
    db.query('SELECT * FROM vw_daily_revenue', (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results);
    });
});

// GET /api/reports/summary — quick numbers for admin dashboard
router.get('/summary', protect, (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM PARKING_SLOT WHERE Status = 'available') AS available_slots,
            (SELECT COUNT(*) FROM PARKING_SLOT WHERE Status = 'occupied')  AS occupied_slots,
            (SELECT COUNT(*) FROM PARKING_RECORD WHERE Exit_Time IS NULL)  AS active_vehicles,
            (SELECT COALESCE(SUM(Amount), 0) FROM PAYMENT
             WHERE DATE(Payment_Time) = CURDATE())                         AS today_revenue
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(results[0]);
    });
});

module.exports = router;
