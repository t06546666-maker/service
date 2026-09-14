import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase';
import './Auth.css'; // Shared CSS for both Login and SignUp

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // OTP State
  const [useOtp, setUseOtp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();

  const handleRoleRedirect = async (user, defaultName = 'User') => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'professional') {
          navigate('/professional');
        } else {
          navigate('/');
        }
      } else {
        await setDoc(userDocRef, {
          name: user.displayName || defaultName,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: 'user',
          createdAt: new Date().toISOString()
        });
        navigate('/');
      }
    } catch (dbErr) {
      console.warn("Could not fetch role from Firestore, redirecting home:", dbErr);
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRoleRedirect(userCredential.user, userCredential.user.email?.split('@')[0]);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed: ' + err.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleRoleRedirect(result.user, 'Google User');
    } catch (err) {
      console.error("Google Login error:", err);
      setError('Google Sign-In failed: ' + err.message);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setError('');
    setIsProcessing(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Fixed +91 Indian country code
      const formattedPhone = `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationId(confirmationResult);
      setOtpSent(true);
    } catch (err) {
      console.error("Error sending OTP", err);
      setError(`Failed to send OTP: ${err.message}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setError('');
    setIsProcessing(true);
    try {
      const result = await verificationId.confirm(otpCode);
      await handleRoleRedirect(result.user, 'Phone User');
    } catch (err) {
      console.error("Error verifying OTP", err);
      setError("Invalid OTP code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>{useOtp ? 'Phone Verification' : 'Sign In'}</h1>
            <p>{useOtp ? 'Enter your phone number to receive a secure OTP code' : 'Welcome back! Please enter your details to continue'}</p>
          </div>

          {!useOtp && (
            <>
              <div className="social-login">
                <button className="social-btn" onClick={handleGoogleLogin}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                  Sign in with Google
                </button>
                <button className="social-btn" onClick={() => setUseOtp(true)}>
                  <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>📱</span>
                  Sign in with Phone (OTP)
                </button>
                <button className="social-btn" onClick={() => alert("Apple login not configured yet")}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
                  Sign in with Apple
                </button>
              </div>

              <div className="auth-divider">
                <span>Or</span>
              </div>
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          {useOtp ? (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="input-group">
                  <label>Phone Number *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📱</span>
                    <span style={{ position: 'absolute', left: '2.5rem', color: '#1e293b', fontWeight: 500, fontSize: '0.95rem' }}>+91</span>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210" 
                      required 
                      style={{ paddingLeft: '4.5rem' }}
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                <button type="submit" className="auth-submit-btn" disabled={isProcessing}>
                  {isProcessing ? 'Sending...' : 'Send OTP'}
                </button>
                <p className="auth-footer-text">
                  <a href="#" onClick={(e) => { e.preventDefault(); setUseOtp(false); }}>Back to Email Login</a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="input-group">
                  <label>Verification Code *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔢</span>
                    <input 
                      type="text" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={isProcessing}>
                  {isProcessing ? 'Verifying...' : 'Verify & Login'}
                </button>
                <p className="auth-footer-text">
                  <a href="#" onClick={(e) => { e.preventDefault(); setOtpSent(false); }}>Use a different number</a>
                </p>
              </form>
            )
          ) : (
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
                  <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert("Email password reset not configured yet. Please try signing in with your Phone."); }}>
                    Forgot password?
                  </a>
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

              <button type="submit" className="auth-submit-btn" disabled={isProcessing}>
                {isProcessing ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {!useOtp && (
            <p className="auth-footer-text">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          )}
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
