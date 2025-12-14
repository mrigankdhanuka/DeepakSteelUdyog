
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Address, Order } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, MapPin, CreditCard, Banknote, ShieldCheck, Tag, Loader2, CheckCircle2, Home, Briefcase, UserCircle2, AlertTriangle, RefreshCcw, XCircle, MessageSquareCode } from 'lucide-react';
import { api } from '../utils/api';

// Add Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage = () => {
  const { cart, cartTotal, discountAmount, user, applyCoupon, appliedCoupon, removeCoupon, placeOrder, handlePaymentResult, restoreCartFromOrder } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Address, 3: Payment
  
  // Payment States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  
  // COD Logic
  const [showCodOtp, setShowCodOtp] = useState(false);
  const [codOtp, setCodOtp] = useState('');
  const [codOtpError, setCodOtpError] = useState('');
  const serviceablePincodes = ['302001', '332301', '110001', '400001']; 
  
  // Checkout State
  const [guestEmail, setGuestEmail] = useState('');
  const [address, setAddress] = useState<Address>({
    fullName: '', phoneNumber: '', street: '', city: '', state: '', zipCode: '', country: 'India', type: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'COD'>('Card');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
       setAddress(prev => ({
          ...prev,
          fullName: user.name,
          phoneNumber: user.phoneNumber || ''
       }));
       // Select default address if exists
       const defaultAddr = user.addresses.find(a => a.isDefault);
       if (defaultAddr) {
         setAddress(defaultAddr);
         setSelectedSavedAddressId(defaultAddr.id || null);
       }
    }
  }, [user]);

  const handleSavedAddressSelect = (addr: Address) => {
    setAddress(addr);
    setSelectedSavedAddressId(addr.id || null);
  };

  // Calculations
  const shippingCost = cartTotal > 500 ? 0 : 50;
  const tax = cartTotal * 0.18; // 18% GST simulation
  const finalTotal = Math.max(0, cartTotal + tax + shippingCost - discountAmount);
  
  // COD Validity Checks
  const isPincodeServiceable = serviceablePincodes.includes(address.zipCode);
  const isCodAllowedValue = finalTotal <= 20000;
  const isCodAvailable = isPincodeServiceable && isCodAllowedValue;

  useEffect(() => {
    // Switch to Card if COD becomes invalid due to changes
    if (step === 3 && paymentMethod === 'COD' && !isCodAvailable) {
       setPaymentMethod('Card');
    }
  }, [step, paymentMethod, isCodAvailable]);

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput) return;
    
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponInput('');
    } else {
      setCouponError(result.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return; // Prevent double clicks
    
    // Intercept for COD OTP
    if (paymentMethod === 'COD') {
      setShowCodOtp(true);
      return;
    }
    
    // Process Card Order
    await processRazorpayPayment();
  };

  const createOrderPayload = () => {
    return {
      userId: user ? user.id : 'guest',
      customerName: address.fullName || (user ? user.name : 'Guest'),
      guestEmail: user ? undefined : guestEmail,
      shippingAddress: address,
      items: cart,
      subtotal: cartTotal,
      tax,
      shippingCost,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod,
      // No payment result initially
    };
  };

  const processRazorpayPayment = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      // 1. Create DB Order (Pending Payment)
      const orderPayload = createOrderPayload();
      const dbOrderId = await placeOrder(orderPayload);
      setPendingOrderId(dbOrderId);

      // 2. Create Razorpay Order
      const orderParams = { 
          amount: finalTotal, 
          currency: 'INR',
          notes: { order_id: dbOrderId } // Pass DB ID to Razorpay for webhook mapping
      };
      const razorpayOrder = await api.post('/payment/create-order', orderParams);
      const keyData = await api.get('/payment/key');

      // 3. Open Razorpay Options
      const options = {
        key: keyData.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Deepak Steel Udyog",
        description: "Furniture Order",
        image: "https://ui-avatars.com/api/?name=Deepak+Steel&background=2563eb&color=fff",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
           // 4. Payment Success - Update DB Order
           try {
              await api.put(`/orders/${dbOrderId}/pay`, { paymentResult: response });
              handlePaymentResult(dbOrderId, true);
              setOrderSuccessId(dbOrderId);
           } catch (error: any) {
              setPaymentError('Payment successful but failed to update order. Please contact support.');
           }
        },
        prefill: {
          name: address.fullName,
          email: user?.email || guestEmail,
          contact: address.phoneNumber
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function() {
             setIsProcessing(false);
             // Note: Order exists in DB as 'Pending'/'Placed' but Payment 'Pending'.
             // User can retry. We could navigate them to an 'Order Pending' page or keep them here.
             // For now, keep here. If they retry, it creates a NEW order to avoid complexity.
             // Ideally, we resume existing order, but keeping it simple.
             restoreCartFromOrder(dbOrderId); // Restore items to cart so they can try again without empty cart
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error(error);
      setPaymentError(error.message || 'Payment initiation failed.');
      setIsProcessing(false);
      // If we created an order but failed before RP open, restore items
      if (pendingOrderId) restoreCartFromOrder(pendingOrderId);
    }
  };

  const verifyCodOtpAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codOtp === '1234') {
       setShowCodOtp(false);
       setIsProcessing(true);
       try {
          const orderData = createOrderPayload();
          const orderId = await placeOrder(orderData); // This is enough for COD
          setOrderSuccessId(orderId);
       } catch (error: any) {
          setPaymentError(error.message);
          setIsProcessing(false);
       }
    } else {
       setCodOtpError('Invalid OTP. Please enter 1234.');
    }
  };

  // --- Render Views ---

  if (orderSuccessId) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-2">Order ID: <span className="font-mono font-bold text-gray-900">{orderSuccessId}</span></p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Thank you for shopping with Deepak Steel Udyog. An invoice has been sent to {user ? user.email : guestEmail}.
        </p>
        <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">Download Invoice</button>
            <Link to="/" className="px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // Handle Empty Cart (Only if not processing and no success)
  if (cart.length === 0 && !isProcessing && !orderSuccessId) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto gap-8 grid grid-cols-1 lg:grid-cols-12 py-8 animate-in fade-in relative">
      
      {/* COD OTP Modal */}
      {showCodOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                   <MessageSquareCode className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Order</h3>
                <p className="text-gray-500 text-sm mt-1">
                   Please enter the code <span className="font-bold text-gray-900">1234</span> to confirm your Cash on Delivery order.
                </p>
             </div>
             <form onSubmit={verifyCodOtpAndPlaceOrder} className="space-y-4">
                <input 
                  type="text" 
                  maxLength={4}
                  value={codOtp}
                  onChange={(e) => {
                     setCodOtp(e.target.value.replace(/[^0-9]/g, ''));
                     setCodOtpError('');
                  }}
                  className="w-full text-center text-3xl tracking-[1em] font-bold py-3 border-b-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                  placeholder="0000"
                  autoFocus
                />
                {codOtpError && <p className="text-red-500 text-xs text-center">{codOtpError}</p>}
                
                <div className="flex gap-3 mt-4">
                   <button 
                     type="button" 
                     onClick={() => setShowCodOtp(false)}
                     className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={codOtp.length !== 4}
                     className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                   >
                     Confirm
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Main Checkout Form */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Payment Failure Alert */}
        {paymentError && (
           <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in shake">
              <XCircle className="h-6 w-6 text-red-600 shrink-0" />
              <div>
                 <h3 className="font-bold text-red-800">Payment Failed</h3>
                 <p className="text-red-600 text-sm mt-1">{paymentError}</p>
                 <p className="text-red-500 text-xs mt-2">Don't worry, your items have been restored to the cart.</p>
              </div>
           </div>
        )}

        {/* Step 1: Account Info */}
        <div className={`bg-white p-6 rounded-2xl border ${step === 1 ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-200'} shadow-sm transition-all`}>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
               Contact Information
             </h2>
             {step > 1 && <button onClick={() => setStep(1)} className="text-sm text-blue-600 underline">Edit</button>}
           </div>
           
           {(step === 1) && (
             <div className="pl-10 animate-in fade-in">
                {user ? (
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
                      <div>
                         <p className="font-bold text-gray-900">Logged in as {user.name}</p>
                         <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-4">
                     <p className="text-sm text-gray-500">Checkout as a guest or login to save your order.</p>
                     <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                           type="email" 
                           value={guestEmail}
                           onChange={(e) => setGuestEmail(e.target.value)}
                           className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           placeholder="sarah@example.com"
                        />
                     </div>
                     {guestEmail.includes('@') && (
                       <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <UserCircle2 className="h-4 w-4" />
                          Continuing as Guest. You won't be able to track this order from a dashboard.
                       </div>
                     )}
                   </div>
                )}
                <button 
                  onClick={() => {
                     if (user || (guestEmail && guestEmail.includes('@'))) setStep(2);
                  }}
                  className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Continue to Shipping
                </button>
             </div>
           )}
        </div>

        {/* Step 2: Shipping Address */}
        <div className={`bg-white p-6 rounded-2xl border ${step === 2 ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-200'} shadow-sm transition-all`}>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
               Shipping Address
             </h2>
             {step > 2 && <button onClick={() => setStep(2)} className="text-sm text-blue-600 underline">Edit</button>}
           </div>

           {(step === 2) && (
              <div className="pl-10 animate-in fade-in">
                 
                 {/* Saved Addresses */}
                 {user && user.addresses.length > 0 && (
                   <div className="mb-6 grid gap-4 md:grid-cols-2">
                     {user.addresses.map(addr => (
                       <div 
                        key={addr.id}
                        onClick={() => handleSavedAddressSelect(addr)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedSavedAddressId === addr.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
                             {addr.type === 'Home' ? <Home className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                             {addr.type}
                           </span>
                           {selectedSavedAddressId === addr.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                         </div>
                         <p className="text-sm font-medium">{addr.fullName}</p>
                         <p className="text-xs text-gray-500">{addr.street}, {addr.city}</p>
                         <p className="text-xs text-gray-500">{addr.state} - {addr.zipCode}</p>
                         <p className="text-xs text-gray-500 mt-1">Ph: {addr.phoneNumber}</p>
                       </div>
                     ))}
                     <div 
                        onClick={() => {
                          setAddress({ fullName: user.name, phoneNumber: user.phoneNumber || '', street: '', city: '', state: '', zipCode: '', country: 'India', type: 'Home' });
                          setSelectedSavedAddressId(null);
                        }}
                        className={`p-4 border border-dashed rounded-xl cursor-pointer flex items-center justify-center text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-gray-50 transition-all ${selectedSavedAddressId === null ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-300'}`}
                     >
                       + Use New Address
                     </div>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                       <input 
                          value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="John Doe"
                       />
                    </div>
                    <div className="md:col-span-1">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                       <input 
                          value={address.phoneNumber} onChange={(e) => setAddress({...address, phoneNumber: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="98765 43210"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                       <input 
                          value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="123 Main St"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                       <input 
                          value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                       <input 
                          value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                       <input 
                          value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                       <input 
                          value={address.country} disabled
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-gray-500"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                       <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="addrType" checked={address.type === 'Home'} onChange={() => setAddress({...address, type: 'Home'})} className="text-blue-600" />
                             <span className="text-sm">Home</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="addrType" checked={address.type === 'Office'} onChange={() => setAddress({...address, type: 'Office'})} className="text-blue-600" />
                             <span className="text-sm">Office</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="addrType" checked={address.type === 'Other'} onChange={() => setAddress({...address, type: 'Other'})} className="text-blue-600" />
                             <span className="text-sm">Other</span>
                          </label>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      onClick={() => {
                        if(address.street && address.city && address.zipCode && address.phoneNumber && address.fullName) setStep(3);
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                      Continue to Payment
                    </button>
                 </div>
              </div>
           )}
        </div>

        {/* Step 3: Payment */}
        <div className={`bg-white p-6 rounded-2xl border ${step === 3 ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-200'} shadow-sm transition-all`}>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3</span>
               Payment Method
             </h2>
           </div>

           {(step === 3) && (
              <div className="pl-10 animate-in fade-in space-y-4">
                 <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                    <input type="radio" name="payment" className="w-4 h-4 text-blue-600" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} />
                    <div className="flex-1">
                       <p className="font-bold text-gray-900 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Online Payment (Razorpay)</p>
                       <p className="text-sm text-gray-500">Credit / Debit Card / UPI / Netbanking</p>
                    </div>
                 </label>

                 <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50' : isCodAvailable ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                    <input type="radio" name="payment" className="w-4 h-4 text-blue-600" checked={paymentMethod === 'COD'} onChange={() => isCodAvailable && setPaymentMethod('COD')} disabled={!isCodAvailable} />
                    <div className="flex-1">
                       <p className="font-bold text-gray-900 flex items-center gap-2"><Banknote className="h-5 w-5" /> Cash on Delivery</p>
                       {!isPincodeServiceable && <p className="text-xs text-red-500 mt-1">Not available for Pincode {address.zipCode}</p>}
                       {isPincodeServiceable && !isCodAllowedValue && <p className="text-xs text-red-500 mt-1">Order value exceeds limit for COD ($20,000)</p>}
                       {isCodAvailable && <p className="text-sm text-gray-500">Pay when you receive</p>}
                    </div>
                 </label>

                 <div className="pt-6">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                    >
                      {isProcessing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                       <Lock className="h-3 w-3" /> Secure Payment via Razorpay
                    </p>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-4 space-y-6">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Summary</h3>
            <div className="space-y-3 mb-6">
               {cart.map(item => (
                  <div key={`${item.id}-${item.selectedVariant?.id}`} className="flex justify-between text-sm">
                     <span className="text-gray-600 flex-1 pr-2 line-clamp-1">
                        {item.quantity}x {item.title} 
                        {item.selectedVariant && <span className="text-xs text-gray-400"> ({item.selectedVariant.name})</span>}
                     </span>
                     <span className="font-medium text-gray-900">${(( (item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0) ) * item.quantity).toFixed(2)}</span>
                  </div>
               ))}
            </div>
            
            <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
               <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-bold" : ""}>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                  <span>Tax (18%)</span>
                  <span>${tax.toFixed(2)}</span>
               </div>
               
               {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                     <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Discount</span>
                     <span>-${discountAmount.toFixed(2)}</span>
                  </div>
               )}

               <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
               </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
               {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl">
                     <div>
                        <p className="text-xs font-bold text-green-700 flex items-center gap-1"><Tag className="h-3 w-3" /> {appliedCoupon.code} Applied</p>
                        <p className="text-[10px] text-green-600">You saved ${discountAmount.toFixed(2)}</p>
                     </div>
                     <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500"><XCircle className="h-5 w-5" /></button>
                  </div>
               ) : (
                  <form onSubmit={handleCouponApply} className="flex gap-2">
                     <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon Code"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase"
                     />
                     <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Apply</button>
                  </form>
               )}
               {couponError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {couponError}</p>}
            </div>
         </div>
      </div>
    </div>
  );
};
