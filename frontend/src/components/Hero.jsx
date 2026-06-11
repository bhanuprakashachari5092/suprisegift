import React from 'react';
import { ChevronRight, MessageCircle, Heart, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import giftAnimationData from '../assets/gift-lottie.json';

export default function Hero({ onExploreClick, onContactClick }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: { 
      y: [-10, 10, -10],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const floatingVariantsAlt = {
    initial: { y: 0, rotate: 0 },
    animate: { 
      y: [10, -10, 10],
      rotate: [-5, 5, -5],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <section style={{
      background: 'var(--soft-pink-bg)',
      position: 'relative',
      overflow: 'hidden',
      padding: '140px 0 160px 0',
    }}>
      {/* Animated Background Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(255, 77, 109, 0.08) 0%, rgba(255,255,255,0) 70%)',
          top: '-200px',
          right: '-150px',
          zIndex: 0,
          borderRadius: '50%'
        }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(131, 56, 236, 0.08) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-150px',
          left: '-200px',
          zIndex: 0,
          borderRadius: '50%'
        }} 
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '80px',
          alignItems: 'center'
        }} className="hero-grid">
          
          {/* Hero Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'left' }}
          >
            <motion.div variants={itemVariants} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 77, 109, 0.2)',
              padding: '8px 20px',
              borderRadius: '50px',
              marginBottom: '32px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-pink)',
                display: 'inline-block',
                boxShadow: '0 0 10px var(--primary-pink)',
                animation: 'heartbeat 2s infinite'
              }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark-pink)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Premium Gifting Experience
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} style={{
              fontSize: '64px',
              lineHeight: '1.1',
              marginBottom: '24px',
              color: 'var(--dark-pink)',
              fontWeight: '700',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '-0.02em'
            }} className="hero-title">
              Crafting Joy & <br/>
              <span className="text-gradient" style={{ fontStyle: 'italic', paddingRight: '10px' }}>Unforgettable</span> Surprises
            </motion.h1>

            <motion.p variants={itemVariants} style={{
              fontSize: '18px',
              color: 'var(--gray-600)',
              marginBottom: '48px',
              lineHeight: '1.7',
              maxWidth: '540px',
              fontWeight: '400'
            }}>
              Discover world-class gift wrapping, bespoke luxury balloon bouquets, fresh flower arrangements, and elegant birthday decors tailored to create magic.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={onExploreClick}
                className="btn btn-primary"
                style={{ padding: '18px 40px', fontSize: '14px' }}
              >
                Explore Collection
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={onContactClick}
                className="btn btn-secondary glass-panel"
                style={{ 
                  padding: '18px 40px', 
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <MessageCircle size={18} style={{ fill: 'currentColor', stroke: 'none' }} />
                Concierge
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Decorative Visual Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-visual-container" 
            style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            
            {/* Floating Decorative Elements */}
            <motion.div variants={floatingVariants} initial="initial" animate="animate" style={{ position: 'absolute', top: '-30px', left: '-20px', zIndex: 2, background: 'var(--white)', padding: '12px', borderRadius: '50%', boxShadow: 'var(--shadow-md)', color: 'var(--primary-pink)' }}>
              <Heart size={24} fill="currentColor" />
            </motion.div>
            <motion.div variants={floatingVariantsAlt} initial="initial" animate="animate" style={{ position: 'absolute', bottom: '40px', right: '-30px', zIndex: 2, background: 'var(--white)', padding: '14px', borderRadius: '50%', boxShadow: 'var(--shadow-md)', color: 'var(--gold-accent)' }}>
              <Star size={28} fill="currentColor" />
            </motion.div>
            <motion.div variants={floatingVariants} initial="initial" animate="animate" style={{ position: 'absolute', top: '50%', left: '-40px', zIndex: 2, background: 'var(--white)', padding: '10px', borderRadius: '50%', boxShadow: 'var(--shadow-md)', color: 'var(--blue-accent)' }}>
              <Sparkles size={20} fill="currentColor" />
            </motion.div>

            <div className="glass-panel" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              aspectRatio: '1',
              borderRadius: 'var(--radius-xl)',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              
              <div style={{
                width: '160px',
                height: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                position: 'relative'
              }}>
                {/* Glow behind the lottie animation */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'var(--primary-pink)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  zIndex: 0,
                  borderRadius: '50%'
                }} />
                <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                  {typeof Lottie === 'function' ? (
                    <Lottie animationData={giftAnimationData} loop={true} style={{ width: '100%', height: '100%' }} />
                  ) : Lottie && Lottie.default ? (
                    <Lottie.default animationData={giftAnimationData} loop={true} style={{ width: '100%', height: '100%' }} />
                  ) : null}
                </div>
              </div>
              
              <h3 style={{ fontSize: '28px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: 'var(--dark-pink)', marginBottom: '12px' }}>
                Hindupur Delivery
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '32px', fontWeight: '400' }}>
                Select your favorite products, and we will elegantly hand-deliver them directly to your doorstep.
              </p>
              <div style={{
                borderTop: '1px solid rgba(0,0,0,0.05)',
                paddingTop: '24px',
                width: '100%',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: '600',
                color: 'var(--primary-pink)'
              }}>
                Call: 9703191369
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .hero-grid > div {
            text-align: center !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-title {
            font-size: 48px !important;
          }
          .hero-visual-container {
            margin-top: 20px;
          }
          .hero-grid button {
            width: 100%;
            justify-content: center;
          }
        }
        @keyframes heartbeat {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </section>
  );
}
