
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Allow guest checkout if handled by frontend
  },
  guestEmail: { type: String }, // For guest checkout
  customerName: { type: String, required: true },
  
  shippingAddress: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true }, // Snapshot
    image: { type: String, required: true },
    price: { type: Number, required: true }, // Snapshot price at purchase time
    quantity: { type: Number, required: true },
    selectedVariant: {
      name: String,
      type: String,
      priceModifier: Number
    }
  }],

  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String },

  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded', 'Payment Failed'],
    default: 'Placed'
  },
  
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['Card', 'COD', 'UPI'],
    required: true
  },
  
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
    signature: { type: String }
  },
  
  invoiceId: { type: String },
  adminNotes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
