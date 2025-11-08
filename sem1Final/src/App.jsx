import { useState, useEffect, useRef } from 'react'
import './App.css'
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundManager } from './JS/Leaderboards_BG';

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
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Lock scrolling
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

  function getBackgroundColor() {
    switch (pageCurrent) {
      case "LEADERBOARDS": return AestheticBlack;
      case "PROFILE": return BlueColor;
      default: return WhiteColor;
    }
  }

  // Function to determine if current page is Home
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
        {/* Pass pageCurrent to NavigationBar */}
        <NavigationBar pageChanging={pageChanging} currentPage={pageCurrent} />
        
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
    <>
      <LeaderboardsComponent />
    </>
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
function NavigationBar({ pageChanging, currentPage }) {
  const shouldBeWhite = currentPage === "LEADERBOARDS" || currentPage === "PROFILE";
  
  return (
    <div className={`class_NavBar ${shouldBeWhite ? 'nav-white-text' : ''}`}>
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

// Leaderboards Page
function LeaderboardsComponent() {
  // Replace with API
  const leaderboardData = {
    topRebirths: [
      { rank: 1, username: "ProPlayer1", value: 83 },
      { rank: 2, username: "GameMaster", value: 76 },
      { rank: 3, username: "WalkWarrior", value: 72 },
      { rank: 4, username: "SpeedRunner", value: 68 },
      { rank: 5, username: "CasualGamer", value: 65 },
      { rank: 6, username: "PizzaLover", value: 61 },
      { rank: 7, username: "Walker123", value: 58 },
      { rank: 8, username: "ChillPlayer", value: 55 },
      { rank: 9, username: "NewbiePro", value: 52 },
      { rank: 10, username: "JustWalking", value: 49 }
    ],
    topPlaytime: [
      { rank: 1, username: "TimeMaster", value: "325m" },
      { rank: 2, username: "Dedicated", value: "298m" },
      { rank: 3, username: "AlwaysOn", value: "276m" },
      { rank: 4, username: "Grinder", value: "254m" },
      { rank: 5, username: "Persistent", value: "231m" },
      { rank: 6, username: "Regular", value: "215m" },
      { rank: 7, username: "Frequent", value: "198m" },
      { rank: 8, username: "Occasional", value: "182m" },
      { rank: 9, username: "Casual", value: "167m" },
      { rank: 10, username: "Newcomer", value: "152m" }
    ],
    topCompletions: [
      { rank: 1, username: "Completionist", value: 142 },
      { rank: 2, username: "Finisher", value: 128 },
      { rank: 3, username: "Achiever", value: 115 },
      { rank: 4, username: "Perfectionist", value: 103 },
      { rank: 5, username: "Master", value: 97 },
      { rank: 6, username: "Expert", value: 86 },
      { rank: 7, username: "Skilled", value: 78 },
      { rank: 8, username: "Regular", value: 71 },
      { rank: 9, username: "Amateur", value: 64 },
      { rank: 10, username: "Beginner", value: 58 }
    ],
    fastest: [
      { rank: 1, username: "SpeedDemon", value: "1:24" },
      { rank: 2, username: "QuickSilver", value: "1:31" },
      { rank: 3, username: "Flash", value: "1:37" },
      { rank: 4, username: "Sonic", value: "1:42" },
      { rank: 5, username: "Rapid", value: "1:48" },
      { rank: 6, username: "Swift", value: "1:53" },
      { rank: 7, username: "Fast", value: "1:59" },
      { rank: 8, username: "Quick", value: "2:04" },
      { rank: 9, username: "Brisk", value: "2:11" },
      { rank: 10, username: "Speedy", value: "2:17" }
    ]
  };

  // Reusable table component for each category
  const LeaderboardTable = ({ title, data, category, valueLabel }) => (
    <section className={`leaderboards-section leaderboards-section-${category}`}>
      <h2 className="section-title">{title}</h2>
      <div className={`table-container table-container-${category}`}>
        <table className="leaderboards-table">
          <thead>
            <tr className="table-header">
              <th>Rank</th>
              <th>Username</th>
              <th>{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((player) => (
              <tr key={`${category}-${player.rank}`} className="table-row">
                <td className="rank-cell">#{player.rank}</td>
                <td className="username-cell">{player.username}</td>
                <td className="value-cell">{player.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="leaderboards-container">
      <h1 className="leaderboards-title">Leaderboards</h1>

      <div className="leaderboards-grid">
        <LeaderboardTable 
          title="Top Rebirths" 
          data={leaderboardData.topRebirths} 
          category="rebirth" 
          valueLabel="Rebirths" 
        />
        
        <LeaderboardTable 
          title="Top Playtime" 
          data={leaderboardData.topPlaytime} 
          category="playtime" 
          valueLabel="Playtime" 
        />
        
        <LeaderboardTable 
          title="Top Completions" 
          data={leaderboardData.topCompletions} 
          category="completions" 
          valueLabel="Completions" 
        />
        
        <LeaderboardTable 
          title="Fastest Times" 
          data={leaderboardData.fastest} 
          category="fastest" 
          valueLabel="Time" 
        />
      </div>
    </div>
  );
}

export default App;