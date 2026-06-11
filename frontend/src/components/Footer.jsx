import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--dark-pink)',
      color: 'var(--white)',
      padding: '32px 0',
      borderTop: '4px solid transparent',
      borderImage: 'var(--hero-gradient) 1'
    }}>
      <div className="container">
        {/* Footer bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--light-pink)'
        }} className="footer-bottom">
          <span>
            <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none', cursor: 'text' }}>
              © {new Date().getFullYear()} The Surprise Box. All rights reserved.
            </Link>
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }} className="footer-credits">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              Made with <Heart size={12} fill="var(--primary-pink)" stroke="none" style={{ animation: 'heartbeat 1.5s infinite' }} /> for Vishnu, Hindupur.
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
              Developed by <strong style={{ color: 'var(--gold-accent)' }}>Shaivika Groups</strong>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--light-pink)', opacity: 0.8 }}>
              📞 8985541157 | ✉️ kh2kgaming@gmail.com
            </span>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
          }
          .footer-credits {
            text-align: center !important;
            align-items: center !important;
          }
          .footer-credits span {
            justify-content: center !important;
          }
        }
      `}} />
    </footer>
  );
}
