const mysql = require('mysql2');

// If .env is not loading correctly, just replace the values below directly
// with your actual MySQL password. This always works.
const db = mysql.createConnection({
    host     : 'switchyard.proxy.rlwy.net',
    user     : 'root',
    password : 'ZvxsfyrSuZBqNMDsitZLnTqZgjVdArkW',   // <-- put your MySQL password here
    database : 'parking_system'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database');
    }
});

module.exports = db;
