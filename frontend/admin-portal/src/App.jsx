import React, { useState, useEffect } from 'react';
import AdminPortal from './components/AdminPortal';
import SupabaseSetup from './components/SupabaseSetup';
import { supabase } from './supabaseClient';
import { INITIAL_PRODUCTS } from './data/seedData';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = async () => {
    if (products.length === 0) {
      setProductsLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map(p => ({
          ...p,
          inStock: p.in_stock
        })));
      } else {
        if (INITIAL_PRODUCTS && INITIAL_PRODUCTS.length > 0) {
          // Seed database if empty
          console.log('Database table "products" is empty. Seeding seedData...');
          const seedRows = INITIAL_PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image,
            tags: p.tags || [],
            in_stock: p.inStock,
            rating: p.rating || 5.0,
            reviews: p.reviews || 0
          }));

          const { error: seedError } = await supabase.from('products').insert(seedRows);
          if (seedError) throw seedError;

          const { data: refetchedData } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

          setProducts((refetchedData || []).map(p => ({ ...p, inStock: p.in_stock })));
        } else {
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchProducts();
  }, []);

  if (productsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-pink)' }} />
        <p style={{ color: 'var(--gray-600)', fontSize: '15px', fontWeight: '600' }}>Initializing Admin Portal...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <AdminPortal 
        products={products}
        refreshProducts={fetchProducts}
      />
    </div>
  );
}

export default function App() {
  if (!supabase) {
    return <SupabaseSetup />;
  }
  return <MainApp />;
}
