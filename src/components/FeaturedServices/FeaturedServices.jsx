import React, { useState } from 'react';
import './FeaturedServices.css';

export default function FeaturedServices() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [favorites, setFavorites] = useState(new Set());

  const services = [
    { id: 1, name: 'Sydie Christ...', job: 'Plumber', rating: 4.8, reviews: 280, price: '$50.00 / hr', distance: '2.4 km', img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop' },
    { id: 2, name: 'Alejandro G.', job: 'Plumber', rating: 4.8, reviews: 30, price: '$35.00 / hr', distance: '12 km', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop' },
    { id: 3, name: 'Yusuf O.', job: 'Home service', rating: 4.9, reviews: 112, price: '$50.00 / hr', distance: '10 km', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop' },
    { id: 4, name: 'Bernard David', job: 'Home service', rating: 4.7, reviews: 140, price: '$40.00 / hr', distance: '5 km', img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop' }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
      } else {
        newFavs.add(id);
      }
      return newFavs;
    });
  };

  const filteredServices = services.filter(svc => activeFilter === 'All' || svc.job === activeFilter);

  const filters = ['All', 'Home service', 'Electricity', 'Handcraft', 'Plumber', 'Mechanic'];

  return (
    <section className="homa-featured">
        <div className="homa-featured-container">
          <h2 className="homa-section-title">Featured Service</h2>
          
          <div className="homa-filter-pills">
            {filters.map(filter => (
              <button 
                key={filter}
                className={`homa-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="homa-services-grid">
            {filteredServices.length > 0 ? filteredServices.map((svc) => (
              <div key={svc.id} className="homa-service-card">
                <div className="homa-service-img" style={{backgroundImage: `url(${svc.img})`}}>
                  <button 
                    className="homa-heart-btn"
                    onClick={() => toggleFavorite(svc.id)}
                    style={{ color: favorites.has(svc.id) ? '#ef4444' : 'inherit' }}
                  >
                    {favorites.has(svc.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="homa-service-info">
                  <div className="homa-service-title-row">
                    <h4>{svc.name}</h4>
                    <div className="homa-rating">⭐ {svc.rating} <span className="text-muted">({svc.reviews})</span></div>
                  </div>
                  <p className="homa-service-job">{svc.job}</p>
                  <div className="homa-service-bottom">
                    <span className="homa-price text-blue">{svc.price}</span>
                    <span className="homa-distance text-muted">📍 {svc.distance}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-muted">No services found for this category.</p>
            )}
          </div>
          
          <div className="text-center">
            <button className="homa-view-all-btn" onClick={() => alert('View all services clicked!')}>View all</button>
          </div>
        </div>
    </section>
  );
}
