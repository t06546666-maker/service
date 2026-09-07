import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import './FeaturedServices.css';

export default function FeaturedServices() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [favorites, setFavorites] = useState(new Set());

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    // Optionally we can use query(collection(db, "workers"), limit(4)) to only show 4 on the homepage
    const q = query(collection(db, "workers"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(workersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching featured services: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const filteredServices = services.filter(svc => activeFilter === 'All' || svc.category === activeFilter);

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
              <div key={svc.id} className="homa-service-card" onClick={() => setSelectedWorker(svc)}>
                <div className="homa-service-img" style={{backgroundImage: `url(${svc.img || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop'})`}}>
                  <button 
                    className="homa-heart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(svc.id);
                    }}
                    style={{ color: favorites.has(svc.id) ? '#ef4444' : 'inherit' }}
                  >
                    {favorites.has(svc.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="homa-service-info">
                  <div className="homa-service-title-row">
                    <h4>{svc.name}</h4>
                    <div className="homa-rating">⭐ {svc.rating || 'New'} <span className="text-muted">({svc.reviews || 0})</span></div>
                  </div>
                  <p className="homa-service-job">{svc.category}</p>
                  <div className="homa-service-bottom">
                    <span className="homa-price text-blue">📞 {svc.phoneNumber}</span>
                    <span className="homa-distance text-muted">📍 {svc.distance || 'Local'}</span>
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

        {selectedWorker && (
          <div className="worker-modal-overlay" onClick={() => setSelectedWorker(null)}>
            <div className="worker-modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setSelectedWorker(null)}>×</button>
              <div className="modal-header">
                <div className="modal-avatar">
                  {selectedWorker.name ? selectedWorker.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2>{selectedWorker.name}</h2>
                  <span className="worker-category">{selectedWorker.category}</span>
                </div>
              </div>
              <div className="modal-body">
                <p><strong>Rating:</strong> ⭐ {selectedWorker.rating || 'New'} ({selectedWorker.reviews || 0} reviews)</p>
                <p><strong>Phone:</strong> {selectedWorker.phoneNumber}</p>
                <button className="homa-view-all-btn" style={{marginTop: '1.5rem', width: '100%'}} onClick={() => {
                  alert(`Booking ${selectedWorker.name}`);
                  setSelectedWorker(null);
                }}>
                  Contact Professional
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}
