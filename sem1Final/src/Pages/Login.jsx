import { useState, useEffect, useRef } from 'react'
import '../App.css'

export default function Login({ onLogin, onGoogleLogin, user }) {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "", 
    email: "",
    rememberMe: false
  });
  const [loginStatus, setLoginStatus] = useState(null);

  // If user is already logged in, show profile
  if (user) {
    return (
      <div className="ProfileContainer">
        <div className="ProfileHeader">
          <h2>Welcome Back!</h2>
          <div className="user-profile-card">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="avatar-image" />
              ) : (
                <div className="avatar-large">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{user.username || user.displayName}</h3>
              <p>{user.email}</p>
              <div className="profile-meta">
                <span className="provider-badge">
                  {user.provider === 'google' ? 'Google Account' : 'Local Account'}
                </span>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Leaderboard Rank</div>
              </div>
            </div>
          </div>
          <button className="play-game-button">
            <a href='https://www.roblox.com/games/110035627916808/pizza-walk-gaem-BUG-FIXES'>
              PLAY PIZZA WALK GAEM
            </a>
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginStatus({ type: 'loading', message: 'Processing...' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (activeTab === "login") {
      // Basic validation
      if (!formData.username || !formData.password) {
        setLoginStatus({ type: 'error', message: 'Please fill in all fields' });
        return;
      }
      
      // Simulate successful login
      const userData = {
        id: Date.now(),
        username: formData.username,
        email: formData.username.includes('@') ? formData.username : `${formData.username}@pizzawalk.com`,
        provider: 'local',
        createdAt: new Date().toISOString()
      };
      
      onLogin(userData);
      setLoginStatus({ type: 'success', message: 'Login successful!' });
      
      // Clear form
      setFormData({
        username: "",
        password: "", 
        email: "",
        rememberMe: false
      });
      
    } else {
      // Registration
      if (!formData.username || !formData.password || !formData.email) {
        setLoginStatus({ type: 'error', message: 'Please fill in all fields' });
        return;
      }
      
      const userData = {
        id: Date.now(),
        username: formData.username,
        email: formData.email,
        provider: 'local',
        createdAt: new Date().toISOString()
      };
      
      onLogin(userData);
      setLoginStatus({ type: 'success', message: 'Registration successful!' });
      
      // Clear form
      setFormData({
        username: "",
        password: "", 
        email: "",
        rememberMe: false
      });
    }
  };

  const handleGoogleAuth = async () => {
    setLoginStatus({ type: 'loading', message: 'Connecting to Google...' });
    await onGoogleLogin();
    setLoginStatus({ type: 'success', message: 'Google login successful!' });
  };

  return (
    <div className="LoginContainer">
      <div className="LoginHeader">
        <button 
          className={`LoginButton ${activeTab === "login" ? "active" : "inactive"}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button 
          className={`SignUpButton ${activeTab === "register" ? "active" : "inactive"}`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>
      
      <div className="LoginBox">
        {/* Google Login Button */}
        <div className="google-login-section">
          <button 
            onClick={handleGoogleAuth}
            className="google-login-button"
            disabled={loginStatus?.type === 'loading'}
          >
            <span className="google-icon">G</span>
            Continue with Google
          </button>
          <div className="divider">
            <span>or</span>
          </div>
        </div>
        
        {/* Login Status Message */}
        {loginStatus && (
          <div className={`login-status ${loginStatus.type}`}>
            {loginStatus.message}
            {loginStatus.type === 'loading' && <span className="loading-dots">...</span>}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="LoginForm">
          <div className="InputGroup">
            <label htmlFor="username">
              {activeTab === "login" ? "Username or Email" : "Username"}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={activeTab === "login" ? "Enter username or email" : "Choose a username"}
              required
              disabled={loginStatus?.type === 'loading'}
            />
          </div>

          <div className="InputGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={loginStatus?.type === 'loading'}
              minLength="6"
            />
          </div>

          {activeTab === "login" && (
            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={loginStatus?.type === 'loading'}
                />
                Remember me
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>
          )}

          {activeTab === "register" && (
            <div className="InputGroup">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={loginStatus?.type === 'loading'}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="SubmitButton"
            disabled={loginStatus?.type === 'loading'}
          >
            {loginStatus?.type === 'loading' ? (
              <span className="button-loading">Processing...</span>
            ) : (
              activeTab === "login" ? "Login" : "Register"
            )}
          </button>
        </form>
        
        {/* Terms and Conditions */}
        {activeTab === "register" && (
          <div className="terms-agreement">
            <p>By registering, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
