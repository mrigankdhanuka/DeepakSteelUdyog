
const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public (should ideally be protected or filter active for public)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify coupon
// @route   POST /api/coupons/verify
// @access  Public
router.post('/verify', async (req, res) => {
  const { code, cartTotal, categories } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const now = new Date();
    if (coupon.expiryDate < now) {
      return res.status(400).json({ message: 'Coupon expired' });
    }
    if (coupon.startDate && coupon.startDate > now) {
      return res.status(400).json({ message: 'Coupon not yet started' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value of ${coupon.minOrderValue} required` });
    }

    // Category check (frontend should handle calculation, but we verify eligibility)
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
       // logic can be complex, usually checked on frontend for precise discount calculation
       // here we just return the coupon details if basic checks pass
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code } = req.body;
    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon already exists' });
    }

    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      Object.assign(coupon, req.body);
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
