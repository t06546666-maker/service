import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
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
            <Link to="/admin">Admin</Link>
            <Link to="#" onClick={(e) => { e.preventDefault(); alert('FAQ clicked'); }}>FAQ</Link>
          </div>
          <div className="homa-nav-auth">
            <button className="homa-btn-login" onClick={() => alert('Login modal opened')}>Login</button>
            <button className="homa-btn-signup" onClick={() => alert('Sign Up modal opened')}>Sign Up</button>
          </div>
        </div>
    </nav>
  );
}
