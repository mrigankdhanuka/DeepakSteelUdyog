
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Star, Heart, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const navigate = useNavigate();
  
  const displayImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate total stock correctly (Check for variants length)
  const totalStock = (product.variants && product.variants.length > 0)
    ? product.variants.reduce((acc, v) => acc + v.stock, 0) 
    : product.stock;
  const isOutOfStock = totalStock <= 0;

  useEffect(() => {
    if (displayImages.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
      }, 2500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [displayImages.length, isHovered]);

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 ease-in-out group flex flex-col h-full relative ${isOutOfStock ? 'opacity-75' : ''}`}>
      
      {/* Clickable Area for Navigation */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {displayImages.map((img, idx) => (
          <img 
            key={idx}
            src={img} 
            alt={`${product.title} - view ${idx + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-100'
            } ${isHovered && idx === currentImageIndex && !isOutOfStock ? 'scale-110' : ''}`}
            loading="lazy"
          />
        ))}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-30 transition-all duration-300">
             <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 animate-in zoom-in">
               <AlertCircle className="h-4 w-4" /> Out of Stock
             </div>
          </div>
        )}

        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {displayImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? 'bg-blue-600 w-4' : 'bg-white/80 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {product.discountPrice && !isOutOfStock && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-20 shadow-sm animate-in fade-in">
            SALE
          </div>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`absolute top-2 right-2 p-2 rounded-full z-20 shadow-sm transition-all duration-300 ${
             isWishlisted ? 'bg-white text-red-500 scale-110' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart className={`h-4 w-4 transition-colors duration-300 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-full">{product.category}</span>
          <Link to={`/product/${product.id}`}>
             <h3 className="text-gray-900 font-semibold text-lg leading-tight mt-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">{product.title}</h3>
          </Link>
        </div>
        
        <div className="flex items-center mb-4">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-700 font-medium ml-1">{product.rating}</span>
          <span className="text-xs text-gray-400 ml-1">({product.reviews} reviews)</span>
        </div>

        {product.variants && product.variants.length > 0 && (
           <p className="text-xs text-blue-600 font-medium mb-2 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
             {product.variants.length} Options Available
           </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-gray-400 line-through text-xs">${product.price.toFixed(2)}</span>
                <span className="text-xl font-bold text-gray-900">${product.discountPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button 
            onClick={() => !isOutOfStock && addToCart(product)}
            disabled={isOutOfStock}
            className={`p-3 rounded-xl transition-all duration-300 shadow-sm ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
