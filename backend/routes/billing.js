const express = require('express');
const router = express.Router();

// Mock endpoints for future monetization (Stripe/UPI)

router.get('/status', (req, res) => {
    // Return whether user has free edits left or needs to pay
    res.json({
        enabled: false, // Billing disabled for now
        freeEditsRemaining: 1,
        pricePerEdit: 1 // ₹1
    });
});

router.post('/create-payment', (req, res) => {
    // Stub for creating a payment intent
    res.status(501).json({ message: 'Payment gateway not yet integrated' });
});

module.exports = router;
