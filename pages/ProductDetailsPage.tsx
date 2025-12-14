import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Star, Heart, Truck, ShieldCheck, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, wishlist, toggleWishlist, addToRecentlyViewed, recentlyViewed, cart } = useStore();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      addToRecentlyViewed(product);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
    }
    window.scrollTo(0, 0);
  }, [id, product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 text-blue-600 hover:underline">
          Back to Shop
        </button>
      </div>
    );
  }

  const displayImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const isWishlisted = wishlist.includes(product.id);
  
  // Calculate final price based on variant
  const basePrice = product.discountPrice || product.price;
  const currentPrice = selectedVariant ? basePrice + selectedVariant.priceModifier : basePrice;
  const originalPrice = product.price + (selectedVariant ? selectedVariant.priceModifier : 0);
  
  // Stock Check (Real-time considering cart)
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
  
  // Check how many of this item (variant specific) are already in cart
  const cartItem = cart.find(item => {
    if (selectedVariant) {
      return item.id === product.id && item.selectedVariant?.id === selectedVariant.id;
    }
    return item.id === product.id && !item.selectedVariant;
  });
  
  const inCartQuantity = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, maxStock - inCartQuantity);
  const isOutOfStock = maxStock <= 0;
  const isCartLimitReached = remainingStock <= 0;

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-12 animate-in fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative group">
            <img 
              src={selectedImage} 
              alt={product.title} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-80' : ''}`} 
            />
            {product.discountPrice && !isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                SALE
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                 <div className="bg-white/90 px-6 py-3 rounded-xl font-bold text-gray-800 shadow-xl border border-gray-200">
                    Out of Stock
                 </div>
              </div>
            )}
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-colors ${
                isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {displayImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === img ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-blue-600 font-bold tracking-wide uppercase text-sm bg-blue-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-400">
              <Star className="fill-current h-5 w-5" />
              <span className="ml-1 text-gray-900 font-bold">{product.rating}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-blue-600 hover:underline cursor-pointer">{product.reviews} Reviews</span>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3">
               <span className="text-4xl font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
               {product.discountPrice && (
                 <>
                   <span className="text-xl text-gray-400 line-through mb-1">${originalPrice.toFixed(2)}</span>
                   <span className="text-green-600 font-bold mb-1 text-sm bg-green-50 px-2 py-0.5 rounded">
                     {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                   </span>
                 </>
               )}
            </div>
            <p className="text-gray-500 text-sm mt-1">Inclusive of all taxes</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex justify-between">
                <span>Select {product.variants[0].type}</span>
                <span className="text-sm font-normal text-gray-500">
                   {selectedVariant ? selectedVariant.name : 'None selected'}
                </span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all relative ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-600 bg-white text-blue-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                  >
                    {variant.name} 
                    {variant.priceModifier !== 0 && (
                      <span className="text-xs ml-1 opacity-75">
                         ({variant.priceModifier > 0 ? '+' : ''}${variant.priceModifier})
                      </span>
                    )}
                    {variant.stock === 0 && (
                       <span className="absolute -top-2 -right-2 bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                         Sold Out
                       </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="prose text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-4">
            {isOutOfStock ? (
               <div className="w-full bg-red-50 text-red-600 py-4 rounded-xl text-center font-bold border border-red-100">
                 Out of Stock
               </div>
            ) : (
              <>
                 {maxStock < 5 && maxStock > 0 && (
                   <p className="text-red-500 text-sm font-bold animate-pulse flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4" /> Only {maxStock} items left in stock!
                   </p>
                 )}
                 {isCartLimitReached && !isOutOfStock && (
                    <p className="text-orange-600 text-sm font-bold flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                       <AlertTriangle className="h-4 w-4" /> You have max quantity ({inCartQuantity}) in cart.
                    </p>
                 )}
                 <div className="flex gap-4">
                   <button 
                     onClick={() => addToCart(product, selectedVariant)}
                     disabled={isCartLimitReached}
                     className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                   >
                     {isCartLimitReached ? 'Limit Reached' : `Add to Cart - $${(currentPrice).toFixed(2)}`}
                   </button>
                 </div>
              </>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Free delivery over $500</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>5 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 1 && (
        <section className="pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};