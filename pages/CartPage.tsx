import React from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, user, login } = useStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Calculate tax and total for summary preview
  const tax = cartTotal * 0.18;
  const shipping = cartTotal > 500 ? 0 : 50;
  const total = cartTotal + tax + shipping;

  return (
    <div className="animate-in fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-blue-600 pl-4">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            {cart.map((item) => {
              const itemId = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
              const maxStock = item.selectedVariant ? item.selectedVariant.stock : item.stock;
              const isStockLimitReached = item.quantity >= maxStock;
              const isLowStock = maxStock <= 5 && maxStock > 0;

              return (
                <div key={itemId} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  {maxStock === 0 && (
                     <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">Item Out of Stock</span>
                     </div>
                  )}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${item.id}`} className="hover:text-blue-600 transition-colors">
                           <h3 className="text-base font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                        </Link>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mt-1">{item.category}</p>
                      {item.selectedVariant && (
                         <p className="text-xs text-gray-500 mt-0.5">Variant: <span className="font-medium text-gray-700">{item.selectedVariant.name}</span></p>
                      )}
                      
                      {isLowStock && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock: Only {maxStock} left!
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            disabled={isStockLimitReached}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {isStockLimitReached && !isLowStock && (
                          <span className="text-[10px] text-red-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" /> Max allowed
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-gray-900 text-lg">
                           ${(( (item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0) ) * item.quantity).toFixed(2)}
                         </p>
                         {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">
                              ${((item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0)).toFixed(2)} each
                            </p>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-bold ${shipping === 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (Estimated 18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span className="text-blue-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {user ? (
              <button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5"
              >
                Checkout Now
              </button>
            ) : (
              <div className="space-y-3">
                 <p className="text-sm text-gray-500 text-center">Please login to complete your purchase</p>
                 <button 
                    onClick={() => login('customer@example.com', UserRole.CUSTOMER)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Login to Checkout
                  </button>
              </div>
            )}
            
            <div className="mt-6 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-300">VISA</div>
               <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-300">MC</div>
               <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-300">UPI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};