const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const pdfRoutes = require('./routes/pdf');
const billingRoutes = require('./routes/billing');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/billing', billingRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to PDFEditor API' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
