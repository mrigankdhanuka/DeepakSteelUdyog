
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
  value: { type: Number, required: true }, // Amount or Percentage
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number }, // For percentage coupons
  startDate: { type: Date },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number }, // Global usage limit
  usedCount: { type: Number, default: 0 },
  userUsageLimit: { type: Number }, // Limit per user
  applicableCategories: [{ type: String }], // Empty = All
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
