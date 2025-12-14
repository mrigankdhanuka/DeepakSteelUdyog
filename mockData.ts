
import { Product, AnalyticsData, Coupon } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
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
      { id: 'v1-1', name: 'Matte Grey', type: 'Color', priceModifier: 0, stock: 5 },
      { id: 'v1-2', name: 'Royal Brown', type: 'Color', priceModifier: 500, stock: 3 },
      { id: 'v1-3', name: 'Ivory White', type: 'Color', priceModifier: 0, stock: 4 }
    ],
    tags: ['storage', 'heavy-duty', 'royal']
  },
  {
    id: '2',
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
      { id: 'v2-1', name: 'Queen Size (60x78)', type: 'Size', priceModifier: 0, stock: 15 },
      { id: 'v2-2', name: 'King Size (72x78)', type: 'Size', priceModifier: 2000, stock: 5 }
    ],
    tags: ['bedroom', 'furniture', 'durable']
  },
  {
    id: '3',
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
    tags: ['storage', 'box', 'security']
  },
  {
    id: '4',
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
    tags: ['luxury', 'wardrobe', 'mirror']
  },
  {
    id: '5',
    title: 'Industrial Iron Wall Frame',
    description: 'Decorative and functional iron wall frames for shelves or art. Adds a rugged, industrial aesthetic to your living space.',
    price: 1500.00,
    category: 'Decor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800',
    rating: 4.5,
    reviews: 30,
    stock: 100,
    tags: ['decor', 'frame', 'wall']
  },
  {
    id: '6',
    title: 'Heavy Duty Iron Table',
    description: 'A multi-purpose iron table suitable for study, dining, or workshops. Rust-proof coating and high weight capacity.',
    price: 3500.00,
    category: 'Tables',
    image: 'https://images.unsplash.com/photo-1549488352-22668706ea83?auto=format&fit=crop&w=800',
    rating: 4.6,
    reviews: 24,
    stock: 15,
    tags: ['table', 'office', 'study']
  }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Mon', sales: 4, revenue: 65000 },
  { name: 'Tue', sales: 3, revenue: 42000 },
  { name: 'Wed', sales: 6, revenue: 98000 },
  { name: 'Thu', sales: 5, revenue: 75000 },
  { name: 'Fri', sales: 8, revenue: 120000 },
  { name: 'Sat', sales: 12, revenue: 180000 },
  { name: 'Sun', sales: 10, revenue: 150000 },
];

export const MOCK_COUPONS: Coupon[] = [
  { 
    id: 'c1',
    code: 'WELCOME500', 
    type: 'FLAT', 
    value: 500, 
    minOrderValue: 5000, 
    expiryDate: '2025-12-31',
    isActive: true,
    usedCount: 12,
    usageLimit: 1000,
    userUsageLimit: 1
  },
  { 
    id: 'c2',
    code: 'STEEL10', 
    type: 'PERCENTAGE', 
    value: 10, 
    minOrderValue: 2000, 
    expiryDate: '2025-12-31',
    maxDiscount: 2000,
    isActive: true,
    usedCount: 45,
    applicableCategories: ['Almirah', 'Beds']
  },
];
