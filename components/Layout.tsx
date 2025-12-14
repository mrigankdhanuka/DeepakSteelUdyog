import React, { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Search, Menu, X, Hammer, Heart } from 'lucide-react';
import { UserRole } from '../types';
import { AuthModal } from './AuthModal';

const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, cart, logout, searchQuery, setSearchQuery, wishlist } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/shop' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <Hammer className="h-5 w-5 text-blue-100" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Deepak Steel Udyog</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-white bg-white/20 shadow-sm' : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Search Bar (Hidden on mobile initially) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4 lg:max-w-md">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-200 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-1.5 border border-transparent rounded-full text-sm bg-blue-950/30 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist Icon - New */}
            <Link to="/profile" onClick={() => {}} title="Wishlist" className="relative p-2 text-blue-100 hover:text-white transition-colors rounded-full hover:bg-white/10 hidden sm:block">
               <Heart className="h-6 w-6" />
               {wishlist.length > 0 && (
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
               )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === UserRole.ADMIN && (
                   <Link to="/admin" className="text-blue-100 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" title="Dashboard">
                     <LayoutDashboard className="h-5 w-5" />
                   </Link>
                )}
                <Link to="/profile" className="hidden md:flex items-center gap-2 ml-2 hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <img src={user.avatar} alt="User" className="h-8 w-8 rounded-full border border-blue-400" />
                  <span className="text-sm font-medium text-blue-50">{user.name}</span>
                </Link>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="hidden md:block text-sm font-medium bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            )}

            <Link to="/cart" className="relative p-2 text-blue-100 hover:text-white transition-colors rounded-full hover:bg-white/10">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-500 rounded-full border-2 border-blue-900 shadow-sm">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-blue-100 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-blue-800 bg-blue-900 shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* Mobile Search */}
            <div className="px-3 pb-4 pt-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-blue-700 rounded-lg text-sm bg-blue-950/50 text-white placeholder-blue-400 focus:bg-white focus:text-gray-900"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive ? 'bg-blue-800 text-white border-l-4 border-blue-400' : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {user && (
              <Link 
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 hover:text-white"
              >
                My Profile
              </Link>
            )}
            
            {!user && (
              <div className="pt-4 px-3">
                <button 
                  onClick={() => {
                    onOpenAuth();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center text-sm font-medium bg-white text-blue-900 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      <footer className="bg-gradient-to-br from-gray-900 to-blue-950 text-white border-t border-blue-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
             <div className="col-span-1 md:col-span-1">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Hammer className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">Deepak Steel Udyog</span>
               </div>
               <p className="text-gray-400 text-sm leading-relaxed">
                 Trusted since 1994. Manufacturing eco-friendly iron almirahs, beds, and storage solutions built to last for generations.
               </p>
             </div>
             
             <div>
               <h4 className="font-bold text-white mb-4">Products</h4>
               <ul className="space-y-2 text-sm text-gray-400">
                 <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Almirahs</Link></li>
                 <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Iron Beds</Link></li>
                 <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Storage Boxes</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-white mb-4">Company</h4>
               <ul className="space-y-2 text-sm text-gray-400">
                 <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                 <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                 <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Custom Orders</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-white mb-4">Customer Care</h4>
               <ul className="space-y-2 text-sm text-gray-400">
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Warranty Policy</a></li>
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Shipping Info</a></li>
                 <li><a href="#" className="hover:text-blue-400 transition-colors">FAQs</a></li>
               </ul>
             </div>
           </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Deepak Steel Udyog. All rights reserved.
          </div>
        </div>
      </footer>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};