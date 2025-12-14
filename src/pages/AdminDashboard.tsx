
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, DollarSign, TrendingUp, ShoppingBag, Plus, Edit, Trash, Box, Clock, Truck, CheckCircle, XCircle, Tag, Upload, Eye, X, ChevronDown, ChevronUp, AlertTriangle, Save, RefreshCw, Loader2, ImagePlus } from 'lucide-react';
import { Product, OrderStatus, Order, ProductVariant, PaymentStatus, Coupon } from '../types';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} shadow-lg shadow-opacity-20`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
      <TrendingUp className="h-4 w-4 mr-1" />
      <span>+12.5% from last month</span>
    </div>
  </div>
);

const ProductModal = ({ isOpen, onClose, product, onSave }: { isOpen: boolean, onClose: () => void, product?: Product, onSave: (data: any) => void }) => {
  const { uploadImage } = useStore();
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    title: '', 
    price: 0, 
    discountPrice: 0,
    category: 'Almirah', 
    stock: 0, 
    description: '', 
    image: '',
    variants: [],
    tags: []
  });
  
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ type: 'Color', name: '', priceModifier: 0, stock: 10 });
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (isOpen && !product) {
       setFormData({
        title: '', price: 0, category: 'Almirah', stock: 0, description: '', image: '', variants: [], tags: []
       });
       setTagInput('');
    } else if (isOpen && product) {
       setFormData(product);
       setTagInput('');
    }
    setShowVariantForm(false);
  }, [isOpen, product]);

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.type) {
      const variant: ProductVariant = {
        id: `v_${Date.now()}`,
        name: newVariant.name,
        type: newVariant.type as any,
        priceModifier: Number(newVariant.priceModifier),
        stock: Number(newVariant.stock)
      };
      setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), variant] }));
      setNewVariant({ type: 'Color', name: '', priceModifier: 0, stock: 10 });
      setShowVariantForm(false);
    }
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants?.filter(v => v.id !== id) }));
  };
  
  const handleAddTag = () => {
    if(tagInput.trim()) {
      setFormData(prev => ({...prev, tags: [...(prev.tags || []), tagInput.trim()]}));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({...prev, tags: prev.tags?.filter(t => t !== tag)}));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append('image', file);
      setUploading(true);
      try {
        const url = await uploadImage(uploadData);
        setFormData(prev => ({ ...prev, image: url }));
      } catch (error) {
         console.error(error);
         alert('Upload failed');
      } finally {
         setUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h2 className="text-xl font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Royal Iron Almirah" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Global Stock</label>
                <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Almirah">Almirah</option>
                  <option value="Beds">Beds</option>
                  <option value="Storage">Storage</option>
                  <option value="Decor">Decor</option>
                  <option value="Tables">Tables</option>
                </select>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Optional)</label>
                <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="0.00" value={formData.discountPrice || ''} onChange={e => setFormData({...formData, discountPrice: parseFloat(e.target.value)})} />
             </div>

             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                  <div className="flex-1 space-y-3 w-full">
                     <div className="flex items-center gap-2 w-full">
                        <label className="flex-1 cursor-pointer">
                           <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-400 transition-all">
                              <Upload className="h-4 w-4 text-blue-600" />
                              {uploading ? 'Uploading...' : 'Choose Image File'}
                           </div>
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              disabled={uploading}
                           />
                        </label>
                        {uploading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                     </div>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <ImagePlus className="h-4 w-4 text-gray-400" />
                        </div>
                        <input 
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Or paste image URL here..." 
                           value={formData.image} 
                           onChange={e => setFormData({...formData, image: e.target.value})} 
                        />
                     </div>
                  </div>
                  <div className="w-24 h-24 rounded-lg border border-gray-200 bg-white overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                    {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs text-gray-400 text-center px-2">No Image</span>
                    )}
                  </div>
                </div>
             </div>

             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Product description..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
             </div>
             
             {/* Tags */}
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                   <input 
                      className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Add tags (e.g. heavy-duty, sale)..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                   />
                   <button type="button" onClick={handleAddTag} className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {formData.tags?.map((tag, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                         {tag}
                         <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                   ))}
                </div>
             </div>
          </div>

          {/* Variants Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-900">Product Variants</h3>
               <button type="button" onClick={() => setShowVariantForm(!showVariantForm)} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                  {showVariantForm ? 'Cancel' : '+ Add Variant'}
               </button>
            </div>
            
            {showVariantForm && (
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                     <select 
                        className="border p-2 rounded"
                        value={newVariant.type}
                        onChange={e => setNewVariant({...newVariant, type: e.target.value as any})}
                     >
                        <option value="Color">Color</option>
                        <option value="Size">Size</option>
                        <option value="Material">Material</option>
                     </select>
                     <input placeholder="Name (e.g. Red, XL)" className="border p-2 rounded" value={newVariant.name} onChange={e => setNewVariant({...newVariant, name: e.target.value})} />
                     <input type="number" placeholder="Price Modifier (+/-)" className="border p-2 rounded" value={newVariant.priceModifier} onChange={e => setNewVariant({...newVariant, priceModifier: parseFloat(e.target.value)})} />
                     <input type="number" placeholder="Stock" className="border p-2 rounded" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value)})} />
                  </div>
                  <button type="button" onClick={handleAddVariant} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Add Variant</button>
               </div>
            )}

            <div className="space-y-2">
               {formData.variants?.length === 0 && <p className="text-sm text-gray-400 italic">No variants added.</p>}
               {formData.variants?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                     <div>
                        <span className="font-bold text-gray-800">{v.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({v.type})</span>
                        <div className="text-xs text-gray-500 mt-0.5">
                           Stock: {v.stock} | Price: {v.priceModifier > 0 ? '+' : ''}{v.priceModifier}
                        </div>
                     </div>
                     <button type="button" onClick={() => removeVariant(v.id)} className="text-gray-400 hover:text-red-500"><Trash className="h-4 w-4" /></button>
                  </div>
               ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50">Cancel</button>
          <button 
             onClick={() => onSave(formData)} 
             disabled={uploading}
             className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md disabled:opacity-50"
          >
             {uploading ? 'Uploading...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ... OrderDetailsModal code (keeping it same as before) ...
const OrderDetailsModal = ({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order?: Order }) => {
  const { updateOrderDetails } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
     fullName: string; street: string; city: string; zipCode: string; adminNotes: string; paymentStatus: PaymentStatus
  }>({ fullName: '', street: '', city: '', zipCode: '', adminNotes: '', paymentStatus: 'Pending' });

  React.useEffect(() => {
     if (order) {
        setEditForm({
           fullName: order.shippingAddress.fullName,
           street: order.shippingAddress.street,
           city: order.shippingAddress.city,
           zipCode: order.shippingAddress.zipCode,
           adminNotes: order.adminNotes || '',
           paymentStatus: order.paymentStatus
        });
        setIsEditing(false);
     }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSaveOrder = () => {
     updateOrderDetails(order.id, {
        shippingAddress: { ...order.shippingAddress, fullName: editForm.fullName, street: editForm.street, city: editForm.city, zipCode: editForm.zipCode },
        adminNotes: editForm.adminNotes,
        paymentStatus: editForm.paymentStatus
     });
     setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   Order #{order.id}
                   {isEditing && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200">Editing Mode</span>}
                </h2>
                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleString()}</p>
             </div>
             <div className="flex items-center gap-2">
               {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors">
                     <Edit className="h-4 w-4" /> Edit Order
                  </button>
               ) : (
                  <button onClick={handleSaveOrder} className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                     <Save className="h-4 w-4" /> Save Changes
                  </button>
               )}
               <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2"><X className="h-5 w-5" /></button>
             </div>
          </div>
          
          <div className="p-6 overflow-y-auto">
             <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Customer Details</h3>
                   <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                      <p><span className="text-gray-500">Name:</span> <span className="font-medium">{order.customerName}</span></p>
                      <p><span className="text-gray-500">Email:</span> <span className="font-medium">{order.guestEmail || 'Registered User'}</span></p>
                      <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{order.shippingAddress.phoneNumber}</span></p>
                   </div>
                </div>
                <div>
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Shipping Address</h3>
                   <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1 relative">
                      {isEditing ? (
                         <div className="space-y-2">
                            <input value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full p-1.5 border rounded text-xs" placeholder="Full Name" />
                            <input value={editForm.street} onChange={e => setEditForm({...editForm, street: e.target.value})} className="w-full p-1.5 border rounded text-xs" placeholder="Street" />
                            <div className="flex gap-2">
                               <input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full p-1.5 border rounded text-xs" placeholder="City" />
                               <input value={editForm.zipCode} onChange={e => setEditForm({...editForm, zipCode: e.target.value})} className="w-full p-1.5 border rounded text-xs" placeholder="Zip" />
                            </div>
                         </div>
                      ) : (
                         <>
                           <p className="font-medium">{order.shippingAddress.fullName}</p>
                           <p>{order.shippingAddress.street}</p>
                           <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                           <p>{order.shippingAddress.country}</p>
                         </>
                      )}
                   </div>
                </div>
             </div>

             <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-gray-500 uppercase">Payment Method</p>
                   <p className="text-gray-900 font-medium">{order.paymentMethod}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-1">Payment Status</p>
                   {isEditing ? (
                      <select 
                        value={editForm.paymentStatus} 
                        onChange={e => setEditForm({...editForm, paymentStatus: e.target.value as PaymentStatus})}
                        className="text-xs border border-gray-300 rounded p-1 bg-white"
                      >
                         <option value="Pending">Pending</option>
                         <option value="Success">Success</option>
                         <option value="Failed">Failed</option>
                         <option value="Refunded">Refunded</option>
                      </select>
                   ) : (
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                         order.paymentStatus === 'Success' ? 'bg-green-100 text-green-700' :
                         order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                         order.paymentStatus === 'Refunded' ? 'bg-teal-100 text-teal-700' :
                         'bg-yellow-100 text-yellow-700'
                      }`}>
                         {order.paymentStatus}
                      </span>
                   )}
                </div>
             </div>

             {/* Admin Notes Section */}
             <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Internal Admin Notes</h3>
                {isEditing ? (
                   <textarea 
                      rows={3} 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editForm.adminNotes}
                      onChange={e => setEditForm({...editForm, adminNotes: e.target.value})}
                      placeholder="Add notes here (e.g. verified by phone call)..."
                   />
                ) : (
                   <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700 italic">
                      {order.adminNotes || "No notes added."}
                   </div>
                )}
             </div>

             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Order Items</h3>
             <div className="border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-100 text-gray-700 font-bold">
                      <tr>
                         <th className="p-3">Product</th>
                         <th className="p-3">Price</th>
                         <th className="p-3">Qty</th>
                         <th className="p-3 text-right">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                         <tr key={idx}>
                            <td className="p-3">
                               <div className="flex items-center gap-3">
                                  <img src={item.image} className="w-10 h-10 rounded object-cover border" />
                                  <div>
                                     <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                     {item.selectedVariant && <p className="text-xs text-blue-600">{item.selectedVariant.name}</p>}
                                  </div>
                               </div>
                            </td>
                            <td className="p-3 text-gray-600">${((item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0)).toFixed(2)}</td>
                            <td className="p-3 text-gray-600">{item.quantity}</td>
                            <td className="p-3 text-right font-medium text-gray-900">${(((item.discountPrice || item.price) + (item.selectedVariant?.priceModifier || 0)) * item.quantity).toFixed(2)}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                   <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                   </div>
                   {order.discount > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${order.discount.toFixed(2)}</span>
                     </div>
                   )}
                   {order.couponCode && (
                      <div className="flex justify-between text-xs text-gray-500 italic">
                         <span>Coupon Applied</span>
                         <span>{order.couponCode}</span>
                      </div>
                   )}
                   <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// ... CouponModal (keeping it same as before) ...
