const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { scheduleCleanup } = require('../utils/cleanup');

// Controller to handle any server-side PDF manipulations or simply pass back
const processPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const filePath = req.file.path;
        
        // Example: load PDF to check if it's valid, fetch metadata
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        
        const pageCount = pdfDoc.getPageCount();

        // Schedule file deletion
        scheduleCleanup(filePath, 15); // Delete after 15 minutes

        res.json({
            message: 'PDF uploaded successfully',
            filename: req.file.filename,
            pageCount,
            originalName: req.file.originalname,
            url: `/api/pdf/download/${req.file.filename}` // Assuming we serve this or user edits client-side
        });

    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Failed to process PDF' });
    }
};

module.exports = {
    processPdf
};
