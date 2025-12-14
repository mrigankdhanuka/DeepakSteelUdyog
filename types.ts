
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Returned' | 'Refunded' | 'Payment Failed';

export type PaymentStatus = 'Pending' | 'Success' | 'Failed' | 'Refunded';

export interface Address {
  id?: string;
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: 'Home' | 'Office' | 'Other';
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  addresses: Address[];
  wishlist: string[]; // Array of Product IDs
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Large", "Red", "3-Door"
  type: 'Size' | 'Color' | 'Material';
  priceModifier: number; // 0 if same price, otherwise +/- amount
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  images?: string[]; 
  rating: number;
  reviews: number;
  stock: number; // Global stock or fallback
  variants?: ProductVariant[];
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string | 'guest'; // Support guest checkout
  guestEmail?: string; // For guest checkout
  customerName: string;
  shippingAddress: Address;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Card' | 'COD' | 'UPI';
  date: string;
  invoiceId?: string;
  adminNotes?: string; // Internal notes for admins
  couponCode?: string; // Track which coupon was used
}

export interface AnalyticsData {
  name: string;
  sales: number;
  revenue: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minOrderValue: number;
  maxDiscount?: number; // Max discount for percentage coupons
  expiryDate: string;
  startDate?: string;
  usageLimit?: number; // Total number of times coupon can be used
  usedCount: number; // Current usage count
  userUsageLimit?: number; // Limit per user
  applicableCategories?: string[]; // Specific categories only
  isActive: boolean;
}
