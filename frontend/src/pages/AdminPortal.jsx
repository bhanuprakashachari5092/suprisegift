import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, ClipboardList, Plus, 
  Trash2, Edit, MessageSquare, LogOut, AlertCircle, 
  FileImage, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPortal({ products, refreshProducts }) {
  // Admin Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'Adminvishnu' && loginPassword === 'Vishnu@admin') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin credentials');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Dashboard Sub-tabs: 'dashboard', 'products', 'orders'
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  // Product CRUD States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Gift wrapping and gift',
    image: '',
    tags: '',
    inStock: true
  });

  // Supabase Direct Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case columns back to camelCase expected by the component UI
      const mapped = (data || []).map(o => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryType: o.delivery_type,
        address: o.address,
        deliveryDate: o.delivery_date,
        deliveryTimeSlot: o.delivery_time_slot,
        notes: o.notes,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
        items: (o.order_items || []).map(item => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customNote: item.custom_note
        }))
      }));

      setOrders(mapped);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Supabase Direct Image Upload Logic
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setProductFormData(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (err) {
      console.error('Image upload error:', err);
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add / Edit Product Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productFormData.name || !productFormData.price || !productFormData.image) {
      alert("Please fill in Name, Price, and Image URL.");
      return;
    }

    const priceNum = parseFloat(productFormData.price);
    const tagsArray = productFormData.tags 
      ? productFormData.tags.split(',').map(t => t.trim()).filter(t => t !== '') 
      : [];

    try {
      if (editingProduct) {
        // Edit mode in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: productFormData.name,
            description: productFormData.description,
            price: priceNum,
            category: productFormData.category,
            image: productFormData.image,
            tags: tagsArray,
            in_stock: productFormData.inStock
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert("Product updated successfully!");
      } else {
        // Add mode in Supabase
        const newProduct = {
          name: productFormData.name,
          description: productFormData.description,
          price: priceNum,
          category: productFormData.category,
          image: productFormData.image,
          tags: tagsArray,
          in_stock: productFormData.inStock,
          rating: 5.0,
          reviews: 0
        };

        const { error } = await supabase
          .from('products')
          .insert(newProduct);

        if (error) throw error;
        alert("Product added successfully!");
      }

      await refreshProducts();

      // Reset Form
      setProductFormData({
        name: '',
        description: '',
        price: '',
        category: 'Gift wrapping and gift',
        image: '',
        tags: '',
        inStock: true
      });
      setEditingProduct(null);
      setShowProductForm(false);
      setUploadError('');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product: ' + err.message);
    }
  };

  // Start edit flow
  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      category: prod.category,
      image: prod.image,
      tags: prod.tags ? prod.tags.join(', ') : '',
      inStock: prod.inStock
    });
    setShowProductForm(true);
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        alert("Product deleted!");
        await refreshProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  // Order status controls
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order record?")) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;
        await fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order record: ' + err.message);
      }
    }
  };

  // Open Chat on WhatsApp with Customer
  const handleChatWithCustomer = (order) => {
    const text = `Hello ${order.customerName}, this is Vishnu from The Surprise Box Hindupur. I am messaging you regarding your Order #${order.id}. Let's coordinate delivery!`;
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Statistics
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalEarnings = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.total, 0);

  // Dashboard View
  if (!isAuthenticated) {
    return (
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: 'var(--soft-pink-bg)' }}>
        <div style={{
          background: 'var(--white)',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-md)',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid var(--light-pink)'
        }}>
          <h2 style={{ fontSize: '24px', color: 'var(--dark-pink)', fontWeight: '800', textAlign: 'center', marginBottom: '24px' }}>
            Admin Login
          </h2>
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loginError && (
              <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter admin username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter admin password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>
              Login
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding" style={{ width: '100%' }}>
      <div className="container">
        
        {/* Admin Header controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--light-pink)'
        }}>
          <div>
            <h2 style={{ fontSize: '30px', color: 'var(--dark-pink)', fontWeight: '800' }}>Admin Management</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Manage order fulfillments and adjust products in real-time.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleAdminLogout}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              Logout
            </button>
            <button 
              onClick={() => window.location.href = "/"}
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Back to Store
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          borderBottom: '2px solid var(--gray-100)',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'dashboard', label: 'Stats & Charts', icon: <LayoutDashboard size={16} /> },
            { id: 'orders', label: 'Manage Orders', icon: <ClipboardList size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setShowProductForm(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 20px',
                fontSize: '15px',
                fontWeight: '600',
                color: activeSubTab === tab.id ? 'var(--primary-pink)' : 'var(--gray-600)',
                borderBottom: activeSubTab === tab.id ? '3px solid var(--primary-pink)' : '3px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--transition-smooth)'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content 1: Overview stats */}
        {activeSubTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '40px'
            }} className="admin-stats-grid">

              {/* Stat 2 */}
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 600 }}>Pending Fulfillments</span>
                <h3 style={{ fontSize: '32px', color: '#f59e0b', marginTop: '8px' }}>{pendingOrders}</h3>
              </div>

              {/* Stat 3 */}
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 600 }}>Total Bookings</span>
                <h3 style={{ fontSize: '32px', color: 'var(--primary-pink)', marginTop: '8px' }}>{orders.length}</h3>
              </div>

              {/* Stat 4 */}
              <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 600 }}>Completed Earnings</span>
                <h3 style={{ fontSize: '32px', color: '#10b981', marginTop: '8px' }}>₹{totalEarnings}</h3>
              </div>

            </div>



            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 900px) {
                .admin-stats-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                }
              }
              @media (max-width: 480px) {
                .admin-stats-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}} />
          </div>
        )}

        {/* Tab Content 2: Manage Products */}
        {activeSubTab === 'products' && (
          <div className="animate-fade-in">
            {!showProductForm ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '20px', color: 'var(--dark-pink)' }}>Catalog Directory ({products.length})</h3>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductFormData({
                        name: '',
                        description: '',
                        price: '',
                        category: 'Gift wrapping and gift',
                        image: '',
                        tags: '',
                        inStock: true
                      });
                      setShowProductForm(true);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>

                {/* Table list */}
                <div style={{ overflowX: 'auto', background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }} className="admin-table">
                    <thead>
                      <tr style={{ background: 'var(--soft-pink-bg)', borderBottom: '1px solid var(--light-pink)' }}>
                        <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800 }}>Image</th>
                        <th style={{ padding: '16px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800 }}>Product Details</th>
                        <th style={{ padding: '16px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800 }}>Category</th>
                        <th style={{ padding: '16px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800 }}>Price</th>
                        <th style={{ padding: '16px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800 }}>Status</th>
                        <th style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: 800, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--light-pink)' }}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600";
                              }}
                            />
                          </td>
                          <td style={{ padding: '16px' }}>
                            <strong style={{ display: 'block', fontSize: '14px', color: 'var(--gray-800)' }}>{p.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--gray-600)' }}>ID: {p.id}</span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '13px', color: 'var(--gray-800)' }}>{p.category}</td>
                          <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--dark-pink)' }}>₹{p.price}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              background: p.inStock ? '#ecfdf5' : '#fef2f2',
                              color: p.inStock ? '#10b981' : '#ef4444',
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}>
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditProduct(p)}
                                className="btn btn-secondary btn-icon"
                                style={{ width: '32px', height: '32px', borderColor: 'var(--light-pink)', color: 'var(--primary-pink)' }}
                                title="Edit Product"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="btn btn-icon"
                                style={{ width: '32px', height: '32px', background: '#fef2f2', border: 'none', color: '#ef4444' }}
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Add/Edit Form Panel */
              <div style={{
                background: 'var(--white)',
                border: '1px solid rgba(240, 98, 146, 0.2)',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: 'var(--shadow-md)',
                maxWidth: '650px',
                margin: '0 auto'
              }}>
                <h3 style={{ fontSize: '22px', color: 'var(--dark-pink)', marginBottom: '24px' }}>
                  {editingProduct ? `Modify: ${editingProduct.name}` : 'Add New Product Collection'}
                </h3>

                <form onSubmit={handleProductSubmit}>
                  
                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Dreamy Rose Gold Heart Balloon" 
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                      required 
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-input form-textarea" 
                      placeholder="Enter description, size specs, what combo contains..." 
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                  {/* Category & Price */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select 
                        className="form-input"
                        value={productFormData.category}
                        onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                      >
                        <option value="Gift wrapping and gift">Gift wrapping and gift</option>
                        <option value="Balloon bouquets">Balloon bouquets</option>
                        <option value="Flower bouquets">Flower bouquets</option>
                        <option value="Birthday balloon decoration">Birthday balloon decoration</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (INR) *</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Price in ₹" 
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                        min="0"
                        required 
                      />
                    </div>
                  </div>

                  {/* Image Upload Input */}
                  <div className="form-group">
                    <label className="form-label">Product Image *</label>
                    <div style={{
                      border: '2px dashed var(--primary-pink)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: 'var(--soft-pink-bg)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary-pink)' }} />
                          <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Uploading image to Supabase...</span>
                        </div>
                      ) : productFormData.image ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                          <img 
                            src={productFormData.image} 
                            alt="Preview" 
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--light-pink)' }} 
                          />
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '12px', color: '#10b981', display: 'block', fontWeight: 'bold' }}>Image Uploaded!</span>
                            <span style={{ fontSize: '10px', color: 'var(--gray-600)', wordBreak: 'break-all' }}>{productFormData.image.substring(0, 45)}...</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <FileImage size={24} style={{ color: 'var(--primary-pink)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--dark-pink)' }}>Click to upload product image</span>
                          <span style={{ fontSize: '11px', color: 'var(--gray-600)' }}>Supports PNG, JPG, JPEG</span>
                        </div>
                      )}
                    </div>
                    {uploadError && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {uploadError}
                      </div>
                    )}
                    
                    {/* Backup Web URL Input */}
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--gray-600)', marginBottom: '4px', display: 'block' }}>Or paste direct image URL address:</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="https://example.com/image.jpg" 
                        value={productFormData.image}
                        onChange={(e) => setProductFormData({...productFormData, image: e.target.value})}
                        style={{ fontSize: '12px', borderRadius: '8px' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Tags & Stock Status */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Badges / Tags (Comma separated)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Combo, Bestseller, Fresh" 
                        value={productFormData.tags}
                        onChange={(e) => setProductFormData({...productFormData, tags: e.target.value})}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                      <label className="form-label">Inventory Status</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '44px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={productFormData.inStock}
                          onChange={(e) => setProductFormData({...productFormData, inStock: e.target.checked})}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary-pink)' }}
                        />
                        In Stock & Available
                      </label>
                    </div>
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowProductForm(false)}
                      className="btn btn-secondary" 
                      style={{ flexGrow: 1, borderRadius: '20px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ flexGrow: 1, borderRadius: '20px' }}
                    >
                      Save Product
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Manage Orders */}
        {activeSubTab === 'orders' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--dark-pink)', margin: 0 }}>Customer Booking Requests ({orders.length})</h3>
              <button 
                onClick={fetchOrders}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                disabled={ordersLoading}
              >
                {ordersLoading && <Loader2 size={12} className="animate-spin" />}
                Refresh Orders
              </button>
            </div>

            {ordersLoading && orders.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={30} style={{ color: 'var(--primary-pink)' }} />
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                background: 'var(--white)',
                padding: '48px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid var(--gray-100)',
                color: 'var(--gray-600)'
              }}>
                No orders placed yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((o) => (
                  <div 
                    key={o.id}
                    style={{
                      background: 'var(--white)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Row Order ID and Status selection */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      borderBottom: '1px dashed var(--gray-100)',
                      paddingBottom: '16px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <strong style={{ fontSize: '16px', color: 'var(--dark-pink)' }}>Order #{o.id}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--gray-600)', marginLeft: '12px' }}>
                          Placed on: {new Date(o.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Status update select */}
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--gray-200)',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: o.status === 'Completed' ? '#ecfdf5' : o.status === 'Processing' ? '#eff6ff' : o.status === 'Cancelled' ? '#fef2f2' : '#fffbeb',
                            color: o.status === 'Completed' ? '#10b981' : o.status === 'Processing' ? '#3b82f6' : o.status === 'Cancelled' ? '#ef4444' : '#d97706',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => handleDeleteOrder(o.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          title="Delete Order Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Delivery Information grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                      marginBottom: '20px',
                      fontSize: '13px'
                    }} className="order-details-info">
                      
                      <div>
                        <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px', fontWeight: '800' }}>Customer Details</h4>
                        <p style={{ margin: '4px 0' }}><strong>Name:</strong> {o.customerName}</p>
                        <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {o.customerPhone}</p>
                        <button
                          onClick={() => handleChatWithCustomer(o)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            borderRadius: '12px',
                            marginTop: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            borderColor: '#25D366',
                            color: '#25D366'
                          }}
                        >
                          <MessageSquare size={12} style={{ fill: 'currentColor', stroke: 'none' }} />
                          WhatsApp Customer
                        </button>
                      </div>

                      <div>
                        <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px', fontWeight: '800' }}>Delivery Details</h4>
                        <p style={{ margin: '4px 0' }}><strong>Mode:</strong> {o.deliveryType}</p>
                        <p style={{ margin: '4px 0' }}><strong>Date:</strong> {o.deliveryDate}</p>
                        <p style={{ margin: '4px 0' }}><strong>Time Slot:</strong> {o.deliveryTimeSlot}</p>
                        <p style={{ margin: '4px 0' }}><strong>Address:</strong> {o.address}</p>
                        {o.notes && <p style={{ margin: '4px 0', color: 'var(--gray-600)' }}><strong>Instructions:</strong> "{o.notes}"</p>}
                      </div>

                    </div>

                    {/* Order items listing */}
                    <div style={{
                      background: 'var(--soft-pink-bg)',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '13px'
                    }}>
                      <h4 style={{ color: 'var(--dark-pink)', marginBottom: '10px', fontWeight: '800' }}>Items Ordered ({o.items.length})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {o.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: idx === o.items.length - 1 ? 'none' : '1px solid rgba(240, 98, 146, 0.1)',
                            paddingBottom: '8px',
                            alignItems: 'center'
                          }}>
                            <div>
                              <strong>{item.name}</strong> <span style={{ color: 'var(--gray-600)' }}>x {item.quantity}</span>
                              {item.customNote && (
                                <div style={{ fontSize: '11px', color: 'var(--primary-pink)', fontStyle: 'italic', marginTop: '2px' }}>
                                  Custom Text: "{item.customNote}"
                                </div>
                              )}
                            </div>
                            <span style={{ fontWeight: '700', color: 'var(--gray-800)' }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(240, 98, 146, 0.2)',
                        fontWeight: '800',
                        fontSize: '15px'
                      }}>
                        <span>Total Paid/Booking Value:</span>
                        <span style={{ color: 'var(--dark-pink)' }}>₹{o.total}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Developer Credit Footer */}
      <div style={{
        marginTop: '60px',
        paddingTop: '24px',
        borderTop: '1px solid var(--gray-200)',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--gray-600)'
      }}>
        <p style={{ margin: '4px 0' }}>
          © {new Date().getFullYear()} The Surprise Box Admin. Developed by <strong style={{ color: 'var(--primary-pink)' }}>Shaivika Groups</strong>
        </p>
        <p style={{ margin: '4px 0', fontSize: '11px', opacity: 0.85 }}>
          📞 8985541157 | ✉️ kh2kgaming@gmail.com
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .order-details-info {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        .admin-table th, .admin-table td {
          border-bottom: 1px solid var(--gray-100);
        }
      `}} />
    </section>
  );
}
