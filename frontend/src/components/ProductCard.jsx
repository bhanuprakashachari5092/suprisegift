import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart, onProductSelect }) {
  const { name, price, category, image, tags = [], rating, reviews } = product;

  return (
    <motion.div 
      className="glass-panel"
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        cursor: 'pointer'
      }}
    >
      {/* Product Image and Badge */}
      <div 
        className="product-card-img-wrapper" 
        onClick={() => onProductSelect(product)}
        style={{
          aspectRatio: '4/5',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {tags.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            color: 'var(--primary-pink)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 2
          }}>
            {tags[0]}
          </span>
        )}
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={image} 
          alt={name} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback image if drive link or image fails to load
            e.target.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600";
          }}
        />
      </div>

      {/* Card Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          color: 'var(--gray-600)',
          fontWeight: '600',
          letterSpacing: '0.1em',
          marginBottom: '8px'
        }}>
          {category}
        </span>
        
        <h3 
          onClick={() => onProductSelect(product)} 
          style={{
            fontSize: '20px',
            color: 'var(--dark-pink)',
            marginBottom: '12px',
            lineHeight: '1.3',
            fontFamily: 'var(--font-serif)',
            fontWeight: '700',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '52px'
          }}
        >
          {name}
        </h3>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: 'var(--gold-accent)',
          marginBottom: '20px'
        }}>
          <Star size={14} fill="var(--gold-accent)" stroke="none" />
          <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>{rating ? rating.toFixed(1) : '5.0'}</span>
          <span style={{ color: 'var(--gray-600)' }}>({reviews || 10} reviews)</span>
        </div>

        {/* Card Footer */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--gray-600)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Price</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark-pink)' }}>₹{price}</span>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 16px',
              fontSize: '12px',
              gap: '6px',
              borderRadius: '20px'
            }}
            title="Add to Cart"
          >
            <ShoppingCart size={14} />
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
