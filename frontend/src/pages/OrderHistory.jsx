import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ClipboardList, Calendar, Clock, MapPin, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserOrders = async (userId) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Query orders and join order_items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setErrorMsg(err.message || 'Failed to retrieve your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Not authenticated, redirect to login
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchUserOrders(session.user.id);
    };

    checkSession();
  }, [navigate]);

  const handleWhatsAppInquiry = (order) => {
    let message = `*💝 ORDER ENQUIRY - THE SURPRISE BOX 💝*\n\n`;
    message += `Hi Vishnu, I am checking status of my Order *#${order.id}*:\n`;
    message += `• *Status:* ${order.status}\n`;
    message += `• *Delivery Date:* ${order.delivery_date} (${order.delivery_time_slot})\n`;
    message += `• *Amount:* ₹${order.total}\n\n`;
    message += `Please let me know the update!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919703191369?text=${encoded}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#ecfdf5', color: '#10b981', border: '#d1fae5' };
      case 'Processing': return { bg: '#eff6ff', color: '#3b82f6', border: '#dbeafe' };
      case 'Cancelled': return { bg: '#fef2f2', color: '#ef4444', border: '#fee2e2' };
      default: return { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' }; // Pending
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--primary-pink)' }} />
        <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Loading your booking history...</p>
      </div>
    );
  }

  return (
    <section className="section-padding" style={{ background: 'var(--soft-pink-bg)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid var(--light-pink)',
          paddingBottom: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '28px', color: 'var(--dark-pink)', fontWeight: '800', margin: 0 }}>My Bookings</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '4px' }}>
              Track the real-time status of your surprise gift setups.
            </p>
          </div>
          
          <button 
            onClick={() => fetchUserOrders(user?.id)}
            style={{
              background: 'none',
              border: '1px solid var(--light-pink)',
              color: 'var(--primary-pink)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--white)'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{
            background: 'var(--white)',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(240, 98, 146, 0.15)'
          }} className="animate-fade-in">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--soft-pink-bg)',
              color: 'var(--primary-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <ClipboardList size={32} />
            </div>
            <h3 style={{ fontSize: '20px', color: 'var(--dark-pink)', marginBottom: '8px', fontWeight: '800' }}>No Bookings Found</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
              You haven't booked any surprise events or gift decorations yet. Start planning your next celebration!
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '20px' }}>
              Explore Services
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <div 
                  key={order.id} 
                  style={{
                    background: 'var(--white)',
                    borderRadius: '20px',
                    border: '1px solid var(--gray-100)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="order-card"
                >
                  {/* Top Order Row */}
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
                      <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Order ID</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark-pink)' }}>#{order.id}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '20px'
                      }}>
                        {order.status}
                      </span>
                      
                      <button 
                        onClick={() => handleWhatsAppInquiry(order)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#25D366',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={16} style={{ fill: 'currentColor', stroke: 'none' }} />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Info Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '20px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: 'var(--gray-800)',
                    lineHeight: '1.5'
                  }} className="order-details-grid">
                    
                    <div>
                      <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px', fontSize: '14px', fontWeight: '800' }}>
                        Delivery & Event Info
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--gray-600)', marginTop: '2px', flexShrink: 0 }} />
                        <span><strong>Date:</strong> {order.delivery_date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--gray-600)', marginTop: '2px', flexShrink: 0 }} />
                        <span><strong>Time Slot:</strong> {order.delivery_time_slot}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={14} style={{ color: 'var(--gray-600)', marginTop: '2px', flexShrink: 0 }} />
                        <span><strong>Address:</strong> {order.address}</span>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px', fontSize: '14px', fontWeight: '800' }}>
                        Customer Details
                      </h4>
                      <p style={{ margin: '0 0 6px 0' }}><strong>Name:</strong> {order.customer_name}</p>
                      <p style={{ margin: '0 0 6px 0' }}><strong>Phone:</strong> {order.customer_phone}</p>
                      {order.notes && (
                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--gray-600)', fontSize: '12px' }}>
                          * Instruction: "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div style={{
                    background: 'var(--soft-pink-bg)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--dark-pink)', fontWeight: '800' }}>
                      Items Ordered
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.order_items?.map((item) => (
                        <div 
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            borderBottom: '1px solid rgba(240, 98, 146, 0.1)',
                            paddingBottom: '8px'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--gray-800)' }}>{item.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--gray-600)', marginLeft: '8px' }}>
                              x{item.quantity}
                            </span>
                            {item.custom_note && (
                              <div style={{ fontSize: '11px', color: 'var(--primary-pink)', marginTop: '2px', fontStyle: 'italic' }}>
                                Note: "{item.custom_note}"
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: '700', color: 'var(--gray-800)' }}>
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Value Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--dark-pink)' }}>
                      Total Amount: <span style={{ fontSize: '18px' }}>₹{order.total}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 600px) {
          .order-details-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}} />
    </section>
  );
}
