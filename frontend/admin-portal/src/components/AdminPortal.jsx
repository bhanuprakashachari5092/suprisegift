import React, { useState, useEffect } from 'react';
import { 
  LogIn, LayoutDashboard, ShoppingBag, ClipboardList, Plus, 
  Trash2, Edit, MessageSquare, LogOut, AlertCircle, 
  FileImage, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminPortal({ products, refreshProducts }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('sb_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Dashboard Sub-tabs: 'dashboard', 'products', 'orders'
  const [activeSubTab, setActiveSubTab] = useState('orders');

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
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Authentication Handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('sb_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid Username or Password (use admin / admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sb_admin_auth');
    setUsername('');
    setPassword('');
  };

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
          id: 'p-' + Math.floor(1000 + Math.random() * 9000),
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

  // Authentication Card View
  if (!isAuthenticated) {
    return (
      <section className="section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #fdf2f8 0%, #fffbeb 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            background: 'var(--white)',
            border: '1px solid rgba(240, 98, 146, 0.25)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
          }} className="animate-fade-in">
            
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'var(--soft-pink-bg)',
              color: 'var(--primary-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <LogIn size={28} />
            </div>

            <h2 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '8px', fontWeight: '800' }}>Admin Login</h2>
            <p style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '24px' }}>
              Manage products and customer orders for The Surprise Box.
            </p>

            {loginError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} />
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="admin" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ borderRadius: '12px' }}
                  required 
                />
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: '12px' }}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '25px', fontSize: '15px', fontWeight: '700' }}>
                Login to Portal
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard View
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

          <button 
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Customer Booking Requests List (Directly displayed, no tabs) */}
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
