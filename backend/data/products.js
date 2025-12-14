
const products = [
  {
    title: 'Royal Iron Almirah - Heritage Series',
    description: 'A premium 3-door iron almirah with a superior royal finish. Featuring heavy-duty gauge steel, integrated locker system, and ample storage space. Eco-friendly and built to last.',
    price: 18500.00,
    category: 'Almirah',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1595428774780-1a3ebc7504e9?auto=format&fit=crop&w=800',
    ],
    rating: 4.9,
    reviews: 145,
    stock: 12,
    variants: [
      { name: 'Matte Grey', type: 'Color', priceModifier: 0, stock: 5 },
      { name: 'Royal Brown', type: 'Color', priceModifier: 500, stock: 3 },
      { name: 'Ivory White', type: 'Color', priceModifier: 0, stock: 4 }
    ],
    tags: ['storage', 'heavy-duty', 'royal']
  },
  {
    title: 'Modern Iron Double Bed',
    description: 'Contemporary design meets industrial strength. This double bed frame is crafted from high-quality iron with a powder-coated matte finish. No creaking, easy assembly, and termite proof.',
    price: 12500.00,
    discountPrice: 10999.00,
    category: 'Beds',
    image: 'https://images.unsplash.com/photo-1505693416388-b0346efee535?auto=format&fit=crop&w=800',
    images: [
      'https://images.unsplash.com/photo-1505693416388-b0346efee535?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae4?auto=format&fit=crop&w=800',
    ],
    rating: 4.8,
    reviews: 85,
    stock: 20,
    variants: [
      { name: 'Queen Size (60x78)', type: 'Size', priceModifier: 0, stock: 15 },
      { name: 'King Size (72x78)', type: 'Size', priceModifier: 2000, stock: 5 }
    ],
    tags: ['bedroom', 'furniture', 'durable']
  },
  {
    title: 'Secure Iron Storage Box (Trunk)',
    description: 'Heavy-duty iron storage box for keeping your valuables and clothes safe. Perfect for long-term storage, moisture resistant, and lockable.',
    price: 4500.00,
    category: 'Storage',
    image: 'https://images.unsplash.com/photo-1532501659728-c11649392e27?auto=format&fit=crop&w=800',
    images: [
      'https://images.unsplash.com/photo-1532501659728-c11649392e27?auto=format&fit=crop&w=800',
    ],
    rating: 4.7,
    reviews: 42,
    stock: 50,
    variants: [],
    tags: ['storage', 'box', 'security']
  },
  {
    title: 'Luxury Wardrobe with Mirror',
    description: 'Elegant iron wardrobe featuring a full-length mirror and custom shelving. Ideal for modern bedrooms needing a sleek yet robust storage solution.',
    price: 22000.00,
    category: 'Almirah',
    image: 'https://images.unsplash.com/photo-1620023647317-5757cd557876?auto=format&fit=crop&w=800',
    images: [
      'https://images.unsplash.com/photo-1620023647317-5757cd557876?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800'
    ],
    rating: 4.9,
    reviews: 56,
    stock: 8,
    variants: [],
    tags: ['luxury', 'wardrobe', 'mirror']
  },
  {
    title: 'Industrial Iron Wall Frame',
    description: 'Decorative and functional iron wall frames for shelves or art. Adds a rugged, industrial aesthetic to your living space.',
    price: 1500.00,
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800',
    rating: 4.5,
    reviews: 30,
    stock: 100,
    variants: [],
    tags: ['decor', 'frame', 'wall']
  },
  {
    title: 'Heavy Duty Iron Table',
    description: 'A multi-purpose iron table suitable for study, dining, or workshops. Rust-proof coating and high weight capacity.',
    price: 3500.00,
    category: 'Tables',
    image: 'https://images.unsplash.com/photo-1549488352-22668706ea83?auto=format&fit=crop&w=800',
    rating: 4.6,
    reviews: 24,
    stock: 15,
    variants: [],
    tags: ['table', 'office', 'study']
  }
];

module.exports = products;
