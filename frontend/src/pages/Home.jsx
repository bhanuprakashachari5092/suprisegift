import React from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import Contact from './Contact';

export default function Home({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  handleAddToCart,
  setSelectedProduct
}) {
  const handleExploreClick = () => {
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    const message = "Hi Vishnu, I would like to query about surprise packaging services!";
    window.open(`https://wa.me/919703191369?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Filter and sort catalog
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.inStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low-high') return a.price - b.price;
    if (sortBy === 'price-high-low') return b.price - a.price;
    return 0; // default order
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hero banner */}
      <Hero 
        onExploreClick={handleExploreClick} 
        onContactClick={handleContactClick} 
      />

      {/* Product Shop Section */}
      <section id="catalog-section" style={{ padding: '40px 0 80px 0' }}>
        <div className="container">
          
          {/* Search & Sort Panel */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Search box */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <input 
                type="text" 
                placeholder="Search gifts, bouquets, decorations..." 
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '44px', borderRadius: '30px' }}
              />
              <Search size={18} style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%)',
                color: 'var(--gray-600)'
              }} />
            </div>

            {/* Sort by dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} style={{ color: 'var(--primary-pink)' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-600)' }}>Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{ padding: '6px 16px', width: 'auto', borderRadius: '20px', minWidth: '160px', height: '38px', fontSize: '13px' }}
              >
                <option value="default">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Catalog Listing */}
          {sortedProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              color: 'var(--gray-600)'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No items match your criteria</h3>
              <p style={{ fontSize: '14px' }}>Try exploring other services or clear your search input.</p>
            </div>
          ) : (
            <div className="grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onProductSelect={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <Contact />
    </motion.div>
  );
}
