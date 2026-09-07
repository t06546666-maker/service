import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './SignUp.css'; 

export default function SignUp() {
  const [role, setRole] = useState('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!termsAccepted) {
      setError('You must agree to the Terms of Use to continue.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // In a real app, we would also save the firstName, lastName, phone, and role 
      // into a Firestore "users" or "professionals" collection here.
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error creating account.');
    }
  };

  return (
    <div className="signup-layout">
      {/* Left Information Panel */}
      <div className="signup-left">
        <div className="signup-left-top">
          <div className="signup-brand">
            <h2>Create your KL09 account</h2>
          </div>
          
          <div className="signup-features">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <p>Find trusted professionals instantly for any home service need.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <p>Manage your bookings and view service history seamlessly.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <p>Secure payments and verified professional reviews.</p>
            </div>
          </div>
          
          <div className="signup-help">
            Need help? <Link to="#">Our FAQ can help</Link>
          </div>
        </div>
        
        <div className="signup-left-bottom">
          <h3>These businesses trust our network.</h3>
          <div className="trust-logos">
            <div className="trust-logo">Partner 1</div>
            <div className="trust-logo">Partner 2</div>
            <div className="trust-logo">Partner 3</div>
            <div className="trust-logo">Partner 4</div>
          </div>
        </div>
      </div>

      {/* Right Overlapping Form Card */}
      <div className="signup-right-container">
        <div className="signup-card">
          <div className="signup-card-header">
            <h1>Sign up for a KL09 ID</h1>
            <p>Already have a KL09 account? <Link to="/login">Sign in</Link></p>
          </div>

          {error && <div className="signup-error">{error}</div>}

          <form onSubmit={handleSignUp} className="signup-form">
            <div className="form-group full-width">
              <label>Email *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>First Name *</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group half-width">
                <label>Last Name *</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>

            <div className="form-group full-width">
              <label>I am registering as a... *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="user">User / Homeowner</option>
                <option value="admin">Service Professional</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Create Password *</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength="6"
              />
            </div>

            <div className="terms-group">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">
                I have read and agree to the <Link to="#">Terms of Use</Link> and understand that my personal information is processed in accordance with the <Link to="#">Privacy Statement</Link>.
              </label>
            </div>

            <div className="submit-container">
              <button type="submit" className="signup-submit-btn">Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
