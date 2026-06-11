import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckoutClick }) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Background overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Slide drawer container */}
      <div className="drawer">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid var(--gray-100)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary-pink)' }} />
            <h2 style={{ fontSize: '20px', color: 'var(--dark-pink)', margin: 0 }}>
              Your Surprise Cart
            </h2>
            <span style={{
              background: 'var(--light-pink)',
              color: 'var(--primary-pink)',
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              {cartItems.length}
            </span>
          </div>
          
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-600)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80%',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--soft-pink-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-pink)',
                marginBottom: '20px'
              }}>
                <ShoppingBag size={36} />
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--dark-pink)', marginBottom: '8px' }}>Your cart is empty</h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', maxWidth: '250px' }}>
                Fill it with beautiful balloon bouquets, flower gifts, or gorgeous wrapping!
              </p>
              <button 
                onClick={onClose}
                className="btn btn-primary"
                style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '20px' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="cart-item">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="cart-item-img" 
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600";
                    }}
                  />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    {item.customNote && (
                      <div className="cart-item-desc" style={{
                        background: 'var(--soft-pink-bg)',
                        borderLeft: '2px solid var(--primary-pink)',
                        padding: '4px 6px',
                        marginTop: '4px',
                        borderRadius: '0 4px 4px 0',
                        fontSize: '11px',
                        fontStyle: 'italic',
                        color: 'var(--dark-pink)'
                      }}>
                        Note: "{item.customNote}"
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginTop: '8px' }}>
                      <div className="cart-item-qty">
                        <button 
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="cart-item-qty-btn"
                        >
                          -
                        </button>
                        <span className="cart-item-qty-val">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="cart-item-qty-btn"
                        >
                          +
                        </button>
                      </div>
                      
                      <span className="cart-item-price" style={{ marginLeft: '12px' }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--gray-600)',
                      cursor: 'pointer',
                      padding: '8px',
                      transition: 'var(--transition-smooth)'
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--gray-100)',
            backgroundColor: 'var(--gray-50)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-600)' }}>Subtotal:</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--dark-pink)' }}>
                ₹{totalAmount}
              </span>
            </div>

            <button 
              onClick={onCheckoutClick}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px'
              }}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
