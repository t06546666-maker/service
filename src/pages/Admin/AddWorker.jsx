import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './AddWorker.css';

export default function AddWorker() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    category: '',
    rating: '',
    reviews: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    
    try {
      await addDoc(collection(db, "workers"), {
        ...formData,
        rating: Number(formData.rating),
        reviews: Number(formData.reviews)
      });
      setStatus('Success! Worker added.');
      setFormData({ name: '', phoneNumber: '', category: '', rating: '', reviews: '' });
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error("Error adding worker: ", error);
      setStatus('Error adding worker. Please try again.');
    }
  };

  return (
    <div className="add-worker-container">
      <div className="add-worker-card">
        <h2>Add New Worker</h2>
        <p>Enter the professional's details below to add them to the directory.</p>
        
        {status && <div className={`status-message ${status.includes('Success') ? 'success' : (status === 'Submitting...' ? 'info' : 'error')}`}>{status}</div>}
        
        <form onSubmit={handleSubmit} className="add-worker-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe" />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="e.g. +1 234 567 8900" />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Rating (Out of 5)</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange} required placeholder="4.8" />
            </div>
            
            <div className="form-group half">
              <label>Number of Reviews</label>
              <input type="number" min="0" name="reviews" value={formData.reviews} onChange={handleChange} required placeholder="124" />
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={status === 'Submitting...'}>
            {status === 'Submitting...' ? 'Adding...' : 'Add Worker'}
          </button>
        </form>
      </div>
    </div>
  );
}
