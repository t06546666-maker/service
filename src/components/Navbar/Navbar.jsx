import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="homa-navbar">
        <div className="homa-nav-container">
          <div className="homa-logo">
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
              <img src="/logo.png" alt="KL09 Home Service Logo" style={{ height: '50px', objectFit: 'contain' }} />
              <span>KL09 Home Service</span>
            </a>
          </div>
          <div className="homa-nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Explore clicked'); }}>Explore</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Support clicked'); }}>Support</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('FAQ clicked'); }}>FAQ</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Blog clicked'); }}>Blog</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Become a Partner clicked'); }}>Become a Partner</a>
          </div>
          <div className="homa-nav-auth">
            <button className="homa-btn-login" onClick={() => alert('Login modal opened')}>Login</button>
            <button className="homa-btn-signup" onClick={() => alert('Sign Up modal opened')}>Sign Up</button>
          </div>
        </div>
    </nav>
  );
}
