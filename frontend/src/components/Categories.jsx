import React from 'react';

export default function Categories({ selectedCategory, onSelectCategory }) {
  const categoriesList = [
    {
      id: "all",
      name: "All Collections",
      subtitle: "Full Storefront",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "Gift wrapping and gift",
      name: "Gifts & Wrapping",
      subtitle: "Premium wrapping & combos",
      image: "https://images.unsplash.com/photo-1576016770956-debb63d90029?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "Balloon bouquets",
      name: "Balloon Bouquets",
      subtitle: "Custom helium clusters",
      image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "Flower bouquets",
      name: "Flower Bouquets",
      subtitle: "Fresh luxury roses & carnations",
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "Birthday balloon decoration",
      name: "Birthday Balloon Decors",
      subtitle: "Grand home setups & arches",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600&auto=format&fit=crop"
    }
  ];

  return (
    <section id="categories" style={{ padding: '60px 0 20px 0' }}>
      <div className="container">
        <div className="section-title">
          <h2>Our Exquisite Services</h2>
          <p>Hand-crafted combinations of flowers, balloons, and customized luxury gift wraps designed to make your celebrations unforgettable.</p>
        </div>

        {/* Categories Grid wrapper */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '20px',
          scrollbarWidth: 'thin',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }} className="categories-scroller">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '180px',
                  height: '110px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: isSelected ? '0 0 0 3px var(--primary-pink), var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'var(--transition-smooth)',
                  transform: isSelected ? 'scale(1.05)' : 'none'
                }} className="category-item-card">
                  {/* Category Card Image */}
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.6)'
                    }} 
                  />
                  {/* Category Overlay Content */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px',
                    textAlign: 'center',
                    color: 'var(--white)',
                    zIndex: 2
                  }}>
                    <h3 style={{
                      color: 'var(--white)',
                      fontSize: '14px',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      margin: 0
                    }}>
                      {cat.name}
                    </h3>
                    <span style={{
                      fontSize: '9px',
                      color: 'var(--light-pink)',
                      marginTop: '4px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {cat.subtitle}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .categories-scroller {
            justify-content: flex-start !important;
            flex-wrap: nowrap !important;
            padding: 0 4px 16px 4px;
          }
          .category-item-card {
            width: 150px !important;
            height: 95px !important;
          }
        }
      `}} />
    </section>
  );
}
