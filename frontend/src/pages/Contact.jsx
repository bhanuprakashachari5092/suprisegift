import React from 'react';
import { Phone, MapPin, Gift, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Contact() {
  const phoneNumber = "9703191369";

  const handleCall = () => {
    window.location.href = `tel:+91${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    const message = "Hi Vishnu, I'm interested in ordering a surprise gift or booking a balloon decoration. Can you please share details?";
    window.open(`https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="contact" className="section-padding" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <div className="section-title">
          <h2>Get in Touch with Vishnu</h2>
          <p>Have custom ideas, themed party decoration requests, or special gift wrapping needs? Contact us directly and let's make it happen!</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start'
        }} className="contact-grid">
          
          {/* Contact Details Card */}
          <div className="animate-fade-in" style={{
            background: 'var(--soft-pink-bg)',
            border: '1px solid rgba(240, 98, 146, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '6px', fontWeight: '800' }}>
              Kurla Vishnuvardhan
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--gold-accent)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', marginBottom: '24px' }}>
              Proprietor, The Surprise Box
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Phone Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--white)',
                  color: 'var(--primary-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Phone size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'block' }}>Call / WhatsApp</span>
                  <strong style={{ fontSize: '18px', color: 'var(--dark-pink)' }}>+91 9703191369</strong>
                </div>
              </div>

              {/* Location Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--white)',
                  color: 'var(--primary-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'block' }}>Service Location</span>
                  <strong style={{ fontSize: '16px', color: 'var(--dark-pink)' }}>Hindupur & Surrounding Areas</strong>
                </div>
              </div>

              {/* Availability Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--white)',
                  color: 'var(--primary-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'block' }}>Delivery Schedule</span>
                  <strong style={{ fontSize: '16px', color: 'var(--dark-pink)' }}>Home Delivery (09:00 AM - 09:00 PM)</strong>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleCall}
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '12px 24px', borderRadius: '20px' }}
              >
                Call Now
              </button>
              <button 
                onClick={handleWhatsApp}
                className="btn btn-gold"
                style={{ flexGrow: 1, padding: '12px 24px', borderRadius: '20px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff' }}
              >
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Core Values / Information Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '8px' }}>Why Choose The Surprise Box?</h3>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ color: 'var(--primary-pink)', marginTop: '4px' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--dark-pink)', marginBottom: '4px' }}>
                  Premium Material & Aesthetics
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                  We import Korean matte papers for wrapping, high-quality helium balloons that stay afloat longer, and fresh blooming roses.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ color: 'var(--primary-pink)', marginTop: '4px' }}>
                <Heart size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--dark-pink)', marginBottom: '4px' }}>
                  Customized with Love
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                  Every balloon bouquet is tailored. Add custom name text, pick ribbons, choose favorite candy stuffing, or write bespoke gift letters.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ color: 'var(--primary-pink)', marginTop: '4px' }}>
                <Gift size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--dark-pink)', marginBottom: '4px' }}>
                  Doorstep Delivery in Hindupur
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                  Surprise someone without leaving your house. We deliver right to the spot, keeping the packages safe and balloon bouquets inflated.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .contact-grid div {
            padding: 24px !important;
          }
        }
      `}} />
    </section>
  );
}
