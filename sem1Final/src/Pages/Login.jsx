import { useState, useEffect } from 'react'
import '../App.css'

export default function Login({ onLogin, user }) {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "", 
    email: "",
    rememberMe: false
  });
  const [loginStatus, setLoginStatus] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch all users when component mounts or activeTab changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const PORT = import.meta.env.MONGO_PORT || 5000;
        const response = await fetch(`http://localhost:${PORT}/api/users`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        setAllUsers(users);
        console.log('Fetched users:', users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoginStatus({ 
          type: 'error', 
          message: 'Cannot connect to server. Make sure backend is running.' 
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

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
                  {(user.username || user.name)?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{user.username || user.name || user.displayName}</h3>
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
    
    try {
      if (activeTab === "login") {
        // ================= LOGIN LOGIC =================
        // Basic validation
        if (!formData.username || !formData.password) {
          setLoginStatus({ type: 'error', message: 'Please fill in all fields' });
          return;
        }
        
        // Check if user exists in the fetched users
        const foundUser = allUsers.find(user => 
          (user.name === formData.username || user.email === formData.username)
        );
        
        if (!foundUser) {
          setLoginStatus({ type: 'error', message: 'User not found' });
          return;
        }
        
        // Check password
        if (foundUser.password !== formData.password) {
          setLoginStatus({ type: 'error', message: 'Incorrect password' });
          return;
        }
        
        // Login successful
        onLogin({
          _id: foundUser._id,
          username: foundUser.name,
          email: foundUser.email,
          createdAt: foundUser.createdAt,
          provider: 'local'
        });
        
        setLoginStatus({ type: 'success', message: 'Login successful!' });
        
        // Clear form
        setFormData({
          username: "",
          password: "", 
          email: "",
          rememberMe: false
        });
        
      } else {
        // ================= REGISTRATION LOGIC =================
        // Basic validation
        if (!formData.username || !formData.password || !formData.email) {
          setLoginStatus({ type: 'error', message: 'Please fill in all fields' });
          return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setLoginStatus({ type: 'error', message: 'Please enter a valid email address' });
          return;
        }
        
        // Password validation
        if (formData.password.length < 6) {
          setLoginStatus({ type: 'error', message: 'Password must be at least 6 characters' });
          return;
        }
        
        // Check if username already exists
        const usernameExists = allUsers.some(user => 
          user.name.toLowerCase() === formData.username.toLowerCase()
        );
        
        if (usernameExists) {
          setLoginStatus({ type: 'error', message: 'Username already taken' });
          return;
        }
        
        // Check if email already exists
        const emailExists = allUsers.some(user => 
          user.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (emailExists) {
          setLoginStatus({ type: 'error', message: 'Email already registered' });
          return;
        }
        
        // Create new user via POST request with password
        const PORT = import.meta.env.MONGO_PORT || 5000;
        const response = await fetch(`http://localhost:${PORT}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            password: formData.password
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Registration failed');
        }
        
        const newUser = await response.json();
        
        // Update local users list
        setAllUsers(prev => [...prev, newUser]);
        
        // Automatically log in the newly registered user
        onLogin({
          _id: newUser._id,
          username: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
          provider: 'local'
        });
        
        setLoginStatus({ type: 'success', message: 'Registration successful!' });
        
        // Clear form
        setFormData({
          username: "",
          password: "", 
          email: "",
          rememberMe: false
        });
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setLoginStatus({ 
        type: 'error', 
        message: error.message || 'Something went wrong. Please try again.' 
      });
    }
  };

  return (
    <div className="LoginContainer">
      <div className="LoginHeader">
        <button 
          className={`LoginButton ${activeTab === "login" ? "active" : "inactive"}`}
          onClick={() => setActiveTab("login")}
          disabled={isLoadingUsers}
        >
          Login
        </button>
        <button 
          className={`SignUpButton ${activeTab === "register" ? "active" : "inactive"}`}
          onClick={() => setActiveTab("register")}
          disabled={isLoadingUsers}
        >
          Register
        </button>
      </div>
      
      <div className="LoginBox">
        {/* Connection Status */}
        {isLoadingUsers && (
          <div className="connection-status">
            🔄 Connecting to database...
          </div>
        )}
        
        {/* Login Status Message */}
        {loginStatus && (
          <div className={`login-status ${loginStatus.type}`}>
            {loginStatus.message}
            {loginStatus.type === 'loading' && <span className="loading-dots">...</span>}
            {loginStatus.type === 'error' && (
              <button 
                className="retry-button"
                onClick={() => {
                  setLoginStatus(null);
                  // Refresh users list
                  window.location.reload();
                }}
                style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 8px' }}
              >
                Retry
              </button>
            )}
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
              disabled={loginStatus?.type === 'loading' || isLoadingUsers}
              autoComplete="username"
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
              disabled={loginStatus?.type === 'loading' || isLoadingUsers}
              minLength="6"
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
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
                  disabled={loginStatus?.type === 'loading' || isLoadingUsers}
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
                disabled={loginStatus?.type === 'loading' || isLoadingUsers}
                autoComplete="email"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="SubmitButton"
            disabled={loginStatus?.type === 'loading' || isLoadingUsers}
          >
            {loginStatus?.type === 'loading' || isLoadingUsers ? (
              <span className="button-loading">Processing...</span>
            ) : (
              activeTab === "login" ? "Login" : "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}