
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', notes } = req.body;

  try {
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: notes || {} 
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
});

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/key
// @access  Public
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

// @desc    Razorpay Webhook
// @route   POST /api/payment/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  // Verify signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    
    if (event === 'payment.captured') {
        const payment = req.body.payload.payment.entity;
        // The notes field in Razorpay order should contain our DB Order ID
        const dbOrderId = payment.notes ? payment.notes.order_id : null;
        
        if (dbOrderId) {
            try {
                const order = await Order.findById(dbOrderId);
                if (order && order.paymentStatus !== 'Success') {
                    order.paymentStatus = 'Success';
                    order.status = 'Confirmed';
                    order.paymentResult = {
                        id: payment.id,
                        status: payment.status,
                        update_time: new Date().toISOString(),
                        email_address: payment.email
                    };
                    await order.save();
                    console.log(`Order ${dbOrderId} updated via Webhook`);
                }
            } catch (err) {
                console.error('Webhook Order Update Failed', err);
            }
        }
    }
    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Invalid signature');
  }
});

module.exports = router;
