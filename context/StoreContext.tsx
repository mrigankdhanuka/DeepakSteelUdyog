import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, CartItem, User, UserRole, Order, OrderStatus, ProductVariant, Coupon, Address, PaymentStatus } from '../types';
import { MOCK_PRODUCTS, MOCK_COUPONS } from '../mockData';
import { hashPassword, verifyPassword, sanitizeInput, checkLoginRateLimit, recordLoginAttempt, checkCheckoutRateLimit } from '../utils/security';

// Internal type for stored user with password hash
interface StoredUser extends User {
  passwordHash: string;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password?: string, role?: UserRole, adminKey?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  addUserAddress: (address: Address) => void;
  removeUserAddress: (id: string) => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'date' | 'invoiceId' | 'paymentStatus' | 'couponCode'>) => Promise<string>;
  handlePaymentResult: (orderId: string, success: boolean) => void;
  restoreCartFromOrder: (orderId: string) => void;
  downloadInvoice: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  requestReturn: (orderId: string) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean, message: string };
  removeCoupon: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  lowStockItems: { product: Product, variant?: ProductVariant, count: number }[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Features State
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load Data on Mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lumina_cart');
    const savedWishlist = localStorage.getItem('lumina_wishlist');
    
    // Secure Session Management (Mock JWT)
    const sessionToken = localStorage.getItem('lumina_token');
    const sessionUserStr = localStorage.getItem('lumina_user');
    
    if (sessionToken && sessionUserStr) {
      try {
        const payload = JSON.parse(atob(sessionToken.split('.')[1])); // Mock decode
        if (Date.now() < payload.exp) {
           setUser(JSON.parse(sessionUserStr));
        } else {
           console.log("Session expired.");
           logout(); // Auto logout
        }
      } catch (e) {
        logout();
      }
    }
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    
    // Mock orders
    const mockOrders: Order[] = [
      {
        id: 'ORD-171542',
        userId: 'u_demo_1',
        customerName: 'Sarah Smith',
        shippingAddress: { 
          fullName: 'Sarah Smith',
          phoneNumber: '9876543210',
          street: '123 Main', 
          city: 'Jaipur', 
          state: 'RJ', 
          zipCode: '302001', 
          country: 'India',
          type: 'Home'
        },
        items: [{ ...MOCK_PRODUCTS[0], quantity: 1 }],
        subtotal: 18500,
        tax: 3330,
        shippingCost: 0,
        discount: 0,
        total: 21830,
        status: 'Delivered',
        paymentStatus: 'Success',
        paymentMethod: 'Card',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        invoiceId: 'INV-001',
        adminNotes: 'Customer requested evening delivery.'
      }
    ];
    setOrders(prev => prev.length ? prev : mockOrders);
  }, []);

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
    localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
  }, [cart, wishlist]);

  // --- Inventory Helpers ---
  const lowStockItems = useMemo(() => {
    const threshold = 5;
    const items: { product: Product, variant?: ProductVariant, count: number }[] = [];
    
    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          if (v.stock <= threshold) {
            items.push({ product: p, variant: v, count: v.stock });
          }
        });
      } else {
        if (p.stock <= threshold) {
          items.push({ product: p, count: p.stock });
        }
      }
    });
    return items;
  }, [products]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    const variantPrice = item.selectedVariant ? item.selectedVariant.priceModifier : 0;
    return sum + (price + variantPrice) * item.quantity;
  }, 0), [cart]);

  // --- Discount Calculation Logic ---
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    let applicableTotal = 0;

    // Check Categories
    if (appliedCoupon.applicableCategories && appliedCoupon.applicableCategories.length > 0) {
      // Sum items that match the category
      cart.forEach(item => {
        if (appliedCoupon.applicableCategories?.includes(item.category)) {
          const price = item.discountPrice || item.price;
          const variantPrice = item.selectedVariant ? item.selectedVariant.priceModifier : 0;
          applicableTotal += (price + variantPrice) * item.quantity;
        }
      });
    } else {
      // Apply to full cart
      applicableTotal = cartTotal;
    }

    if (applicableTotal === 0) return 0;

    let discount = 0;
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = (applicableTotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.value;
    }

    // Ensure discount doesn't exceed total
    return Math.min(discount, cartTotal);
  }, [cart, appliedCoupon, cartTotal]);


  // --- Cart Actions ---
  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart(prev => {
      // Create a unique key for Product + Variant
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
      
      const existing = prev.find(item => {
        const itemId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
        return itemId === cartItemId;
      });

      if (existing) {
        return prev.map(item => {
          const itemId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
          return itemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => {
        const itemId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
        return itemId !== cartItemId;
    }));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => {
        const itemId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
        return itemId === cartItemId ? { ...item, quantity } : item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // --- Wishlist Logic ---
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // --- Recently Viewed Logic ---
  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 5); // Keep last 5
    });
  };

  // --- Coupon Logic ---
  const applyCoupon = (code: string): { success: boolean, message: string } => {
    const safeCode = sanitizeInput(code);
    const coupon = coupons.find(c => c.code === safeCode);
    
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code.' };
    }

    if (!coupon.isActive) {
      return { success: false, message: 'This coupon is no longer active.' };
    }
    
    if (new Date(coupon.expiryDate) < new Date()) {
      return { success: false, message: 'Coupon has expired.' };
    }

    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
      return { success: false, message: 'Coupon is not valid yet.' };
    }
    
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: 'Coupon usage limit reached.' };
    }

    if (user && coupon.userUsageLimit !== undefined) {
      const userUsageCount = orders.filter(o => o.userId === user.id && o.couponCode === safeCode).length;
      if (userUsageCount >= coupon.userUsageLimit) {
        return { success: false, message: `You have already used this coupon ${coupon.userUsageLimit} times.` };
      }
    }

    if (cartTotal < coupon.minOrderValue) {
      return { success: false, message: `Minimum order value of $${coupon.minOrderValue} required.` };
    }

    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableItem = cart.some(item => coupon.applicableCategories?.includes(item.category));
      if (!hasApplicableItem) {
        return { success: false, message: `This coupon is only applicable on: ${coupon.applicableCategories.join(', ')}` };
      }
    }

    setAppliedCoupon(coupon);
    return { success: true, message: 'Coupon applied successfully!' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // --- Admin Coupon Actions ---
  const addCoupon = (coupon: Coupon) => {
    setCoupons(prev => [...prev, coupon]);
  }

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  }

  // --- Secure Auth Actions ---
  
  const getUsersDb = (): StoredUser[] => {
    const dbStr = localStorage.getItem('lumina_users_db');
    return dbStr ? JSON.parse(dbStr) : [];
  };

  const saveUsersDb = (db: StoredUser[]) => {
    localStorage.setItem('lumina_users_db', JSON.stringify(db));
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const safeEmail = sanitizeInput(email).toLowerCase();
    
    // Rate Limit Check
    const rateLimit = checkLoginRateLimit(safeEmail);
    if (!rateLimit.allowed) {
      return { success: false, message: `Too many attempts. Try again in ${rateLimit.waitTime} seconds.` };
    }

    const db = getUsersDb();
    const foundUser = db.find(u => u.email === safeEmail);

    if (foundUser && password) {
      const match = await verifyPassword(password, foundUser.passwordHash);
      recordLoginAttempt(safeEmail, match); // Track attempt

      if (match) {
        const { passwordHash, ...userProfile } = foundUser;
        // Mock JWT generation
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({ sub: userProfile.id, role: userProfile.role, exp: Date.now() + (24 * 60 * 60 * 1000) }));
        const signature = "mockSignature"; 
        const token = `${header}.${payload}.${signature}`;
        
        localStorage.setItem('lumina_token', token);
        localStorage.setItem('lumina_user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true };
      }
    }
    
    recordLoginAttempt(safeEmail, false);
    return { success: false, message: 'Invalid email or password.' };
  };

  const register = async (name: string, email: string, password?: string, role: UserRole = UserRole.CUSTOMER, adminKey?: string): Promise<{ success: boolean; message?: string }> => {
    const safeEmail = sanitizeInput(email).toLowerCase();
    const safeName = sanitizeInput(name);
    
    if (!password) return { success: false, message: 'Password required' };

    const db = getUsersDb();
    if (db.find(u => u.email === safeEmail)) {
      return { success: false, message: 'User already exists.' };
    }

    // Verify Admin Key if creating admin
    if (role === UserRole.ADMIN && adminKey !== 'LUMINA_ADMIN') {
       return { success: false, message: 'Invalid Admin Key' };
    }

    const passwordHash = await hashPassword(password);
    
    const newUser: StoredUser = {
      id: `u_${Date.now()}`,
      name: safeName,
      email: safeEmail,
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${safeName}&background=0D9488&color=fff`,
      wishlist: [],
      addresses: [],
      phoneNumber: '',
      passwordHash
    };

    db.push(newUser);
    saveUsersDb(db);
    
    // Auto login after register
    return login(safeEmail, password);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setWishlist([]);
    setAppliedCoupon(null);
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
    
    // Update DB as well
    const db = getUsersDb();
    const dbIdx = db.findIndex(u => u.id === user.id);
    if (dbIdx > -1) {
       db[dbIdx] = { ...db[dbIdx], ...data };
       saveUsersDb(db);
    }
  };

  const addUserAddress = (address: Address) => {
    if (!user) return;
    const newAddress = { ...address, id: `addr_${Date.now()}` };
    const updatedAddresses = address.isDefault 
      ? [...user.addresses.map(a => ({...a, isDefault: false})), newAddress]
      : [...user.addresses, newAddress];
    
    updateUserProfile({ addresses: updatedAddresses });
  };

  const removeUserAddress = (addressId: string) => {
    if (!user) return;
    updateUserProfile({ 
      addresses: user.addresses.filter(a => a.id !== addressId) 
    });
  };

  // --- Order & Payment Actions ---
  
  const placeOrder = async (orderData: Omit<Order, 'id' | 'status' | 'date' | 'invoiceId' | 'paymentStatus' | 'couponCode'>) => {
    // Checkout Rate Limit
    if (!checkCheckoutRateLimit()) {
       throw new Error("Please wait a moment before placing another order.");
    }

    // Sanitize shipping address
    const sanitizedAddress = {
       ...orderData.shippingAddress,
       fullName: sanitizeInput(orderData.shippingAddress.fullName),
       street: sanitizeInput(orderData.shippingAddress.street),
       city: sanitizeInput(orderData.shippingAddress.city)
    };

    // Initial deduction of stock (Reserve items)
    const updatedProducts = [...products];
    orderData.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.id);
      if (productIndex > -1) {
        if (item.selectedVariant) {
           const variantIndex = updatedProducts[productIndex].variants?.findIndex(v => v.id === item.selectedVariant?.id);
           if (variantIndex !== undefined && variantIndex > -1 && updatedProducts[productIndex].variants) {
              updatedProducts[productIndex].variants![variantIndex].stock -= item.quantity;
           }
        } else {
           updatedProducts[productIndex].stock -= item.quantity;
        }
      }
    });
    setProducts(updatedProducts);

    // Update Coupon Usage
    if (appliedCoupon) {
      setCoupons(prev => prev.map(c => 
        c.code === appliedCoupon.code ? { ...c, usedCount: c.usedCount + 1 } : c
      ));
    }

    const newOrder: Order = {
      ...orderData,
      shippingAddress: sanitizedAddress,
      id: `ORD-${Math.floor(Math.random() * 1000000)}`,
      status: 'Placed', // Initially placed, pending payment confirmation
      paymentStatus: 'Pending',
      date: new Date().toISOString(),
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      couponCode: appliedCoupon?.code
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart(); // Cart is cleared here, but we can restore it if payment fails
    return newOrder.id;
  };

  const handlePaymentResult = (orderId: string, success: boolean) => {
     if (success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'Success' } : o));
     } else {
        // Payment Failed: Restore Stock
        const order = orders.find(o => o.id === orderId);
        if (order) {
           const updatedProducts = [...products];
           order.items.forEach(item => {
             const productIndex = updatedProducts.findIndex(p => p.id === item.id);
             if (productIndex > -1) {
               if (item.selectedVariant) {
                  const variantIndex = updatedProducts[productIndex].variants?.findIndex(v => v.id === item.selectedVariant?.id);
                  if (variantIndex !== undefined && variantIndex > -1 && updatedProducts[productIndex].variants) {
                     updatedProducts[productIndex].variants![variantIndex].stock += item.quantity;
                  }
               } else {
                  updatedProducts[productIndex].stock += item.quantity;
               }
             }
           });
           setProducts(updatedProducts);
           
           setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Payment Failed', paymentStatus: 'Failed' } : o));
        }
     }
  };

  const restoreCartFromOrder = (orderId: string) => {
     const order = orders.find(o => o.id === orderId);
     if (order) {
        setCart(order.items);
     }
  };

  const downloadInvoice = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Build HTML Content for Invoice
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice #${order.invoiceId}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .company-info { text-align: right; font-size: 14px; color: #666; }
            .invoice-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #111; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .box { width: 45%; }
            .box h4 { margin-top: 0; color: #666; font-size: 12px; text-transform: uppercase; }
            .box p { margin: 5px 0; font-size: 14px; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; background: #f9f9f9; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .totals { float: right; width: 300px; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .row.total { font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; font-size: 16px; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Deepak Steel Udyog</div>
            <div class="company-info">
              <p>Fatehpur Shekhawati, Rajasthan - 332301</p>
              <p>GSTIN: 08ABCDE1234F1Z5</p>
              <p>+91 98290 53307</p>
            </div>
          </div>

          <div class="invoice-title">TAX INVOICE</div>

          <div class="details-grid">
            <div class="box">
              <h4>Billed To:</h4>
              <p><strong>${order.customerName}</strong></p>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
              <p>Phone: ${order.shippingAddress.phoneNumber}</p>
            </div>
            <div class="box">
              <h4>Invoice Details:</h4>
              <p><strong>Invoice No:</strong> ${order.invoiceId}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    ${item.title}
                    ${item.selectedVariant ? `<br/><small style="color:#666">Variant: ${item.selectedVariant.name}</small>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>$${((item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0)).toFixed(2)}</td>
                  <td style="text-align:right">$${(((item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0)) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
             <div class="row"><span>Subtotal:</span> <span>$${order.subtotal.toFixed(2)}</span></div>
             <div class="row"><span>Shipping:</span> <span>$${order.shippingCost.toFixed(2)}</span></div>
             <div class="row"><span>Tax (18%):</span> <span>$${order.tax.toFixed(2)}</span></div>
             ${order.discount > 0 ? `<div class="row" style="color:green"><span>Discount:</span> <span>-$${order.discount.toFixed(2)}</span></div>` : ''}
             <div class="row total"><span>Total:</span> <span>$${order.total.toFixed(2)}</span></div>
          </div>
          
          <div style="clear:both"></div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.invoiceId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let updatedPaymentStatus = order.paymentStatus;
    
    // 1. Stock Restoration Logic
    const terminalStates = ['Cancelled', 'Returned', 'Refunded', 'Payment Failed'];
    const alreadyRestored = terminalStates.includes(order.status);
    // Restore if cancelling or returning AND we haven't already restored for this order
    const shouldRestore = (status === 'Cancelled' || status === 'Returned') && !alreadyRestored;

    if (shouldRestore) {
      setProducts(currentProducts => {
        const updatedProducts = [...currentProducts];
        order.items.forEach(item => {
           const productIndex = updatedProducts.findIndex(p => p.id === item.id);
           if (productIndex > -1) {
              if (item.selectedVariant) {
                 const variantIndex = updatedProducts[productIndex].variants?.findIndex(v => v.id === item.selectedVariant?.id);
                 if (variantIndex !== undefined && variantIndex > -1 && updatedProducts[productIndex].variants) {
                    updatedProducts[productIndex].variants![variantIndex].stock += item.quantity;
                 }
              } else {
                 updatedProducts[productIndex].stock += item.quantity;
              }
           }
        });
        return updatedProducts;
      });
    }
    
    // 2. Auto Refund Logic
    if ((status === 'Cancelled' || status === 'Returned') && order.paymentStatus === 'Success') {
       updatedPaymentStatus = 'Refunded';
    }

    setOrders(prev => prev.map(o => 
       o.id === orderId ? { ...o, status, paymentStatus: updatedPaymentStatus } : o
    ));
  };

  // Manual Override for Admins
  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
     setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Check if order allows cancellation
    const nonCancellable = ['Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Returned', 'Refunded', 'Cancelled'];
    if (nonCancellable.includes(order.status)) {
        alert('Order cannot be cancelled at this stage.');
        return;
    }
    
    updateOrderStatus(orderId, 'Cancelled');
  };

  const requestReturn = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status !== 'Delivered') return;
    
    // Check Return Policy Window (e.g., 7 days)
    const orderDate = new Date(order.date);
    const diffTime = Math.abs(Date.now() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    // Assuming 7 days policy
    if (diffDays > 7) {
       alert(`Return policy window (7 days) has expired. (${diffDays} days since order)`);
       return;
    }

    updateOrderStatus(orderId, 'Return Requested');
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: (Math.max(...products.map(p => parseInt(p.id))) + 1).toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      products, cart, user, orders, searchQuery,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, clearCart,
      login, register, logout, placeOrder, handlePaymentResult, restoreCartFromOrder, downloadInvoice, cancelOrder, requestReturn, updateOrderDetails, cartTotal, updateUserProfile, addUserAddress, removeUserAddress,
      wishlist, toggleWishlist, recentlyViewed, addToRecentlyViewed,
      coupons, appliedCoupon, discountAmount, applyCoupon, removeCoupon,
      addProduct, updateProduct, deleteProduct, updateOrderStatus, addCoupon, updateCoupon, deleteCoupon,
      lowStockItems
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
