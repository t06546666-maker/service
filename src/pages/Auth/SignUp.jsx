import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './Auth.css'; 

export default function SignUp() {
  const [role, setRole] = useState('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional customer details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phoneNumber: phone,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Redirect based on role or just to home
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Error creating account. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Welcome! Please enter your details to register</p>
          </div>

          <div className="role-selector">
            <label className="radio-label">
              <input 
                type="radio" 
                checked={role === 'user'} 
                onChange={() => setRole('user')} 
              />
              <span className="radio-custom"></span>
              As a User
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                checked={role === 'admin'} 
                onChange={() => setRole('admin')} 
              />
              <span className="radio-custom"></span>
              As a Professional
            </label>
          </div>

          <div className="social-login">
            <button className="social-btn" onClick={() => alert("Google signup not configured yet")}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
              Sign up with Google
            </button>
            <button className="social-btn" onClick={() => alert("Apple signup not configured yet")}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              Sign up with Apple
            </button>
          </div>

          <div className="auth-divider">
            <span>Or</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-row">
              <div className="input-group">
                <label>First Name *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane" 
                    required 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Last Name *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number *</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567" 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email *</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Create Password *</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password" 
                  required 
                  minLength="6"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password *</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password" 
                  required 
                  minLength="6"
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">Sign up</button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop')" }}>
        <div className="testimonial-box">
          <div className="quote-icon">“</div>
          <p className="testimonial-text">
            Joining this platform was the best decision! It's incredibly intuitive and gives me access to top-tier professionals instantly.
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">J</div>
            <div className="author-info">
              <h4>Jane Mitchell</h4>
              <span>Customer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
