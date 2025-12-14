
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { Product, CartItem, User, UserRole, Order, OrderStatus, ProductVariant, Coupon, Address, PaymentStatus, AnalyticsData, Review } from '../types';
import { checkCheckoutRateLimit, checkLoginRateLimit, recordLoginAttempt, sanitizeInput } from '../utils/security';
import { api, mapData } from '../utils/api';


interface ProductFetchParams {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

interface StoreContextType {
  products: Product[];
  shopProducts: Product[];
  shopPagination: { page: number; pages: number; total: number };
  fetchProducts: (params: ProductFetchParams) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product | null>;
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string; isUnverified?: boolean }>;
  register: (name: string, email: string, password?: string, role?: UserRole, adminKey?: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: (email: string, type: 'REGISTER' | 'RESET') => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, otp: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  addUserAddress: (address: Address) => Promise<void>;
  removeUserAddress: (id: string) => Promise<void>;
  updateUserAddress: (id: string, address: Partial<Address>) => Promise<void>;
  placeOrder: (orderData: any) => Promise<string>;
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
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (formData: FormData) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  lowStockItems: { product: Product, variant?: ProductVariant, count: number }[];
  isLoading: boolean;
  analytics: AnalyticsData[];
  addReview: (productId: string, rating: number, comment: string) => Promise<{ success: boolean, message?: string }>;
  fetchReviews: (productId: string) => Promise<Review[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [shopPagination, setShopPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  
  // User States
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const isInitialLoad = useRef(true);

  // --- API Actions ---

  const fetchProducts = useCallback(async (params: ProductFetchParams) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.category && params.category !== 'All') queryParams.append('category', params.category);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.sort) queryParams.append('sort', params.sort);

      const data = await api.get(`/products?${queryParams.toString()}`);
      setShopProducts(mapData(data.products));
      setShopPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      });
    } catch (error) {
      console.error('Failed to fetch shop products:', error);
    }
  }, []);

  const fetchProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const data = await api.get(`/products/${id}`);
      return mapData(data);
    } catch (error) {
      return null;
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('lumina_token');
    if (!token) {
       setIsLoading(false);
       isInitialLoad.current = false;
       return;
    }

    try {
       const userData = await api.get('/auth/profile');
       const mappedUser = mapData(userData);
       if (mappedUser.addresses) mappedUser.addresses = mapData(mappedUser.addresses);
       
       setUser(mappedUser);
       if (mappedUser.wishlist) setWishlist(mappedUser.wishlist);

       try {
         const backendCart = await api.get('/cart');
         if (Array.isArray(backendCart)) setCart(mapData(backendCart));
       } catch (e) { console.error("Cart load error", e); }

    } catch (error) {
       console.error("Session invalid");
       localStorage.removeItem('lumina_token');
       setUser(null);
    } finally {
       setIsLoading(false);
       isInitialLoad.current = false;
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user) {
        setOrders([]);
        return;
    }
    try {
      const endpoint = user.role === UserRole.ADMIN ? '/orders' : '/orders/myorders';
      const data = await api.get(endpoint);
      const mappedOrders = mapData(data).map((order: any) => ({
        ...order,
        userId: order.user && typeof order.user === 'object' ? (order.user._id || order.user.id) : order.user
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  }, [user]);

  const fetchAnalytics = useCallback(async () => {
    if (user?.role === UserRole.ADMIN) {
      try {
        const data = await api.get('/orders/analytics');
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics', error);
      }
    }
  }, [user]);

  useEffect(() => {
    loadUser();
    
    // Load mock products initially for home page until real API integration for that part is fully tested
    // But we update shop products via API
    setProducts(MOCK_PRODUCTS); 
    
    if (!localStorage.getItem('lumina_token')) {
      const savedCart = localStorage.getItem('lumina_cart');
      const savedWishlist = localStorage.getItem('lumina_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === UserRole.ADMIN) fetchAnalytics();
    } else {
      setOrders([]);
      setAnalytics([]);
    }
  }, [user, fetchOrders, fetchAnalytics]);

  useEffect(() => {
    if (user && !isInitialLoad.current) {
      const timer = setTimeout(() => {
        api.post('/cart', { cart }).catch(console.error);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (!user) {
      localStorage.setItem('lumina_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    if (!user) localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
  }, [wishlist, user]);

  // --- Auth Actions ---

  const login = async (email: string, password?: string) => {
    const safeEmail = sanitizeInput(email).toLowerCase();
    const rateLimit = checkLoginRateLimit(safeEmail);
    if (!rateLimit.allowed) return { success: false, message: `Too many attempts. Wait ${rateLimit.waitTime}s.` };

    try {
      const localCart = [...cart];
      const data = await api.post('/auth/login', { email: safeEmail, password });
      
      localStorage.setItem('lumina_token', data.token);
      const mappedUser = mapData(data);
      if (mappedUser.addresses) mappedUser.addresses = mapData(mappedUser.addresses);
      
      setUser(mappedUser);
      if(mappedUser.wishlist) setWishlist(mappedUser.wishlist);
      
      try {
        const backendCart = await api.get('/cart');
        const serverCart = Array.isArray(backendCart) ? mapData(backendCart) : [];
        const merged = [...serverCart];
        localCart.forEach(lItem => {
           if (!merged.find(sItem => sItem.id === lItem.id && sItem.selectedVariant?.id === lItem.selectedVariant?.id)) {
              merged.push(lItem);
           }
        });
        setCart(merged);
        if (localCart.length > 0) api.post('/cart', { cart: merged });
      } catch(e) {}

      recordLoginAttempt(safeEmail, true);
      return { success: true };
    } catch (err: any) {
      recordLoginAttempt(safeEmail, false);
      // Pass the 'isUnverified' flag if API returned it
      const errorData = err.message ? err.message : 'Login failed';
      return { success: false, message: errorData, isUnverified: err.message === 'Please verify your email address' };
    }
  };

  const register = async (name: string, email: string, password?: string, role: UserRole = UserRole.CUSTOMER, adminKey?: string) => {
    try {
      // Just initiate registration, backend sends OTP
      await api.post('/auth/register', { name, email, password, role, adminKey });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const data = await api.post('/auth/verify-email', { email, otp });
      localStorage.setItem('lumina_token', data.token);
      setUser({ ...mapData(data), addresses: mapData(data.addresses) || [], wishlist: data.wishlist || [] });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const resendOtp = async (email: string, type: 'REGISTER' | 'RESET') => {
    try {
      await api.post('/auth/resend-otp', { email, type });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_cart');
    localStorage.removeItem('lumina_wishlist');
    setUser(null);
    setCart([]);
    setOrders([]);
    setWishlist([]);
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgotpassword', { email });
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const resetPassword = async (email: string, otp: string, password: string) => {
    try {
      const data = await api.post('/auth/reset-password-otp', { email, otp, password });
      if (data.token) {
         localStorage.setItem('lumina_token', data.token);
         await loadUser();
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // --- Cart & Order Logic --- (Same as before)
  const cartTotal = useMemo(() => cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    const variantPrice = item.selectedVariant ? item.selectedVariant.priceModifier : 0;
    return sum + (price + variantPrice) * item.quantity;
  }, 0), [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let applicableTotal = 0;
    if (appliedCoupon.applicableCategories?.length) {
      cart.forEach(item => {
        if (appliedCoupon.applicableCategories?.includes(item.category)) {
          const price = item.discountPrice || item.price;
          const variantPrice = item.selectedVariant ? item.selectedVariant.priceModifier : 0;
          applicableTotal += (price + variantPrice) * item.quantity;
        }
      });
    } else {
      applicableTotal = cartTotal;
    }
    
    let discount = appliedCoupon.type === 'PERCENTAGE' 
      ? (applicableTotal * appliedCoupon.value) / 100 
      : appliedCoupon.value;
      
    if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) discount = appliedCoupon.maxDiscount;
    return Math.min(discount, cartTotal);
  }, [cart, appliedCoupon, cartTotal]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart(prev => {
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

  const placeOrder = async (orderData: any) => {
    if (!checkCheckoutRateLimit()) throw new Error("Please wait before placing another order.");
    
    try {
      const payload = {
        ...orderData,
        userId: user ? user.id : 'guest',
        couponCode: appliedCoupon?.code
      };
      
      const res = await api.post('/orders', payload);
      const newOrder = mapData(res);
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      if(user?.role === UserRole.ADMIN) fetchAnalytics();
      return newOrder.id;
    } catch (e: any) {
      throw new Error(e.message || "Order failed");
    }
  };

  const handlePaymentResult = (orderId: string, success: boolean) => {
    if (success) {
       setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'Success', status: 'Confirmed' } : o));
    } else {
       setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'Failed', status: 'Payment Failed' } : o));
    }
  };

  // --- Other Actions ---

  const toggleWishlist = async (productId: string) => {
    const isRemoving = wishlist.includes(productId);
    setWishlist(prev => isRemoving ? prev.filter(id => id !== productId) : [...prev, productId]);
    if (user) {
      try {
        isRemoving ? await api.delete(`/users/wishlist/${productId}`) : await api.post(`/users/wishlist/${productId}`, {});
      } catch (e) {
        setWishlist(prev => isRemoving ? [...prev, productId] : prev.filter(id => id !== productId));
      }
    }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    if (!user) return { success: false, message: 'Login required' };
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const data = await api.get(`/products/${productId}/reviews`);
      return mapData(data);
    } catch(e) { return []; }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const res = await api.put('/auth/profile', data);
      const mappedUser = mapData(res);
      if (mappedUser.addresses) mappedUser.addresses = mapData(mappedUser.addresses);
      setUser(mappedUser);
    } catch (e) {
      console.error("Profile update error", e);
      throw e;
    }
  };

  const addUserAddress = async (address: Address) => {
    try {
      const res = await api.post('/users/address', address);
      if (user) setUser({ ...user, addresses: mapData(res) });
    } catch (e) { throw e; }
  };

  const removeUserAddress = async (id: string) => {
    try {
      const res = await api.delete(`/users/address/${id}`);
      if (user) setUser({ ...user, addresses: mapData(res) });
    } catch (e) { throw e; }
  };

  const updateUserAddress = async (id: string, address: Partial<Address>) => {
    try {
      const res = await api.put(`/users/address/${id}`, address);
      if (user) setUser({ ...user, addresses: mapData(res) });
    } catch (e) { throw e; }
  };

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const res = await api.post('/products', p);
    setProducts(prev => [...prev, mapData(res)]);
  };
  const updateProduct = async (id: string, p: Partial<Product>) => {
    await api.put(`/products/${id}`, p);
    setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, ...p } : prod));
  };
  const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };
  const uploadImage = async (formData: FormData) => {
    return await api.upload('/upload', formData);
  };
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await api.put(`/orders/${id}/status`, { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };
  const addCoupon = async (c: Coupon) => {
    const res = await api.post('/coupons', c);
    setCoupons(prev => [...prev, mapData(res)]);
  };
  const updateCoupon = async (id: string, u: Partial<Coupon>) => {
    await api.put(`/coupons/${id}`, u);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...u } : c));
  };
  const deleteCoupon = async (id: string) => {
    await api.delete(`/coupons/${id}`);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const lowStockItems = useMemo(() => {
    const items: { product: Product, variant?: ProductVariant, count: number }[] = [];
    products.forEach(p => {
      if (p.variants?.length) {
        p.variants.forEach(v => { if(v.stock <= 5) items.push({ product: p, variant: v, count: v.stock }); });
      } else {
        if(p.stock <= 5) items.push({ product: p, count: p.stock });
      }
    });
    return items;
  }, [products]);

  const applyCoupon = (code: string) => {
    const coupon = coupons.find(c => c.code === sanitizeInput(code));
    if (!coupon || !coupon.isActive) return { success: false, message: 'Invalid or inactive coupon' };
    if (new Date(coupon.expiryDate) < new Date()) return { success: false, message: 'Expired' };
    if (cartTotal < coupon.minOrderValue) return { success: false, message: `Min order: $${coupon.minOrderValue}` };
    setAppliedCoupon(coupon);
    return { success: true, message: 'Applied!' };
  };

  return (
    <StoreContext.Provider value={{
      products, shopProducts, shopPagination, fetchProducts, fetchProduct,
      cart, user, orders, searchQuery, setSearchQuery,
      addToCart, removeFromCart, updateQuantity, clearCart,
      login, register, verifyEmail, resendOtp, forgotPassword, resetPassword, logout,
      updateUserProfile, addUserAddress, removeUserAddress, updateUserAddress,
      placeOrder, handlePaymentResult, restoreCartFromOrder: (id) => {}, downloadInvoice: (id) => {}, cancelOrder: (id) => updateOrderStatus(id, 'Cancelled'), requestReturn: (id) => updateOrderStatus(id, 'Return Requested'), updateOrderDetails: (id, u) => setOrders(prev => prev.map(o => o.id === id ? { ...o, ...u } : o)),
      cartTotal, wishlist, toggleWishlist, recentlyViewed, addToRecentlyViewed: (p) => setRecentlyViewed(prev => [p, ...prev.filter(x => x.id !== p.id)].slice(0,5)),
      coupons, appliedCoupon, discountAmount, applyCoupon, removeCoupon: () => setAppliedCoupon(null),
      addProduct, updateProduct, deleteProduct, uploadImage, updateOrderStatus, addCoupon, updateCoupon, deleteCoupon,
      lowStockItems, isLoading, analytics, addReview, fetchReviews
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
