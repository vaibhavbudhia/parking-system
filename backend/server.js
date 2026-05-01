const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/owners',   require('./routes/owners'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/slots',    require('./routes/slots'));
app.use('/api/parking',  require('./routes/parking'));
app.use('/api/reports',  require('./routes/reports'));

// test route — open http://localhost:5000 to confirm server is running
app.get('/', (req, res) => {
    res.json({ message: 'Parking System API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
