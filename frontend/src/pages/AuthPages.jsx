import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Gift, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;
      navigate('/');
    } catch (err) {
      if (err.message === 'Email not confirmed') {
        setErrorMsg('Email not confirmed');
      } else {
        setErrorMsg(err.message || 'An error occurred during sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setSuccessMsg('Confirmation email resent! Please check your inbox.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fffbeb 100%)'
    }}>
      <div style={{
        background: 'var(--white)',
        border: '1px solid rgba(240, 98, 146, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center'
      }} className="animate-fade-in">
        
        {/* Brand Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--soft-pink-bg)',
          color: 'var(--primary-pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <LogIn size={24} />
        </div>

        <h2 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '8px', fontWeight: '800' }}>Welcome Back</h2>
        <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '24px' }}>
          Log in to track orders and place bookings.
        </p>

        {errorMsg && (
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
            justifyContent: 'space-between',
            gap: '8px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg === 'Email not confirmed' ? 'Please confirm your email before logging in.' : errorMsg}</span>
            </div>
            {errorMsg === 'Email not confirmed' && (
              <button 
                type="button" 
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary-pink)', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '11px',
                  whiteSpace: 'nowrap'
                }}
              >
                {resendLoading ? 'Sending...' : 'Resend Email'}
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            color: '#059669',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="yourname@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                required 
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                required 
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '25px', 
              fontSize: '14px', 
              fontWeight: '700',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--gray-100)', paddingTop: '20px', fontSize: '13px', color: 'var(--gray-600)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-pink)', fontWeight: '700', textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            phone_number: phone.trim()
          }
        }
      });

      if (error) throw error;

      // Check if session exists (means email confirmation is disabled - auto logged in)
      if (data?.session) {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setSuccessMsg('Registration successful! Please check your email inbox to confirm your account.');
        setName('');
        setPhone('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fffbeb 100%)'
    }}>
      <div style={{
        background: 'var(--white)',
        border: '1px solid rgba(240, 98, 146, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center'
      }} className="animate-fade-in">
        
        {/* Brand Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--soft-pink-bg)',
          color: 'var(--primary-pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Gift size={24} />
        </div>

        <h2 style={{ fontSize: '24px', color: 'var(--dark-pink)', marginBottom: '8px', fontWeight: '800' }}>Create Account</h2>
        <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '24px' }}>
          Sign up to place gifts and balloon orders.
        </p>

        {errorMsg && (
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
            gap: '8px',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #d1fae5',
            color: '#059669',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                required 
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="10-digit mobile number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                required 
              />
              <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="yourname@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                required 
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Minimum 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', borderRadius: '12px' }}
                minLength="6"
                required 
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '25px', 
              fontSize: '14px', 
              fontWeight: '700',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--gray-100)', paddingTop: '20px', fontSize: '13px', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-pink)', fontWeight: '700', textDecoration: 'none' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
