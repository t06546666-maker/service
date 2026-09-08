import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './SystemAdminDashboard.css';

export default function SystemAdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'add-professional', 'settings'
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0
  });

  const [usersList, setUsersList] = useState([]);
  const navigate = useNavigate();

  // Settings State
  const [bgImageFile, setBgImageFile] = useState(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState('');

  // Add Professional State
  const [profForm, setProfForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    category: '',
    hourlyRate: '',
    bio: ''
  });
  const [addingProf, setAddingProf] = useState(false);
  const [profStatus, setProfStatus] = useState('');

  const ADMIN_EMAILS = ['admin@gmail.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Try Firestore first
        let isAdmin = false;
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            isAdmin = true;
          }
        } catch (err) {
          console.warn("Firestore check failed, using email fallback:", err.message);
        }

        // Email-based fallback
        if (!isAdmin && ADMIN_EMAILS.includes(currentUser.email)) {
          isAdmin = true;
        }

        if (isAdmin) {
          setUser(currentUser);
          try { await fetchDashboardData(); } catch (e) { console.warn("Could not load dashboard data:", e.message); }
        } else {
          navigate('/');
        }
      } else {
        navigate('/admin');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const usersQuery = await getDocs(collection(db, 'users'));
      let usersCount = 0;
      let profsCount = 0;
      const allUsers = [];

      usersQuery.forEach((docSnap) => {
        const data = docSnap.data();
        allUsers.push({ id: docSnap.id, ...data });
        
        if (data.role === 'professional') {
          profsCount++;
        } else if (data.role === 'user') {
          usersCount++;
        }
      });

      setStats({
        totalUsers: usersCount,
        totalProfessionals: profsCount
      });
      setUsersList(allUsers);
    } catch (error) {
      console.error("Error fetching admin data: ", error);
    }
  };

  const handleBgImageUpload = async (e) => {
    e.preventDefault();
    if (!bgImageFile) return;

    setUploadingBg(true);
    setSettingsStatus('');

    try {
      const imageRef = ref(storage, `settings/hero-bg-${Date.now()}`);
      await uploadBytes(imageRef, bgImageFile);
      const downloadURL = await getDownloadURL(imageRef);

      await setDoc(doc(db, 'settings', 'homepage'), {
        heroBackgroundUrl: downloadURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSettingsStatus('Background image updated successfully!');
      setBgImageFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setSettingsStatus('Error uploading image. Please try again.');
    } finally {
      setUploadingBg(false);
    }
  };

  const handleAddProfessional = async (e) => {
    e.preventDefault();
    setAddingProf(true);
    setProfStatus('');

    try {
      // Use email as a deterministic ID or create a random one
      // We'll create a random doc ID for workers
      const newWorkerRef = doc(collection(db, 'workers'));
      
      await setDoc(newWorkerRef, {
        name: profForm.name,
        email: profForm.email,
        phoneNumber: profForm.phoneNumber,
        category: profForm.category,
        hourlyRate: profForm.hourlyRate,
        bio: profForm.bio,
        portfolioImages: [],
        createdAt: new Date().toISOString()
      });

      // Also create a placeholder user profile so it shows up in users list
      // When the user eventually signs up via Google with this email, they will need
      // to use the same email. To enforce role, we save a placeholder.
      // Firestore doesn't easily allow querying users by email without indexing if we just want to create.
      // We will just let them sign up normally later.

      setProfStatus(`Successfully added ${profForm.name} as a ${profForm.category}!`);
      setProfForm({ name: '', email: '', phoneNumber: '', category: '', hourlyRate: '', bio: '' });
      await fetchDashboardData(); // Refresh counts
    } catch (error) {
      console.error("Error adding professional:", error);
      setProfStatus('Error adding professional. Check permissions.');
    } finally {
      setAddingProf(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading System Admin Dashboard...</div>;
  }

  return (
    <div className="sysadmin-dashboard-layout">
      {/* Sidebar */}
      <div className="sysadmin-sidebar">
        <div className="sysadmin-sidebar-header">
          <h2>System Admin</h2>
          <p>Manage platform, users, and professionals.</p>
        </div>
        
        <div className="sysadmin-nav">
          <button 
            className={`sysadmin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Platform Users
          </button>
          <button 
            className={`sysadmin-nav-btn ${activeTab === 'add-professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('add-professional')}
          >
            Add Professional
          </button>
          <button 
            className={`sysadmin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Platform Settings
          </button>
        </div>

        <div className="sysadmin-sidebar-stats" style={{marginTop: 'auto'}}>
          <div className="stat-card">
            <h3>Total Customers</h3>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <div className="stat-card">
            <h3>Total Professionals</h3>
            <span className="stat-value">{stats.totalProfessionals}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="sysadmin-main-content">
        
        {activeTab === 'users' && (
          <div className="sysadmin-card fade-in">
            <div className="sysadmin-card-header">
              <h1>Platform Users</h1>
              <p>View and manage all registered accounts on the platform.</p>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No users found.</td>
                    </tr>
                  ) : (
                    usersList.map((usr) => (
                      <tr key={usr.id}>
                        <td>{usr.name || `${usr.firstName || ''} ${usr.lastName || ''}`.trim() || 'Unknown'}</td>
                        <td>{usr.email}</td>
                        <td>
                          <span className={`role-badge role-${usr.role}`}>
                            {usr.role || 'user'}
                          </span>
                        </td>
                        <td>{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button className="btn-table-action">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add-professional' && (
          <div className="sysadmin-card fade-in">
            <div className="sysadmin-card-header">
              <h1>Add Professional</h1>
              <p>Manually add a plumber, electrician, or other professional to the database.</p>
            </div>
            
            {profStatus && <div className={`sysadmin-status ${profStatus.includes('Error') ? 'error' : 'success'}`}>{profStatus}</div>}

            <form onSubmit={handleAddProfessional} className="sysadmin-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name *</label>
                  <input type="text" value={profForm.name} onChange={e => setProfForm({...profForm, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Email *</label>
                  <input type="email" value={profForm.email} onChange={e => setProfForm({...profForm, email: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Category *</label>
                  <select value={profForm.category} onChange={e => setProfForm({...profForm, category: e.target.value})} required>
                    <option value="">Select Category</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Home care">Home care</option>
                    <option value="Handcraft">Handcraft</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Phone Number *</label>
                  <input type="tel" value={profForm.phoneNumber} onChange={e => setProfForm({...profForm, phoneNumber: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label>Hourly Rate ($) *</label>
                <input type="number" value={profForm.hourlyRate} onChange={e => setProfForm({...profForm, hourlyRate: e.target.value})} required />
              </div>

              <div className="input-group">
                <label>Bio / Description</label>
                <textarea rows="4" value={profForm.bio} onChange={e => setProfForm({...profForm, bio: e.target.value})}></textarea>
              </div>

              <button type="submit" className="sysadmin-submit-btn" disabled={addingProf}>
                {addingProf ? 'Adding...' : 'Add Professional'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="sysadmin-card fade-in">
            <div className="sysadmin-card-header">
              <h1>Platform Settings</h1>
              <p>Customize the look and feel of your platform.</p>
            </div>

            <div className="settings-section">
              <h3>Homepage Hero Background</h3>
              <p className="settings-desc">Upload a new background image for the main landing page.</p>
              
              {settingsStatus && <div className={`sysadmin-status ${settingsStatus.includes('Error') ? 'error' : 'success'}`}>{settingsStatus}</div>}

              <form onSubmit={handleBgImageUpload} className="sysadmin-form">
                <div className="file-upload-box">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setBgImageFile(e.target.files[0])} 
                    id="bg-upload"
                    className="file-input"
                  />
                  <label htmlFor="bg-upload" className="file-label">
                    {bgImageFile ? bgImageFile.name : 'Choose an image file...'}
                  </label>
                </div>
                
                <button type="submit" className="sysadmin-submit-btn" disabled={!bgImageFile || uploadingBg}>
                  {uploadingBg ? 'Uploading...' : 'Update Background Image'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