const CouponModal = ({ isOpen, onClose, coupon, onSave }: { isOpen: boolean, onClose: () => void, coupon?: Coupon, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Coupon>>(coupon || {
    code: '', type: 'PERCENTAGE', value: 0, minOrderValue: 0, maxDiscount: 0, 
    expiryDate: new Date().toISOString().split('T')[0], isActive: true, 
    usageLimit: 100, userUsageLimit: 1, applicableCategories: []
  });
  
  React.useEffect(() => {
    if (isOpen && !coupon) {
       setFormData({
        code: '', type: 'PERCENTAGE', value: 0, minOrderValue: 0, maxDiscount: 0,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
        isActive: true, usageLimit: 100, userUsageLimit: 1, applicableCategories: []
       });
    } else if (isOpen && coupon) {
       setFormData(coupon);
    }
  }, [isOpen, coupon]);

  const toggleCategory = (cat: string) => {
     const currentCats = formData.applicableCategories || [];
     if (currentCats.includes(cat)) {
        setFormData({ ...formData, applicableCategories: currentCats.filter(c => c !== cat) });
     } else {
        setFormData({ ...formData, applicableCategories: [...currentCats, cat] });
     }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <h2 className="text-xl font-bold text-gray-900">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                 <input className="w-full border p-2 rounded uppercase font-bold" placeholder="SAVE10" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                 <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount ($)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                 <input type="number" className="w-full border p-2 rounded" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value</label>
                 <input type="number" className="w-full border p-2 rounded" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})} />
              </div>
              {formData.type === 'PERCENTAGE' && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Cap</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="No Limit" value={formData.maxDiscount || ''} onChange={e => setFormData({...formData, maxDiscount: parseFloat(e.target.value)})} />
                 </div>
              )}
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                 <input type="date" className="w-full border p-2 rounded" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                 <input type="number" className="w-full border p-2 rounded" value={formData.usageLimit || ''} onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Limit Per User</label>
                 <input type="number" className="w-full border p-2 rounded" value={formData.userUsageLimit || ''} onChange={e => setFormData({...formData, userUsageLimit: parseInt(e.target.value)})} />
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories (Empty = All)</label>
              <div className="flex flex-wrap gap-2">
                 {['Almirah', 'Beds', 'Storage', 'Decor', 'Tables'].map(cat => (
                    <button 
                       key={cat} 
                       type="button"
                       onClick={() => toggleCategory(cat)}
                       className={`px-3 py-1 rounded-full text-xs font-bold border ${formData.applicableCategories?.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Coupon Active</label>
           </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Coupon</button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { products, orders, user, addProduct, updateProduct, deleteProduct, updateOrderStatus, coupons, addCoupon, updateCoupon, deleteCoupon, lowStockItems, analytics } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | undefined>(undefined);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

  if (!user || user.role !== 'ADMIN') {
    return <div className="p-20 text-center">Access Denied</div>;
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (data: any) => {
    if (editingProduct) updateProduct(editingProduct.id, data);
    else addProduct(data);
    setIsProductModalOpen(false);
  };
  
  const handleViewOrder = (order: Order) => {
     setViewingOrder(order);
     setIsOrderModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
     setEditingCoupon(coupon);
     setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (data: any) => {
     if (editingCoupon) updateCoupon(editingCoupon.id, data);
     else addCoupon({ ...data, id: `c${Date.now()}`, usedCount: 0 });
     setIsCouponModalOpen(false);
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

  // Calculate stats
  const totalRevenue = orders.reduce((acc, order) => acc + (order.paymentStatus === 'Success' ? order.total : 0), 0);
  const activeCustomers = new Set(orders.map(o => o.userId)).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Business Control Center</h1>
          <p className="text-gray-500 text-sm mt-1 ml-5">Manage store overview, inventory, and orders.</p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          {(['overview', 'products', 'orders', 'coupons'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
           {/* Stat Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={DollarSign} color="bg-blue-600" />
             <StatCard title="Total Orders" value={orders.length.toString()} icon={ShoppingBag} color="bg-indigo-500" />
             <StatCard title="Inventory Count" value={products.length.toString()} icon={Package} color="bg-violet-500" />
             <StatCard title="Active Customers" value={activeCustomers.toString()} icon={Users} color="bg-sky-500" />
           </div>

           {/* Charts Section */}
           <div className="grid lg:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg text-gray-900 mb-6">Weekly Revenue</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={analytics}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                     <Tooltip 
                       contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                       cursor={{fill: '#f3f4f6'}}
                     />
                     <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg text-gray-900 mb-6">Weekly Sales Orders</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={analytics}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                     <Tooltip 
                       contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                     />
                     <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} dot={{fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff'}} activeDot={{r: 6}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>

           {/* Low Stock Alerts */}
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5 text-orange-500" />
                 <h3 className="font-bold text-lg text-gray-900">Low Stock Alerts</h3>
                 <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{lowStockItems.length} Items</span>
              </div>
              <div className="p-0">
                 {lowStockItems.length > 0 ? (
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                          <tr>
                             <th className="px-6 py-3">Product</th>
                             <th className="px-6 py-3">Variant</th>
                             <th className="px-6 py-3 text-right">Remaining Stock</th>
                             <th className="px-6 py-3 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {lowStockItems.map((item, idx) => (
                             <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium">{item.product.title}</td>
                                <td className="px-6 py-3 text-gray-500">{item.variant ? item.variant.name : '-'}</td>
                                <td className="px-6 py-3 text-right font-bold text-red-600">{item.count}</td>
                                <td className="px-6 py-3 text-right">
                                   <button 
                                     onClick={() => handleEditProduct(item.product)}
                                     className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline"
                                   >
                                      Restock
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 ) : (
                    <div className="p-8 text-center text-gray-500">
                       <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                       <p>All stock levels are healthy!</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* ... Other Tabs remain the same ... */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
           {/* ... Product Table Content (Keeping Same) ... */}
           <div className="p-6 border-b border-gray-100 flex justify-between">
              <h3 className="font-bold text-lg">Inventory</h3>
              <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                    <Upload className="h-4 w-4" /> Bulk Upload (CSV)
                 </button>
                 <button onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    <Plus className="h-4 w-4" /> Add Product
                 </button>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-500">
               <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                 <tr>
                   <th className="px-6 py-4">Product</th>
                   <th className="px-6 py-4">Category</th>
                   <th className="px-6 py-4">Price</th>
                   <th className="px-6 py-4">Stock</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {products.map(product => {
                    const totalStock = product.variants && product.variants.length > 0 ? product.variants.reduce((acc, v) => acc + v.stock, 0) : product.stock;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 font-bold flex items-center gap-3">
                            <img src={product.image} className="w-8 h-8 rounded object-cover" />
                            <div>
                               <div>{product.title}</div>
                               {product.variants && product.variants.length > 0 && <span className="text-xs text-blue-600 font-normal">{product.variants.length} Variants</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-bold">{product.category}</span></td>
                         <td className="px-6 py-4">${product.price}</td>
                         <td className="px-6 py-4">
                            {totalStock === 0 ? (
                               <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Out of Stock</span>
                            ) : totalStock <= 5 ? (
                               <span className="text-orange-500 font-bold">{totalStock} (Low)</span>
                            ) : (
                               totalStock
                            )}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => handleEditProduct(product)} className="text-blue-600 mr-3 hover:bg-blue-50 p-1 rounded"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash className="h-4 w-4" /></button>
                         </td>
                      </tr>
                    );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
           {/* ... Orders Table Content (Keeping Same) ... */}
           <div className="p-6"><h3 className="font-bold text-lg">Order Management</h3></div>
           <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 font-medium">{order.customerName}</td>
                    <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${getStatusColor(order.status)}`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                        <option value="Returned">Returned</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                          order.paymentStatus === 'Success' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                          order.paymentStatus === 'Refunded' ? 'bg-teal-100 text-teal-700' :
                          'bg-yellow-100 text-yellow-700'
                       }`}>
                          {order.paymentStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleViewOrder(order)}
                         className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                       >
                         <Eye className="h-4 w-4" /> View Details
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-6 border-b border-gray-100 flex justify-between">
              <h3 className="font-bold text-lg">Active Coupons</h3>
              <button onClick={() => { setEditingCoupon(undefined); setIsCouponModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  <Plus className="h-4 w-4" /> Create Coupon
              </button>
           </div>
           <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon, idx) => (
                 <div key={idx} className={`border border-dashed p-4 rounded-lg flex flex-col justify-between group transition-all ${coupon.isActive ? 'border-gray-300 bg-gray-50' : 'border-red-200 bg-red-50 opacity-70'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                             {coupon.code}
                             {!coupon.isActive && <span className="text-xs bg-red-200 text-red-700 px-1.5 py-0.5 rounded">Inactive</span>}
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                             {coupon.type === 'FLAT' ? `$${coupon.value} Off` : `${coupon.value}% Off`}
                             {coupon.maxDiscount ? ` (Max $${coupon.maxDiscount})` : ''}
                          </p>
                       </div>
                       <Tag className={`h-8 w-8 ${coupon.isActive ? 'text-blue-200' : 'text-red-200'}`} />
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-500 mb-4">
                       <p>Min Order: ${coupon.minOrderValue}</p>
                       <p>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                       <p>Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
                       {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                          <p>Valid on: {coupon.applicableCategories.join(', ')}</p>
                       )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-gray-200">
                       <button onClick={() => handleEditCoupon(coupon)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit className="h-4 w-4" /></button>
                       <button onClick={() => deleteCoupon(coupon.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash className="h-4 w-4" /></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        product={editingProduct}
        onSave={handleSaveProduct}
      />
      
      <OrderDetailsModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={viewingOrder}
      />

      <CouponModal
         isOpen={isCouponModalOpen}
         onClose={() => setIsCouponModalOpen(false)}
         coupon={editingCoupon}
         onSave={handleSaveCoupon}
      />
    </div>
  );
};
