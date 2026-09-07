import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './WorkersList.css';

export default function WorkersList() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "workers"), (querySnapshot) => {
      const workersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkers(workersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workers: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="workers-container"><div className="loading-spinner">Loading workers...</div></div>;
  }

  return (
    <div className="workers-container">
      <div className="workers-header">
        <h1>Our Professionals</h1>
        <p>Find trusted experts for all your home needs.</p>
      </div>
      
      {workers.length === 0 ? (
        <div className="no-workers">No professionals found. Please check back later.</div>
      ) : (
        <div className="workers-grid">
          {workers.map(worker => (
            <div key={worker.id} className="worker-card" onClick={() => setSelectedWorker(worker)}>
              <div className="worker-avatar">
                {worker.name ? worker.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="worker-info">
                <h3>{worker.name}</h3>
                <span className="worker-category">{worker.category}</span>
                <div className="worker-rating">
                  ⭐ {worker.rating || 'No ratings yet'} {worker.reviews ? `(${worker.reviews} reviews)` : ''}
                </div>
                <div className="worker-contact">
                  📞 {worker.phoneNumber}
                </div>
                <button className="book-btn" onClick={(e) => {
                  e.stopPropagation();
                  alert(`Booking ${worker.name}`);
                }}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
              <p><strong>Rating:</strong> ⭐ {selectedWorker.rating || 'No ratings yet'} ({selectedWorker.reviews || 0} reviews)</p>
              <p><strong>Phone:</strong> {selectedWorker.phoneNumber}</p>
              {/* Future fields can be added here */}
              <button className="book-btn modal-book-btn" onClick={() => {
                alert(`Booking ${selectedWorker.name}`);
                setSelectedWorker(null);
              }}>
                Contact Professional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
