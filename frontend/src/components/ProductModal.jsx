import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Edit3 } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');

  // Reset inputs when product changes
  useEffect(() => {
    setQuantity(1);
    setCustomNote('');
  }, [product]);

  if (!product) return null;

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    setQuantity(quantity + 1);
  };

  const handleAddClick = () => {
    onAddToCart(product, quantity, customNote);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content modal-content-lg animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ width: '95%', maxWidth: '850px' }}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', minHeight: '400px' }} className="modal-grid">
          
          {/* Product Image Section */}
          <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--gray-50)', display: 'flex', alignItems: 'center' }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', minHeight: '350px', maxHeight: '500px', objectFit: 'cover' }} 
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600";
              }}
            />
            {product.tags && product.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="product-card-badge" 
                style={{ top: '20px', left: '20px' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Product Details Section */}
          <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '500px' }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--primary-pink)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '8px',
              display: 'block'
            }}>
              {product.category}
            </span>
            
            <h2 style={{ fontSize: '28px', color: 'var(--dark-pink)', marginBottom: '12px', lineHeight: 1.2 }}>
              {product.name}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" stroke="none" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gray-800)' }}>
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                ({product.reviews || 12} customer reviews)
              </span>
            </div>

            {/* Price tag */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--dark-pink)' }}>
                ₹{product.price}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--primary-pink)', fontWeight: '600' }}>
                Inclusive of all taxes
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--gray-100)', marginBottom: '20px' }} />

            {/* Gifting Personalization Field */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={14} />
                Personalization / Order Note (Optional)
              </label>
              <textarea 
                className="form-input form-textarea"
                placeholder="Enter custom text for bubble balloon, gift tag card message, color preferences, etc."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                style={{ fontSize: '13px', minHeight: '70px', borderRadius: '12px' }}
              />
            </div>

            {/* Quantity Selector & Action Button */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Quantity</label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '2px solid var(--light-pink)',
                  borderRadius: '30px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--white)'
                }}>
                  <button 
                    onClick={handleDecreaseQty} 
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      color: 'var(--dark-pink)',
                      fontSize: '15px'
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 8px', minWidth: '30px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncreaseQty} 
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      color: 'var(--dark-pink)',
                      fontSize: '15px'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddClick}
                className="btn btn-primary"
                style={{ 
                  flexGrow: 1, 
                  height: '48px', 
                  borderRadius: '30px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  marginTop: '18px'
                }}
              >
                <ShoppingCart size={18} />
                Add to Cart • ₹{product.price * quantity}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-content-lg {
            max-height: 95vh !important;
          }
          .modal-grid img {
            max-height: 250px !important;
            min-height: 200px !important;
          }
          .modal-grid div {
            padding: 24px !important;
          }
        }
      `}} />
    </div>
  );
}
