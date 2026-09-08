import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './ProfessionalDashboard.css';

export default function ProfessionalDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    category: '',
    bio: '',
    hourlyRate: '',
    portfolioImages: [] // Array of image URLs
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch existing worker profile if they have one
        try {
          const docRef = doc(db, 'workers', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data());
          } else {
            // Pre-fill with user auth data if no worker profile exists yet
            setFormData(prev => ({ ...prev, name: currentUser.displayName || '' }));
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setStatus('Uploading image...');
    try {
      const storageRef = ref(storage, `portfolio/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({
        ...prev,
        portfolioImages: [...(prev.portfolioImages || []), downloadURL]
      }));
      setStatus('Image uploaded successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error("Error uploading image: ", error);
      setStatus('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
      e.target.value = null; // Reset file input
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('Saving profile...');
    
    try {
      // Use the user's UID as the document ID so they update their own profile
      await setDoc(doc(db, "workers", user.uid), {
        ...formData,
        rating: formData.rating || 5.0, // Default rating for new accounts
        reviews: formData.reviews || 0,
        updatedAt: new Date().toISOString()
      });
      setStatus('Profile saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error("Error saving profile: ", error);
      setStatus('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="prof-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="prof-dashboard-layout">
      {/* Sidebar / Left Info */}
      <div className="prof-sidebar">
        <div className="prof-sidebar-header">
          <h2>Professional Dashboard</h2>
          <p>Manage your public profile and showcase your work to homeowners.</p>
        </div>
        
        <div className="prof-sidebar-stats">
          <div className="stat-card">
            <h3>Profile Status</h3>
            <span className="status-badge active">Active</span>
          </div>
        </div>
        
        <div className="prof-sidebar-help">
          <p>Need help optimizing your profile?</p>
          <a href="#">Read our best practices guide &rarr;</a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="prof-main-content">
        <div className="prof-card">
          <div className="prof-card-header">
            <h1>Edit Your Profile</h1>
            <p>This information will be displayed publicly to users looking for your services.</p>
          </div>

          {status && (
            <div className={`prof-status-banner ${status.includes('successfully') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="prof-form">
            <div className="form-row">
              <div className="input-group half">
                <label>Display Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. John's Plumbing" 
                />
              </div>
              <div className="input-group half">
                <label>Contact Phone *</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  required 
                  placeholder="+1 (555) 123-4567" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group half">
                <label>Primary Service Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Landscaper">Landscaper</option>
                  <option value="HVAC">HVAC</option>
                </select>
              </div>
              <div className="input-group half">
                <label>Hourly Rate ($)</label>
                <input 
                  type="number" 
                  name="hourlyRate" 
                  value={formData.hourlyRate} 
                  onChange={handleChange} 
                  placeholder="e.g. 50" 
                />
              </div>
            </div>

            <div className="input-group">
              <label>About You / Bio *</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                required 
                placeholder="Tell customers about your experience, certifications, and what makes your service great..."
                rows="4"
              ></textarea>
            </div>

            <div className="portfolio-section">
              <h3>Portfolio & Past Work</h3>
              <p>Upload images of your past projects to show off your skills.</p>
              
              <div className="portfolio-input-row">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload} 
                  disabled={uploadingImage || !user}
                />
                {uploadingImage && <span style={{marginLeft: '10px'}}>Uploading...</span>}
              </div>

              {formData.portfolioImages && formData.portfolioImages.length > 0 && (
                <div className="portfolio-gallery">
                  {formData.portfolioImages.map((url, index) => (
                    <div key={index} className="portfolio-item">
                      <img src={url} alt={`Portfolio ${index + 1}`} />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="btn-remove-img">&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="prof-submit-container">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Public Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
