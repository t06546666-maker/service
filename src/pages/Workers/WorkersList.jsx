import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './WorkersList.css';

export default function WorkersList() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "workers"));
        const workersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkers(workersData);
      } catch (error) {
        console.error("Error fetching workers: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
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
            <div key={worker.id} className="worker-card">
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
                <button className="book-btn" onClick={() => alert(`Booking ${worker.name}`)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
