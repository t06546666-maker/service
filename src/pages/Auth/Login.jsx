import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './Auth.css'; // Shared CSS for both Login and SignUp

export default function Login() {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect based on role or just to home
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Sign In</h1>
            <p>Welcome back! Please enter your details to continue</p>
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
            <button className="social-btn" onClick={() => alert("Google login not configured yet")}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              Sign in with Google
            </button>
            <button className="social-btn" onClick={() => alert("Apple login not configured yet")}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              Sign in with Apple
            </button>
          </div>

          <div className="auth-divider">
            <span>Or</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
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
              <div className="label-row">
                <label>Password *</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">Sign in</button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop')" }}>
        <div className="testimonial-box">
          <div className="quote-icon">“</div>
          <p className="testimonial-text">
            Seamless booking experience! The app makes finding and reserving professionals so easy. 
            I loved the instant confirmation and personalized recommendations. Definitely my go-to for all future needs.
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
