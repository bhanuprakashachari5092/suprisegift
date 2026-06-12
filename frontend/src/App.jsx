import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import SupabaseSetup from './components/SupabaseSetup';
import Home from './pages/Home';
import Contact from './pages/Contact';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/AdminPortal';
import { INITIAL_PRODUCTS } from './data/seedData';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// Main Storefront Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fee2e2', color: '#991b1b', margin: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


function MainApp() {
  // Auth User Session State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Store Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart State (stored locally)
  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('sb_cart');
    return local ? JSON.parse(local) : [];
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Search and Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Toast feedback
  const [toasts, setToasts] = useState([]);

  // Monitor Auth Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch products from Supabase database
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map postgres in_stock -> camelCase inStock
        const formatted = data.map(p => ({
          ...p,
          inStock: p.in_stock
        }));
        setProducts(formatted);
      } else {
        // If table is completely empty, seed it with INITIAL_PRODUCTS
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

        // Fetch again after seeding
        const { data: refetchedData, error: refetchError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (refetchError) throw refetchError;
        setProducts((refetchedData || []).map(p => ({ ...p, inStock: p.in_stock })));
      }
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('sb_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast Helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1, customNote = '') => {
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.customNote === customNote
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { ...product, quantity, customNote }]);
    }
    showToast(`Added ${quantity}x ${product.name} to cart!`);
  };

  const handleUpdateCartQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const handleRemoveCartItem = (index) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    showToast("Item removed from cart");
  };

  // Loading wrapper during bootstrap check
  if (authLoading || productsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-pink)' }} />
        <p style={{ color: 'var(--gray-600)', fontSize: '15px', fontWeight: '600' }}>Initializing stores...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          
          {/* Toast Notification Container */}
          <div className="toast-container" style={{ zIndex: 9999 }}>
            {toasts.map(t => (
              <div key={t.id} className="toast">
                <ShoppingBag size={16} style={{ color: 'var(--primary-pink)' }} />
                <span>{t.message}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Navbar */}
          <Navbar 
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setCartDrawerOpen(true)}
            user={user}
          />

          {/* Main Content Router */}
          <main style={{ flexGrow: 1 }}>
            <Routes>
              {/* Storefront Home Route */}
              <Route path="/" element={
                <Home 
                  products={products}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  handleAddToCart={handleAddToCart}
                  setSelectedProduct={setSelectedProduct}
                />
              } />

              {/* Static Pages */}
              <Route path="/contact" element={<Contact />} />
              
              {/* User Auth Routes */}
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

              {/* User Dashboard / Order History */}
              <Route path="/orders" element={user ? <OrderHistory /> : <Navigate to="/login" />} />

              {/* Admin Portal (Unprotected as requested) */}
              <Route path="/admin" element={<Admin />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Footer component */}
          <Footer />

          {/* Side Slide-in Cart Drawer */}
          <CartDrawer 
            isOpen={cartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckoutClick={() => {
              setCartDrawerOpen(false);
              setCheckoutOpen(true);
            }}
          />

          {/* Detailed Product Zoom Modal */}
          {selectedProduct && (
            <ProductModal 
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
            />
          )}

          {/* Checkout Submission Form Modal */}
          <CheckoutModal 
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            cartItems={cart}
            clearCart={() => setCart([])}
            user={user}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default function App() {
  // If Supabase client has not been configured yet, redirect to setup wizard
  if (!supabase) {
    return <SupabaseSetup />;
  }
  return <MainApp />;
}
