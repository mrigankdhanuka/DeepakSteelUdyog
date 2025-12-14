
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newAddress = req.body;

    // If new address is default, unset other defaults
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Add to array
    user.addresses.push(newAddress);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
router.put('/address/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (address) {
      const updates = req.body;

      if (updates.isDefault) {
        user.addresses.forEach(addr => {
            if (addr._id.toString() !== req.params.id) {
                addr.isDefault = false
            }
        });
      }

      // Update fields
      address.fullName = updates.fullName || address.fullName;
      address.phoneNumber = updates.phoneNumber || address.phoneNumber;
      address.street = updates.street || address.street;
      address.city = updates.city || address.city;
      address.state = updates.state || address.state;
      address.zipCode = updates.zipCode || address.zipCode;
      address.country = updates.country || address.country;
      address.type = updates.type || address.type;
      address.isDefault = updates.isDefault !== undefined ? updates.isDefault : address.isDefault;

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
router.delete('/address/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Filter out the address
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:id
// @access  Private
router.post('/wishlist/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    // Check if already exists to prevent duplicates (though addToSet could also be used if schema type allowed)
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
router.delete('/wishlist/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
