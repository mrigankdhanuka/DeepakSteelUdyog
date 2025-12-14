
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    // Transform to match frontend CartItem interface
    const cartItems = user.cart.map(item => {
        if (!item.product) return null; // Handle deleted products
        
        const productObj = item.product.toObject();
        return {
            ...productObj,
            id: productObj._id, // Ensure id field exists
            quantity: item.quantity,
            selectedVariant: item.selectedVariant
        };
    }).filter(item => item !== null);

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Sync/Update cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  const { cart } = req.body;

  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      // Transform frontend CartItems to simplified DB schema
      const dbCart = cart.map(item => ({
        product: item.id, // ID from frontend maps to ObjectId
        quantity: item.quantity,
        selectedVariant: item.selectedVariant
      }));

      user.cart = dbCart;
      await user.save();
      res.json(user.cart);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
