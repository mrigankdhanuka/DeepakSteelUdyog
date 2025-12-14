
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User'); // Import User model
const { protect, admin } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper to restore stock
const restoreStock = async (items) => {
  for (const item of items) {
    if (item.selectedVariant) {
      await Product.findOneAndUpdate(
        { _id: item.product, "variants.name": item.selectedVariant.name },
        { $inc: { "variants.$.stock": item.quantity } }
      );
    } else {
      await Product.findOneAndUpdate(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      );
    }
  }
};

// @desc    Get order analytics (Admin)
// @route   GET /api/orders/analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Payment Failed', 'Refunded', 'Returned'] } 
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analyticsData = [];
    const loopDate = new Date(startDate);
    
    while (loopDate <= endDate) {
      const dateString = loopDate.toISOString().split('T')[0];
      const dayData = orders.find(o => o._id === dateString) || { sales: 0, revenue: 0 };
      
      analyticsData.push({
        name: loopDate.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateString,
        sales: dayData.sales,
        revenue: dayData.revenue
      });
      loopDate.setDate(loopDate.getDate() + 1);
    }

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Guest) or Private
router.post('/', async (req, res) => {
  const { items, shippingAddress, paymentMethod, subtotal, tax, shippingCost, discount, total, userId, customerName, guestEmail, paymentResult, couponCode } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ message: 'No order items' });

  const reservedItems = [];

  try {
    let finalUserId = null;
    let userEmail = guestEmail;

    if (userId && userId !== 'guest') {
       finalUserId = userId;
       const userObj = await User.findById(userId);
       if (userObj) userEmail = userObj.email;
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon) {
         // Add coupon validation logic here if strict check needed
         await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usedCount: 1 } });
      }
    }

    // Atomic Stock Deduction
    for (const item of items) {
      const productId = item.product || item.id; 
      let product;

      if (item.selectedVariant) {
        product = await Product.findOneAndUpdate(
          { _id: productId, "variants.name": item.selectedVariant.name, "variants.stock": { $gte: item.quantity } },
          { $inc: { "variants.$.stock": -item.quantity } },
          { new: true }
        );
      } else {
        product = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }

      if (!product) throw new Error(`Insufficient stock for ${item.title}`);
      
      reservedItems.push({ product: productId, quantity: item.quantity, selectedVariant: item.selectedVariant });
    }

    const order = new Order({
      user: finalUserId,
      customerName,
      guestEmail: userEmail,
      items: items.map(item => ({
        product: item.product || item.id,
        title: item.title,
        image: item.image,
        price: item.discountPrice || item.price,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant
      })),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentResult ? 'Success' : 'Pending',
      paymentResult,
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      couponCode,
      invoiceId: `INV-${Date.now()}`
    });

    const createdOrder = await order.save();

    // Send Confirmation Email
    if (userEmail) {
        try {
            await sendEmail({
                email: userEmail,
                subject: `Order Confirmation - ${createdOrder.invoiceId}`,
                message: `Thank you for your order!\n\nOrder ID: ${createdOrder._id}\nTotal: $${createdOrder.total}\n\nWe will notify you when your item is shipped.`
            });
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
        }
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    if (reservedItems.length > 0) await restoreStock(reservedItems);
    res.status(400).json({ message: error.message || 'Order creation failed' });
  }
});

// @desc    Update order to paid (Frontend callback)
// @route   PUT /api/orders/:id/pay
// @access  Private (or Public with protection)
router.put('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.paymentStatus = 'Success';
      order.paymentResult = req.body.paymentResult;
      order.status = 'Confirmed';
      const updatedOrder = await order.save();
      
      // Send Payment Success Email
      const email = order.guestEmail || (await User.findById(order.user))?.email;
      if (email) {
          try {
             await sendEmail({
                 email: email,
                 subject: `Payment Received - Order ${order.invoiceId}`,
                 message: `We have received your payment of $${order.total}. Your order is now confirmed.`
             });
          } catch(e) { console.error(e); }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      if (req.user.role === 'ADMIN' || (order.user && order.user.equals(req.user._id))) {
         res.json(order);
      } else {
         res.status(401).json({ message: 'Not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status, paymentStatus, adminNotes } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const terminalStates = ['Cancelled', 'Returned', 'Refunded', 'Payment Failed'];
      const wasTerminal = terminalStates.includes(order.status);
      const isNowTerminal = terminalStates.includes(status);

      if (isNowTerminal && !wasTerminal) await restoreStock(order.items);

      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (adminNotes) order.adminNotes = adminNotes;

      const updatedOrder = await order.save();

      // Send Status Update Email
      const email = order.guestEmail || (await User.findById(order.user))?.email;
      if (email && status) {
          try {
             await sendEmail({
                 email: email,
                 subject: `Order Status Update - ${status}`,
                 message: `Your order ${order.invoiceId} is now ${status}.`
             });
          } catch(e) { console.error(e); }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
