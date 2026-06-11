import React, { useState } from 'react';
import { ShoppingBag, Menu, X, LogOut, LogIn, Gift } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ cartCount, onCartClick, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const getLinkStyle = (path) => {
    const isActive = currentPath === path;
    return {
      background: 'none',
      border: 'none',
      fontSize: '13px',
      fontFamily: 'var(--font-sans)',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: isActive ? 'var(--primary-pink)' : 'var(--gray-800)',
      cursor: 'pointer',
      transition: 'var(--transition-smooth)',
      position: 'relative',
      padding: '8px 0',
      textDecoration: 'none',
      display: 'inline-block'
    };
  };

  const getActiveIndicator = (path) => {
    if (currentPath !== path) return null;
    return (
      <motion.span 
        layoutId="navIndicator"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'var(--hero-gradient)',
          borderRadius: '2px'
        }} 
      />
    );
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="header-glass"
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100px' }}>
        {/* Brand Logo and Title */}
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--hero-gradient)',
            boxShadow: 'var(--glow-primary)',
            color: 'var(--white)'
          }}>
            <Gift size={28} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              margin: 0, 
              letterSpacing: '-0.02em', 
              lineHeight: 1.1, 
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-pink)'
            }}>
              The Surprise Box
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '600', margin: 0, marginTop: '2px' }}>
              Premium Gifting
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <Link to="/" style={getLinkStyle('/')}>
            Home & Shop
            {getActiveIndicator('/')}
          </Link>
          
          <Link to="/contact" style={getLinkStyle('/contact')}>
            Contact Us
            {getActiveIndicator('/contact')}
          </Link>

          {/* Conditional logged in routes */}
          {user && (
            <Link to="/orders" style={getLinkStyle('/orders')}>
              My Bookings
              {getActiveIndicator('/orders')}
            </Link>
          )}
          

          {/* User Authentication Status */}
          {user ? (
            <button 
              onClick={handleSignOut}
              className="btn btn-secondary"
              style={{ 
                padding: '10px 20px', 
                fontSize: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="btn btn-primary"
              style={{ 
                padding: '10px 24px', 
                fontSize: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
              }}
            >
              <LogIn size={14} />
              Login
            </Link>
          )}
        </nav>

        {/* Action Buttons (Cart & Mobile Menu) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Cart Icon Button */}
          <button 
            onClick={onCartClick}
            className="btn-icon"
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'var(--dark-pink)',
                color: 'var(--white)',
                fontSize: '10px',
                fontWeight: '600',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--white)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dark-pink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-only animate-fade-in" style={{
          position: 'absolute',
          top: '90px',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--white)',
          boxShadow: 'var(--shadow-md)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 99
        }}>
          <Link 
            to="/" 
            style={getLinkStyle('/')} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Home & Shop
          </Link>
          
          <Link 
            to="/contact" 
            style={getLinkStyle('/contact')} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact Us
          </Link>

          {user && (
            <Link 
              to="/orders" 
              style={getLinkStyle('/orders')} 
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </Link>
          )}


          {user ? (
            <button 
              onClick={handleSignOut}
              className="btn btn-secondary"
              style={{ 
                justifyContent: 'center', 
                width: '100%'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="btn btn-primary"
              style={{ 
                justifyContent: 'center', 
                width: '100%',
                textAlign: 'center',
                display: 'block'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogIn size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Login
            </Link>
          )}
        </div>
      )}

      {/* Inline styles for media query controls */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}} />
    </motion.header>
  );
}
