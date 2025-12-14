import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, X, RotateCcw, CheckSquare, Square } from 'lucide-react';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

export const ShopPage = () => {
  const { products, searchQuery } = useStore();
  
  // Calculate max price dynamically
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map(p => p.discountPrice || p.price)));
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxProductPrice]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Initialize price range when products load
  useEffect(() => {
    setPriceRange([0, maxProductPrice]);
  }, [maxProductPrice]);

  // Generate categories with counts
  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(products.map(p => p.category)));
    const categoryList = ['All', ...allCategories].map(cat => {
      const count = cat === 'All' 
        ? products.length 
        : products.filter(p => p.category === cat).length;
      return { name: cat, count };
    });
    return categoryList;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // Search Logic: Title, Category, or Tags
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = product.title.toLowerCase().includes(searchLower) || 
                          product.category.toLowerCase().includes(searchLower) ||
                          product.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const price = product.discountPrice || product.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      // Stock Logic
      const totalStock = product.variants 
        ? product.variants.reduce((acc, v) => acc + v.stock, 0) 
        : product.stock;
      const matchesStock = showOutOfStock ? true : totalStock > 0;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    // Sorting Logic
    switch(sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Assume default order is newest for now, based on ID assuming sequential ID or logic
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, showOutOfStock]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, maxProductPrice]);
    setSortBy('newest');
    setShowOutOfStock(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in fade-in">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              <h2>Filters</h2>
            </div>
            {(selectedCategory !== 'All' || priceRange[1] !== maxProductPrice || showOutOfStock) && (
              <button 
                onClick={resetFilters}
                className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="mb-8">
             <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Availability</h3>
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showOutOfStock ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                   {showOutOfStock && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                />
                <span className="text-sm text-gray-600 group-hover:text-blue-700">Show Out of Stock</span>
             </label>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.name} className="flex items-center justify-between cursor-pointer group p-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      selectedCategory === cat.name ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedCategory === cat.name && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <input 
                      type="radio" 
                      name="category" 
                      className="hidden"
                      checked={selectedCategory === cat.name}
                      onChange={() => setSelectedCategory(cat.name)}
                    />
                    <span className={`text-sm group-hover:text-blue-600 transition-colors ${selectedCategory === cat.name ? 'text-blue-900 font-bold' : 'text-gray-600'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{cat.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
            <div className="px-2">
               <input 
                 type="range" 
                 min="0" 
                 max={maxProductPrice} 
                 step="500"
                 value={priceRange[1]}
                 onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
                 <span>$0</span>
                 <span className="text-blue-600 font-bold">${priceRange[1].toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            <span className="ml-2 text-sm font-normal text-gray-500">({filteredProducts.length} items)</span>
          </h1>

          <div className="flex items-center gap-2">
             <ArrowUpDown className="h-4 w-4 text-gray-500" />
             <select 
               className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as SortOption)}
             >
               <option value="newest">New Arrivals</option>
               <option value="price-low">Price: Low to High</option>
               <option value="price-high">Price: High to Low</option>
               <option value="rating">Top Rated</option>
             </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};