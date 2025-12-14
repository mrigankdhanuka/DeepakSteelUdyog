import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, LogOut, Package, MapPin, Heart, Settings, Camera, Plus, Trash2, Home, Briefcase, CheckCircle2, AlertCircle, Lock, ShoppingBag, Download, RefreshCcw } from 'lucide-react';
import { Address, OrderStatus } from '../types';

export const ProfilePage = () => {
  const { user, logout, orders, products, wishlist, updateUserProfile, addUserAddress, removeUserAddress, toggleWishlist, addToCart, downloadInvoice, cancelOrder, requestReturn } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'settings'>('profile');
  const navigate = useNavigate();

  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '', phoneNumber: '', street: '', city: '', state: '', zipCode: '', country: 'India', type: 'Home', isDefault: false
  });

  // Profile Edit State
  const [profileData, setProfileData] = useState({
     name: user?.name || '',
     email: user?.email || '',
     phone: user?.phoneNumber || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userOrders = orders.filter(o => o.userId === user.id);
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name: profileData.name, phoneNumber: profileData.phone });
    setIsEditingProfile(false);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.fullName && newAddress.street && newAddress.city && newAddress.zipCode) {
      addUserAddress(newAddress);
      setIsAddingAddress(false);
      setNewAddress({ fullName: '', phoneNumber: '', street: '', city: '', state: '', zipCode: '', country: 'India', type: 'Home', isDefault: false });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Placed': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Packed': return 'bg-indigo-100 text-indigo-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Return Requested': return 'bg-amber-100 text-amber-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      case 'Refunded': return 'bg-teal-100 text-teal-800';
      case 'Payment Failed': return 'bg-red-50 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-blue-500 p-1 mb-3" />
                <button className="absolute bottom-3 right-0 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm hover:text-blue-600 transition-colors">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              ))}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all mt-6"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-full animate-in fade-in">
            
            {/* --- Profile Tab --- */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-blue-600 text-sm font-bold hover:underline"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        disabled={!isEditingProfile}
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 disabled:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        disabled={!isEditingProfile}
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 disabled:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={profileData.email}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Verified</p>
                  </div>

                  {isEditingProfile && (
                    <div className="pt-4">
                      <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* --- Orders Tab --- */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">My Orders</h2>
                {userOrders.length > 0 ? (
                  <div className="space-y-4">
                    {userOrders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                           <div>
                              <p className="font-bold text-gray-900">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-gray-900 text-lg">${order.total.toFixed(2)}</p>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                                {order.paymentStatus === 'Refunded' && (
                                   <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                      <RefreshCcw className="h-3 w-3" /> Refunded
                                   </span>
                                )}
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           {order.items.map((item, idx) => (
                             <div key={idx} className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                                <img src={item.image} className="w-12 h-12 object-cover rounded" alt={item.title} />
                                <div>
                                   <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                   <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                           <button onClick={() => downloadInvoice(order.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                             <Download className="h-4 w-4" /> Download Invoice
                           </button>
                           {order.status === 'Delivered' && (
                              <button onClick={() => requestReturn(order.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Return Item</button>
                           )}
                           {(order.status === 'Placed' || order.status === 'Confirmed') && (
                              <button onClick={() => cancelOrder(order.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Cancel Order</button>
                           )}
                           {order.paymentStatus === 'Refunded' && (
                              <span className="text-xs text-teal-600 flex items-center gap-1 ml-auto">
                                 Refund processed to original source.
                              </span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders found</p>
                    <button onClick={() => navigate('/shop')} className="text-blue-600 font-bold mt-2 hover:underline">Start Shopping</button>
                  </div>
                )}
              </div>
            )}

            {/* --- Addresses Tab --- */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
                  <button 
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="flex items-center gap-1 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>

                {isAddingAddress && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-8 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Full Name" required className="p-2 border rounded-lg" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                      <input placeholder="Phone Number" required className="p-2 border rounded-lg" value={newAddress.phoneNumber} onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})} />
                      <input placeholder="Street Address" required className="p-2 border rounded-lg md:col-span-2" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                      <input placeholder="City" required className="p-2 border rounded-lg" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                      <input placeholder="State" required className="p-2 border rounded-lg" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                      <input placeholder="Zip Code" required className="p-2 border rounded-lg" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} />
                      <div className="flex items-center gap-4 md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={newAddress.type === 'Home'} onChange={() => setNewAddress({...newAddress, type: 'Home'})} /> Home</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={newAddress.type === 'Office'} onChange={() => setNewAddress({...newAddress, type: 'Office'})} /> Office</label>
                        <label className="flex items-center gap-2 cursor-pointer ml-auto text-sm text-gray-600"><input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="mr-1" /> Set as Default</label>
                      </div>
                      <div className="md:col-span-2 flex gap-3 mt-2">
                         <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Address</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {user.addresses.map(addr => (
                    <div key={addr.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors relative group">
                       <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                             {addr.type === 'Home' ? <Home className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                             {addr.type}
                          </span>
                          {addr.isDefault && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Default</span>}
                       </div>
                       <h4 className="font-bold text-gray-900">{addr.fullName}</h4>
                       <p className="text-gray-500 text-sm mt-1">{addr.street}</p>
                       <p className="text-gray-500 text-sm">{addr.city}, {addr.state} - {addr.zipCode}</p>
                       <p className="text-gray-500 text-sm mt-2 font-medium">Phone: {addr.phoneNumber}</p>

                       <button 
                        onClick={() => addr.id && removeUserAddress(addr.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"
                        title="Delete Address"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                  {user.addresses.length === 0 && !isAddingAddress && (
                     <div className="md:col-span-2 text-center py-8 text-gray-400">No addresses saved. Add one to checkout faster!</div>
                  )}
                </div>
              </div>
            )}

            {/* --- Wishlist Tab --- */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">My Wishlist</h2>
                {wishlistProducts.length > 0 ? (
                   <div className="space-y-4">
                      {wishlistProducts.map(product => {
                         const hasVariants = product.variants && product.variants.length > 0;
                         // Simplified check for overall stock (sum of all variants or base stock)
                         const totalStock = product.variants 
                           ? product.variants.reduce((acc, v) => acc + v.stock, 0) 
                           : product.stock;
                         const isOutOfStock = totalStock === 0;
                         
                         return (
                             <div key={product.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                   <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                                </div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-gray-900">{product.title}</h3>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                      </div>
                                      <button onClick={() => toggleWishlist(product.id)} className="text-gray-400 hover:text-red-500 p-1" title="Remove from Wishlist"><Trash2 className="h-5 w-5" /></button>
                                   </div>
                                   <div className="mt-2 flex items-center gap-2">
                                      <span className="font-bold text-lg">${product.discountPrice || product.price}</span>
                                      {product.discountPrice && <span className="text-sm text-gray-400 line-through">${product.price}</span>}
                                   </div>
                                   <div className="mt-4 flex gap-3">
                                      {isOutOfStock ? (
                                         <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed border border-gray-200">Out of Stock</span>
                                      ) : (
                                         <button 
                                            onClick={() => {
                                               if (hasVariants) {
                                                  navigate(`/product/${product.id}`);
                                               } else {
                                                  addToCart(product);
                                                  toggleWishlist(product.id);
                                               }
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                         >
                                            <ShoppingBag className="h-4 w-4" />
                                            {hasVariants ? 'Select Options' : 'Move to Cart'}
                                         </button>
                                      )}
                                   </div>
                                </div>
                             </div>
                         );
                      })}
                   </div>
                ) : (
                  <div className="text-center py-10">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                    <button onClick={() => navigate('/shop')} className="text-blue-600 font-bold mt-2 hover:underline">Explore Products</button>
                  </div>
                )}
              </div>
            )}

             {/* --- Settings Tab --- */}
             {activeTab === 'settings' && (
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Account Settings</h2>
                
                <div className="space-y-6">
                   <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</h3>
                      <div className="space-y-4">
                         <input type="password" placeholder="Current Password" className="w-full p-2.5 border rounded-lg bg-white" />
                         <input type="password" placeholder="New Password" className="w-full p-2.5 border rounded-lg bg-white" />
                         <input type="password" placeholder="Confirm New Password" className="w-full p-2.5 border rounded-lg bg-white" />
                         <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm">Update Password</button>
                      </div>
                   </div>

                   <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Danger Zone</h3>
                      <button className="text-red-600 font-medium text-sm border border-red-200 bg-white px-4 py-2 rounded-lg hover:bg-red-50">Delete Account</button>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};