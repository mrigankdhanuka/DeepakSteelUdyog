
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Queen Size"
  type: { type: String, enum: ['Size', 'Color', 'Material'], required: true },
  priceModifier: { type: Number, default: 0 },
  stock: { type: Number, required: true }
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  variants: [variantSchema],
  tags: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
