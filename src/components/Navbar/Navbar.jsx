import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function Navbar() {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const ADMIN_EMAILS = ['admin@gmail.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Try Firestore first for role
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            return;
          }
        } catch (error) {
          console.warn("Firestore unavailable, using email fallback:", error.message);
        }
        // Fallback: determine role from email
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'user';
        setUserProfile({ name: user.displayName || user.email, email: user.email, role });
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="homa-navbar">
        <div className="homa-nav-container">
          <div className="homa-logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
              <img src="/logo.png" alt="KL09 Home Service Logo" style={{ height: '50px', objectFit: 'contain' }} />
              <span>KL09 Home Service</span>
            </Link>
          </div>
          <div className="homa-nav-links">
            <Link to="/">Home</Link>
            <Link to="/workers">Our Professionals</Link>
            {userProfile?.role === 'professional' && (
              <Link to="/professional">Professional Dashboard</Link>
            )}
            {userProfile?.role === 'admin' && (
              <Link to="/admin-dashboard">System Admin</Link>
            )}
            <Link to="#" onClick={(e) => { e.preventDefault(); alert('FAQ clicked'); }}>FAQ</Link>
          </div>
          <div className="homa-nav-auth">
            {userProfile ? (
              <div className="homa-profile-section">
                <span className="homa-greeting">Hello, {userProfile.name ? userProfile.name.split(' ')[0] : 'User'}</span>
                <button className="homa-btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                <button className="homa-btn-login" onClick={() => navigate('/login')}>Login</button>
                <button className="homa-btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
    </nav>
  );
}
