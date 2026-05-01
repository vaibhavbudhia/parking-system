const jwt = require('jsonwebtoken');

const JWT_SECRET = 'parkinglot2025secret';  // same secret as auth.js

function protect(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

module.exports = protect;
