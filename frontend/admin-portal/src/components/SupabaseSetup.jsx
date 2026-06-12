import React, { useState } from 'react';
import { Database, Key, Globe, CheckCircle2, Copy, Play } from 'lucide-react';
import { saveSupabaseConfig } from '../supabaseClient';

export default function SupabaseSetup() {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !anonKey) {
      alert('Please fill out both fields.');
      return;
    }
    saveSupabaseConfig(url, anonKey);
    window.location.reload();
  };

  const sqlCode = `-- Run this in your Supabase SQL Editor:

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    address TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    delivery_time_slot TEXT NOT NULL,
    notes TEXT,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending'::text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    custom_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Creating open policies for development (you can restrict these later)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin all access on products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow authenticated insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow admin all access on orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow authenticated insert on order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
);
CREATE POLICY "Allow admin all access on order_items" ON public.order_items FOR ALL USING (true);

-- 4. Create the product-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access controls (Row Level Security) for the bucket
-- Allow public read access to the bucket so images can be displayed
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow anyone to upload images (For the Admin Portal)
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' );

-- Allow anyone to update/delete images (For the Admin Portal)
CREATE POLICY "Allow Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'product-images' );

CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' );`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fef3c7 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(244, 63, 94, 0.15)',
        borderRadius: '32px',
        boxShadow: '0 20px 40px rgba(136, 14, 79, 0.08)',
        width: '100%',
        maxWidth: '960px',
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px'
      }} className="setup-grid">
        
        {/* Left Side: SQL Script & Instructions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-pink), var(--gold-accent))',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Database size={20} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--dark-pink)', margin: 0 }}>
              Database Setup
            </h2>
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '20px' }}>
            To link this Admin Dashboard to your database, please execute the database schema below in your Supabase project's <strong>SQL Editor</strong>.
          </p>

          <div style={{ position: 'relative', background: '#1e1e2e', borderRadius: '16px', padding: '16px', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              fontSize: '11px',
              color: '#a6adc8',
              borderBottom: '1px solid #313244',
              paddingBottom: '8px'
            }}>
              <span>schema.sql</span>
              <button 
                onClick={copySql}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#a6e3a1' : '#cdd6f4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre style={{
              margin: 0,
              fontSize: '11px',
              color: '#cdd6f4',
              maxHeight: '260px',
              overflowY: 'auto',
              fontFamily: '"Fira Code", monospace',
              textAlign: 'left',
              lineHeight: '1.5'
            }}>
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Right Side: Setup Form */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark-pink)', marginBottom: '8px' }}>
            Enter Supabase Credentials
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '24px' }}>
            Paste the connection parameters for the project to initialize the database connect.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ textAlign: 'left', margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                <Globe size={14} style={{ color: 'var(--primary-pink)' }} /> Supabase Project URL
              </label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://your-project.supabase.co" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ borderRadius: '12px', fontSize: '13px' }}
                required 
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left', margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                <Key size={14} style={{ color: 'var(--primary-pink)' }} /> Anon API Key (Public)
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                style={{ borderRadius: '12px', fontSize: '13px' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary animate-pulseGold" 
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px'
              }}
            >
              <Play size={16} />
              Save and Connect Database
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '11px',
            color: '#b45309',
            lineHeight: '1.5'
          }}>
            <strong>Pro Tip:</strong> You can also set these permanently in a <code>.env</code> file in the project root folder as <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .setup-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 24px !important;
          }
        }
      `}} />
    </div>
  );
}
