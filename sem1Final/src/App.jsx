import { useState, useEffect, useRef } from 'react'
import './App.css'
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundManager } from './JS/Leaderboards_BG';

// Import the files
import HomePage from './Pages/Home';
import LeaderboardsPage from './Pages/Leaderboards';
import AdminPage from './Pages/Admin';
import Login from './Pages/Login';

// Global Vars
var WhiteColor = "233, 227, 223";
var BlackColor= "0, 0, 0";
var AestheticBlack= "36, 36, 36";
var OrangeColor= "255, 122, 48";
var BlueColor= "70, 92, 136";

// Main
function App() {
  const [pageCurrent, setPageCurrent] = useState("HOME");
  const [showCurtain, setShowCurtain] = useState(false);
  const [nextPage, setNextPage] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // User Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pizzaWalkUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Leaderboard Custom Background
  const backgroundManagerRef = useRef(null);

  useEffect(() => {
    const isLeaderboards = pageCurrent === "LEADERBOARDS";
    
    if (isLeaderboards && !backgroundManagerRef.current) {
      backgroundManagerRef.current = new BackgroundManager('app-container');
      backgroundManagerRef.current.init();
    } else if (!isLeaderboards && backgroundManagerRef.current) {
      backgroundManagerRef.current.destroy();
      backgroundManagerRef.current = null;
    }

    return () => {
      if (backgroundManagerRef.current) {
        backgroundManagerRef.current.destroy();
        backgroundManagerRef.current = null;
      }
    };
  }, [pageCurrent]);

  // Scroll Controls
  useEffect(() => {
    if (isTransitioning || showCurtain) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return;
    }

    const pagesWithScrolling = ["LEADERBOARDS", "ADMIN"];
    const shouldScroll = pagesWithScrolling.includes(pageCurrent);
    
    if (shouldScroll) {
      document.body.style.overflow = 'vertical';
      document.documentElement.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [pageCurrent, showCurtain, isTransitioning]);

  function pageChanging(PageRequest) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    setNextPage(PageRequest);
    setShowCurtain(true);
    
    setTimeout(() => {
      setPageCurrent(PageRequest);
      setTimeout(() => {
        setShowCurtain(false);
      }, 100);
    }, 600);
  }

  // Authentication Functions
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('pizzaWalkUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pizzaWalkUser');
    pageChanging("HOME");
  };

  function getBackgroundColor() {
    switch (pageCurrent) {
      case "LEADERBOARDS": return AestheticBlack;
      case "PROFILE": return BlueColor;
      default: return WhiteColor;
    }
  }

  const isHomePage = pageCurrent === "HOME";

  return (
    <div className="App"
      id="app-container"
      style={{ 
        backgroundColor: `rgb(${getBackgroundColor()})`,
        height: isHomePage ? '100vh' : 'auto',
        overflow: isHomePage ? 'hidden' : 'visible'
      }}
      >
      <AnimatePresence mode="wait">
        {showCurtain && (
          <Curtain 
            onCloseComplete={() => setPageCurrent(nextPage)}
            onOpenComplete={() => setShowCurtain(false)}
            key="curtain"
          />
        )}
      </AnimatePresence>

      <div style={{ 
        width: '100%', 
        height: isHomePage ? '100%' : 'auto',
        transition: 'filter 0.3s ease'
      }}>
        <NavigationBar 
          pageChanging={pageChanging} 
          currentPage={pageCurrent} 
          user={user}
          onLogout={handleLogout}
        />
        
        {pageCurrent === "HOME" && <HomePage />}
        {pageCurrent === "LEADERBOARDS" && <LeaderboardsPage />}
        {pageCurrent === "PROFILE" && (
          <ProfilePage 
            onLogin={handleLogin}
            user={user}
          />
        )}
        {pageCurrent === "ADMIN" && <AdminPage />}
      </div>
    </div>
  )
}


// ==================== Components ==================== //
function Curtain({ onCloseComplete, onOpenComplete }) {
  return (
    <div className="curtain-container">
      <motion.div
        className="curtain"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        exit={{ scaleY: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        onAnimationComplete={(definition) => {
          if (definition === "animate") {
            onCloseComplete?.();
            setTimeout(() => {
              onOpenComplete?.();
            }, 300);
          }
        }}
      />
    </div>
  )
}

// NavigationBar
function NavigationBar({ pageChanging, currentPage, user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const shouldBeWhite = currentPage === "LEADERBOARDS" || currentPage === "PROFILE";
  
  // Check if user is admin
  console.log(user);
  const isAdmin = user && user.admin === true;

  const handleUserClick = () => {
    if (user) {
      setShowDropdown(!showDropdown);
    } else {
      pageChanging("PROFILE");
    }
  };

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.user-menu-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className={`class_NavBar ${shouldBeWhite ? 'nav-white-text' : ''}`}>
      <nav>
        <button onClick={() => pageChanging("HOME")}>HOME</button>
        <button onClick={() => pageChanging("LEADERBOARDS")}>LEADERBOARDS</button>
        
        <div className={`user-menu-container ${showDropdown ? 'active' : ''}`}>
          <button 
            onClick={handleUserClick}
            className="user-button"
          >
            {user ? user.username || user.displayName : "LOGIN"}
          </button>
          
          {user && (
            <div 
              className="user-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dropdown-header">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username || user.displayName}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="logout-button">
                <span className="logout-icon">↪</span>
                Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Only show Admin button if user is admin */}
        {true && (
          <button className='class_AdminButton' onClick={() => pageChanging("ADMIN")}>
            ADMIN PANEL
          </button>
        )}
      </nav>
    </div>
  )
}

// Helper Functions
function ProfilePage({ onLogin, onGoogleLogin, user }) {
  return (
    <>
      <Login 
        onLogin={onLogin} 
        onGoogleLogin={onGoogleLogin}
        user={user}
      />
    </>
  );
}

export default App;
