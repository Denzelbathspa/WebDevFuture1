import { useState, useEffect } from 'react'
import './App.css'
import { motion, AnimatePresence } from 'framer-motion';

// Global Vars
var WhiteColor = "233, 227, 223";
var BlackColor= "0, 0, 0";
var OrangeColor= "255, 122, 48";
var BlueColor= "70, 92, 136";

// Main
function App() {
  const [pageCurrent, setPageCurrent] = useState("HOME");
  const [showCurtain, setShowCurtain] = useState(false);
  const [nextPage, setNextPage] = useState("");

  // Control scrolling based on current page
  useEffect(() => {
    const pagesWithScrolling = ["LEADERBOARDS", "ADMIN"];
    const shouldScroll = pagesWithScrolling.includes(pageCurrent);
    
    if (shouldScroll) {
      // Enable scrolling
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    } else {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [pageCurrent]);

  function pageChanging(PageRequest) {
    setNextPage(PageRequest);
    setShowCurtain(true);
    
    setTimeout(() => {
      setPageCurrent(PageRequest);
      setTimeout(() => {
        setShowCurtain(false);
      }, 100);
    }, 600);
  }

  function getBackgroundColor() {
    switch (pageCurrent) {
      case "LEADERBOARDS": return OrangeColor;
      case "PROFILE": return BlueColor;
      default: return WhiteColor;
    }
  }

  return (
    <div className="App" style={{ backgroundColor: `rgb(${getBackgroundColor()})` }}>
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
        height: '100%',
        transition: 'filter 0.3s ease'
      }}>
        <NavigationBar pageChanging={pageChanging} />
        
        {pageCurrent === "HOME" && <HomePage />}
        {pageCurrent === "LEADERBOARDS" && <LeaderboardsPage />}
        {pageCurrent === "PROFILE" && <ProfilePage />}
        {pageCurrent === "ADMIN" && <AdminPage />}
      </div>
    </div>
  )
}

// ==================== Page Components ==================== //
function HomePage() {
  return (
    <>
      <GameDescription />
      <RobloxLogo />
      <BGRects />
    </>
  );
}

function LeaderboardsPage() {
  return (
    <div style={{ padding: '2rem', color: 'white', minHeight: '150vh' }}>
      <h1>Leaderboards</h1>
      <p>Top Players:</p>
      <div style={{ marginTop: '2rem' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            #{i + 1} Player {i + 1} - Score: {1000 - i * 50}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <>
      <Login />
    </>
  );
}

function AdminPage() {
  return (
    <div style={{ padding: '2rem', color: 'white', minHeight: '150vh' }}>
      <h1>Admin Panel</h1>
      <p>Admin controls and settings...</p>
      <div style={{ marginTop: '2rem' }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            Admin Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== Components ==================== //
// Curtain Component
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

// Navigation Bar
function NavigationBar({ pageChanging }) {
  return (
    <div className="class_NavBar">
      <nav>
          <button onClick={() => pageChanging("HOME")}>HOME</button>
          <button onClick={() => pageChanging("LEADERBOARDS")}>LEADERBOARDS</button>
          <button onClick={() => pageChanging("PROFILE")}>LOGIN</button>
          <button className='class_AdminButton' onClick={() => pageChanging("ADMIN")}>ADMIN PANEL</button>
      </nav>
    </div>
  )
}

// Game Description
function GameDescription() {
  const text = "Sometimes, the simple act of walking can be surprisingly therapeutic. Here, that calm experience is taken to the next level — combining relaxation with fun, competition, and a touch of creativity. Enjoy the scenery, climb the leaderboards, and unwind as you walk your way to victory. Are you ready for a relaxing yet competitive adventure? Come and ";

  const words = text.split(" ");

  return (
    <div className="class_GameDesc">
      <p>
        {words.map((word, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="wordAnimation"
          >
            {word}&nbsp; 
          </span>
        ))}
      <button className="class_PlayNow"><a href='https://www.roblox.com/games/110035627916808/pizza-walk-gaem-BUG-FIXES'>PLAY NOW!</a></button>
      </p>
    </div>
  )
}

// Roblox Logo
function RobloxLogo() {
  return (
    <div className='class_RobloxLogo'>
      <img className='rbx_logo_upper' src='\src\assets\RobloxLogo_Upper.png'></img><br></br>
      <img className='rbx_logo_lower' src='\src\assets\RobloxLogo_Lower.png'></img>
    </div>
  )
}

// Background Rects
function BGRects() {
  return (
    <div className="imple-grid-bg">
      <div className="rect_1"></div>
      <div className="rect_2"></div>
      <div className="rect_3"></div>
      <div className="rect_4"></div>
    </div>
  );
}

// Login Page
function Login() {
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"
  const [formData, setFormData] = useState({
    username: "",
    password: "", 
    email: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "login") {
      console.log("Logging in:", { username: formData.username, password: formData.password });
    } else {
      console.log("Registering:", formData);
    }
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
        <form onSubmit={handleSubmit} className="LoginForm">
          <div className="InputGroup">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
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
            />
          </div>

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
              />
            </div>
          )}

          <button type="submit" className="SubmitButton">
            {activeTab === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App;