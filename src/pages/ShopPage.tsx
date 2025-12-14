
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, X, RotateCcw, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

export const ShopPage = () => {
  const { shopProducts, fetchProducts, shopPagination, searchQuery } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(25000);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Initial Fetch & Filter Updates
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProducts({
        page: currentPage,
        limit: 9,
        category: selectedCategory,
        maxPrice: maxPriceFilter,
        sort: sortBy,
        keyword: searchQuery
      });
      setLoading(false);
    };
    
    // Debounce to prevent multiple API calls while sliding
    const timeout = setTimeout(loadData, 500);
    return () => clearTimeout(timeout);
  }, [currentPage, selectedCategory, maxPriceFilter, sortBy, searchQuery, fetchProducts]);

  // Categories Hardcoded for Filter UI
  const categories = ['All', 'Almirah', 'Beds', 'Storage', 'Decor', 'Tables'];

  const resetFilters = () => {
    setSelectedCategory('All');
    setMaxPriceFilter(25000);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const displayedProducts = useMemo(() => {
     if (!showOutOfStock) {
        return shopProducts.filter(p => {
           const totalStock = (p.variants && p.variants.length > 0) ? p.variants.reduce((acc, v) => acc + v.stock, 0) : p.stock;
           return totalStock > 0;
        });
     }
     return shopProducts;
  }, [shopProducts, showOutOfStock]);

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24 transition-all duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              <h2>Filters</h2>
            </div>
            {(selectedCategory !== 'All' || maxPriceFilter !== 25000) && (
              <button 
                onClick={resetFilters}
                className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors duration-300"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="mb-8">
             <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Availability</h3>
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-300 ${!showOutOfStock ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                   {!showOutOfStock && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={!showOutOfStock}
                  onChange={(e) => setShowOutOfStock(!e.target.checked)}
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-700">Hide Out of Stock</span>
             </label>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center justify-between cursor-pointer group p-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      selectedCategory === cat ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <input 
                      type="radio" 
                      name="category" 
                      className="hidden"
                      checked={selectedCategory === cat}
                      onChange={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                    />
                    <span className={`text-sm group-hover:text-blue-600 transition-colors duration-300 ${selectedCategory === cat ? 'text-blue-900 font-bold' : 'text-gray-600'}`}>
                      {cat}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Max Price</h3>
            <div className="px-2">
               <input 
                 type="range" 
                 min="0" 
                 max="30000" 
                 step="1000"
                 value={maxPriceFilter}
                 onChange={(e) => { setMaxPriceFilter(parseInt(e.target.value)); setCurrentPage(1); }}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all duration-300"
               />
               <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
                 <span>$0</span>
                 <span className="text-blue-600 font-bold">${maxPriceFilter.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 transition-all duration-300">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            <span className="ml-2 text-sm font-normal text-gray-500">
               ({shopPagination.total} items found)
            </span>
          </h1>

          <div className="flex items-center gap-2">
             <ArrowUpDown className="h-4 w-4 text-gray-500" />
             <select 
               className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all duration-300 cursor-pointer hover:border-blue-400"
               value={sortBy}
               onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
             >
               <option value="newest">New Arrivals</option>
               <option value="price-low">Price: Low to High</option>
               <option value="price-high">Price: High to Low</option>
               <option value="rating">Top Rated</option>
             </select>
          </div>
        </div>

        {loading ? (
           <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
           </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {shopPagination.pages > 1 && (
               <div className="flex justify-center items-center gap-2">
                  <button 
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                     Page {currentPage} of {shopPagination.pages}
                  </span>
                  <button 
                     onClick={() => setCurrentPage(p => Math.min(shopPagination.pages, p + 1))}
                     disabled={currentPage === shopPagination.pages}
                     className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     <ChevronRight className="h-5 w-5" />
                  </button>
               </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 animate-in fade-in">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
