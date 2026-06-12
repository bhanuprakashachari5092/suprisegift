import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MessageCircle, Calendar, Clock, MapPin, Phone, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutModal({ isOpen, onClose, cartItems, clearCart, user }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryType: 'Home Delivery',
    address: '',
    date: '',
    timeSlot: '12:00 PM - 03:00 PM',
    notes: ''
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone_number || ''
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClose = () => {
    setOrderPlaced(false);
    setPlacedOrderDetails(null);
    setFormData({
      name: user ? (user.user_metadata?.full_name || '') : '',
      phone: user ? (user.user_metadata?.phone_number || '') : '',
      deliveryType: 'Home Delivery',
      address: '',
      date: '',
      timeSlot: '12:00 PM - 03:00 PM',
      notes: ''
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    // Basic validation
    if (!formData.name || !formData.phone || (formData.deliveryType === 'Home Delivery' && !formData.address) || !formData.date) {
      alert("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    // Add a minimum delay of 1.5s so the user can see the "Booking..." animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const orderId = 'SB-' + Math.floor(100000 + Math.random() * 900000);
    const addressStr = formData.deliveryType === 'Home Delivery' ? formData.address : 'Self Pickup at Store';

    try {
      // 1. Insert order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user ? user.id : null,
          customer_name: formData.name,
          customer_phone: formData.phone,
          delivery_type: formData.deliveryType,
          address: addressStr,
          delivery_date: formData.date,
          delivery_time_slot: formData.timeSlot,
          notes: formData.notes,
          total: totalAmount,
          status: 'Pending'
        });

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItemsRows = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        custom_note: item.customNote || ''
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsRows);

      if (itemsError) throw itemsError;

      const orderData = {
        id: orderId,
        customerName: formData.name,
        customerPhone: formData.phone,
        deliveryType: formData.deliveryType,
        address: addressStr,
        deliveryDate: formData.date,
        deliveryTimeSlot: formData.timeSlot,
        notes: formData.notes,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customNote: item.customNote || ''
        })),
        total: totalAmount,
        status: 'Pending'
      };

      setPlacedOrderDetails(orderData);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!placedOrderDetails) return;

    const { id, customerName, customerPhone, deliveryType, address, deliveryDate, deliveryTimeSlot, notes, items, total } = placedOrderDetails;

    // Build WhatsApp message format
    let message = `*💝 NEW ORDER PLACED - THE SURPRISE BOX 💝*\n\n`;
    message += `*Order ID:* #${id}\n`;
    message += `*Customer:* ${customerName}\n`;
    message += `*Contact:* ${customerPhone}\n\n`;
    message += `*Delivery Details:*\n`;
    message += `• *Type:* ${deliveryType}\n`;
    message += `• *Address:* ${address}\n`;
    message += `• *Date:* ${deliveryDate}\n`;
    message += `• *Time Slot:* ${deliveryTimeSlot}\n`;
    if (notes) {
      message += `• *Special Instruction:* ${notes}\n`;
    }
    message += `\n*Ordered Items:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (Qty: ${item.quantity})\n`;
      message += `   Price: ₹${item.price * item.quantity}\n`;
      if (item.customNote) {
        message += `   Customization: _"${item.customNote}"_\n`;
      }
    });

    message += `\n*Total Order Amount:* ₹${total}\n\n`;
    message += `Thank you for ordering with The Surprise Box! Please confirm my booking.`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "9703191369";
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: (!user || orderPlaced) ? '450px' : '550px', position: 'relative' }}
      >
        {/* Fullscreen Popup Loading Overlay */}
        {submitting && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}>
            <div style={{
              background: 'var(--white)',
              padding: '36px 30px',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(136, 14, 79, 0.15)',
              border: '1px solid var(--light-pink)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90%',
              maxWidth: '300px',
              textAlign: 'center',
              animation: 'scaleIn 0.3s ease'
            }}>
              <Loader2 size={44} className="animate-spin" style={{ color: 'var(--primary-pink)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark-pink)', margin: 0 }}>
                Booking...
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>Please wait while we process your request...</p>
            </div>
          </div>
        )}

        {/* Close button */}
        <button className="modal-close-btn" onClick={handleClose} disabled={submitting}>
          <X size={18} />
        </button>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertCircle size={36} />
            </div>
            <h2 style={{ fontSize: '22px', color: 'var(--dark-pink)', marginBottom: '12px', fontWeight: '800' }}>
              Login Required
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.5' }}>
              You must be logged in to your account to place a surprise booking.
            </p>
            <button 
              onClick={() => {
                handleClose();
                window.location.href = '/login';
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '30px',
                fontSize: '15px'
              }}
            >
              Login to Proceed
            </button>
          </div>
        ) : !orderPlaced ? (
          <>
            <h2 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '6px' }}>Checkout Details</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '24px' }}>
              Please provide your delivery information to complete your booking.
            </p>

            {submitError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Customer Name */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Full Name *
                </label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Customer Phone */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> Phone Number *
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-input" 
                  placeholder="Enter 10-digit mobile number" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Delivery Type Selection */}
              <div className="form-group">
                <label className="form-label">Delivery Mode</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="deliveryType" 
                      value="Home Delivery"
                      checked={formData.deliveryType === 'Home Delivery'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary-pink)' }}
                      disabled={submitting}
                    />
                    Home Delivery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="deliveryType" 
                      value="Store Pickup"
                      checked={formData.deliveryType === 'Store Pickup'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--primary-pink)' }}
                      disabled={submitting}
                    />
                    Self Pickup (Hindupur)
                  </label>
                </div>
              </div>

              {/* Address (conditional) */}
              {formData.deliveryType === 'Home Delivery' && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> Delivery Address *
                  </label>
                  <textarea 
                    name="address" 
                    className="form-input form-textarea" 
                    placeholder="Provide full street address, landmark, and area in Hindupur" 
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{ minHeight: '60px' }}
                    required
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Date & Time Slot Grid */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> Delivery Date *
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    className="form-input" 
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]} // Can't order past dates
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Time Slot *
                  </label>
                  <select 
                    name="timeSlot" 
                    className="form-input"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="09:00 AM - 12:00 PM">Morning (09am - 12pm)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12pm - 03pm)</option>
                    <option value="03:00 PM - 06:00 PM">Late Afternoon (03pm - 06pm)</option>
                    <option value="06:00 PM - 09:00 PM">Evening (06pm - 09pm)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Special Delivery Instructions (Optional)</label>
                <input 
                  type="text" 
                  name="notes" 
                  className="form-input" 
                  placeholder="Gate passcode, call before arrival, keep it surprise, etc." 
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              {/* Order total info and place CTA */}
              <div style={{
                background: 'var(--soft-pink-bg)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--light-pink)',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Final Booking Value</span>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark-pink)' }}>₹{totalAmount}</div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={submitting}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Booking...' : 'Place Order'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Order Placed Success Screen */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)'
            }}>
              <CheckCircle size={44} />
            </div>

            <h2 style={{ fontSize: '26px', color: 'var(--dark-pink)', marginBottom: '8px' }}>
              Booking Confirmed!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px', lineHeight: '1.5' }}>
              Your order <strong style={{ color: 'var(--dark-pink)' }}>#{placedOrderDetails?.id}</strong> has been successfully saved in our system!
            </p>

            <div style={{
              background: 'var(--soft-pink-bg)',
              border: '1px dashed var(--primary-pink)',
              padding: '18px',
              borderRadius: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '15px', color: 'var(--dark-pink)', marginBottom: '8px', fontWeight: '800' }}>
                Order Summary:
              </h4>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '13px', color: 'var(--gray-800)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Customer:</strong> {placedOrderDetails?.customerName}</li>
                <li><strong>Delivery:</strong> {placedOrderDetails?.deliveryDate} ({placedOrderDetails?.deliveryTimeSlot})</li>
                <li><strong>Total Value:</strong> ₹{placedOrderDetails?.total}</li>
              </ul>
            </div>

            {/* WA Checkout CTA */}
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px' }}>
              To complete the booking and set up delivery details, please send the summary to Vishnu on WhatsApp:
            </p>

            <button 
              onClick={handleWhatsAppRedirect}
              className="btn btn-gold"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '16px',
                backgroundColor: '#25D366', // WhatsApp Brand Color
                borderColor: '#25D366',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                color: 'var(--white)',
                animation: 'pulseGold 2s infinite'
              }}
            >
              <MessageCircle size={20} style={{ fill: 'currentColor', stroke: 'none' }} />
              Confirm via WhatsApp
            </button>

            <button 
              onClick={handleClose}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '30px',
                marginTop: '12px',
                fontSize: '14px'
              }}
            >
              Back to Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
