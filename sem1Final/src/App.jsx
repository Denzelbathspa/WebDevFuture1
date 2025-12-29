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

function RobloxLogo() {
  return (
    <div className='class_RobloxLogo'>
      <img className='rbx_logo_upper' src='\src\assets\RobloxLogo_Upper.png'></img><br></br>
      <img className='rbx_logo_lower' src='\src\assets\RobloxLogo_Lower.png'></img>
    </div>
  )
}

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

function Login() {
  const [activeTab, setActiveTab] = useState("login");
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

// LEADERBOARDS
function LeaderboardsComponent() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchLeaderboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!forceRefresh) {
        const cachedData = localStorage.getItem('pizzaWalkLeaderboardData');
        const cachedTimestamp = localStorage.getItem('pizzaWalkLeaderboardTimestamp');
        const isCacheValid = cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < (5 * 60 * 1000);
        
        if (isCacheValid && cachedData) {
          setLeaderboardData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }
      
      if (forceRefresh) {
        localStorage.removeItem('pizzaWalkLeaderboardData');
        localStorage.removeItem('pizzaWalkLeaderboardTimestamp');
      }
      
      console.log('🔄 Fetching leaderboard data...');
      const response = await fetch('http://localhost:3001/api/leaderboards', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Data received:', data._metadata?.source || 'fallback');
      
      const transformedData = transformApiData(data);
      
      setLeaderboardData(transformedData);
      
      localStorage.setItem('pizzaWalkLeaderboardData', JSON.stringify(transformedData));
      localStorage.setItem('pizzaWalkLeaderboardTimestamp', Date.now().toString());
      
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message);
      
      const cachedData = localStorage.getItem('pizzaWalkLeaderboardData');
      if (cachedData) {
        console.log('📦 Using cached data');
        setLeaderboardData(JSON.parse(cachedData));
      } else {
        console.log('⚡ Using fallback data');
        setLeaderboardData(getFallbackData());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered, refreshTrigger:', refreshTrigger);
    fetchLeaderboardData(refreshTrigger > 0);
  }, [refreshTrigger]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh requested');
    setError(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTestConnection = async () => {
    console.log('🔗 Testing server connection...');
    try {
      const response = await fetch('http://localhost:3001/api/test');
      const data = await response.json();
      console.log('Server test:', data);
      handleRefresh();
    } catch (err) {
      console.error('Test failed:', err);
      setError('Server not responding: ' + err.message);
    }
  };

  const transformApiData = (apiData) => {
    console.log('Transforming API data:', apiData);
    
    if (apiData.topRebirths && apiData.topPlaytime) {
      console.log('Data already in correct format');
      return apiData;
    }
    
    if (apiData._metadata) {
      console.log('Data has metadata, using as-is');
      return apiData;
    }
    
    if (apiData.rebirths || apiData.playtime) {
      console.log('Converting old structure to new structure');
      return {
        topRebirths: apiData.rebirths?.map((item, index) => ({
          rank: index + 1,
          username: item.username,
          value: item.rebirthCount || item.value
        })) || [],
        
        topPlaytime: apiData.playtime?.map((item, index) => ({
          rank: index + 1,
          username: item.username,
          value: `${item.minutesPlayed || item.value}m`
        })) || [],
        
        topCompletions: apiData.completions?.map((item, index) => ({
          rank: index + 1,
          username: item.username,
          value: item.completionCount || item.value
        })) || [],
        
        fastest: apiData.fastestTimes?.map((item, index) => ({
          rank: index + 1,
          username: item.username,
          value: item.time || item.value
        })) || []
      };
    }
    
    console.log('No recognizable structure, using fallback');
    return getFallbackData();
  };

  const LeaderboardTable = ({ title, data, category, valueLabel }) => {
    const tableData = data || [];
    
    return (
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
              {tableData.length > 0 ? (
                tableData.map((player, index) => (
                  <tr key={`${category}-${player.rank || index}`} className="table-row">
                    <td className="rank-cell">#{player.rank || index + 1}</td>
                    <td className="username-cell">{player.username || `Player ${index + 1}`}</td>
                    <td className="value-cell">{player.value || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data-cell">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  const getConnectionStatus = () => {
    if (leaderboardData?._metadata) {
      return leaderboardData._metadata.source === 'roblox_api' 
        ? '✅ Connected to Roblox' 
        : '📦 Using fallback data';
    }
    return '⚡ Loading...';
  };

  if (loading && !leaderboardData) {
    return (
      <div className="leaderboards-container">
        <h1 className="leaderboards-title">Leaderboards</h1>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading leaderboards...</p>
          <button onClick={handleRefresh} className="refresh-button">
            Force Refresh
          </button>
        </div>
      </div>
    );
  }

  if (error && !leaderboardData) {
    return (
      <div className="leaderboards-container">
        <h1 className="leaderboards-title">Leaderboards</h1>
        <div className="error-message">
          <p>❌ Error: {error}</p>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleRefresh} className="refresh-button">
              Retry
            </button>
            <button onClick={handleTestConnection} className="refresh-button" style={{ marginLeft: '10px' }}>
              Test Server
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataToDisplay = leaderboardData || getFallbackData();

  return (
    <div className="leaderboards-container">
      <div className="leaderboards-header">
        <h1 className="leaderboards-title">Leaderboards</h1>
        <div className="leaderboards-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleRefresh} 
              className="refresh-button"
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
            
            <button 
              onClick={handleTestConnection}
              className="test-button"
              style={{ padding: '8px 16px', background: '#4a90e2' }}
            >
              Test Connection
            </button>
            
            <div className="connection-status" style={{ fontSize: '0.9rem', color: '#aaa' }}>
              {getConnectionStatus()}
            </div>
            
            {localStorage.getItem('pizzaWalkLeaderboardTimestamp') && (
              <div className="last-updated">
                Updated: {new Date(
                  parseInt(localStorage.getItem('pizzaWalkLeaderboardTimestamp'))
                ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {leaderboardData?._metadata && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Source: <strong>{leaderboardData._metadata.source}</strong></span>
            {leaderboardData._metadata.datastoreCount !== undefined && (
              <span>DataStores: <strong>{leaderboardData._metadata.datastoreCount}</strong></span>
            )}
            {leaderboardData._metadata.connected && (
              <span style={{ color: '#4CAF50' }}>✅ Roblox Connected</span>
            )}
          </div>
        </div>
      )}

      <div className="leaderboards-grid">
        <LeaderboardTable 
          title="Top Rebirths" 
          data={dataToDisplay.topRebirths || []} 
          category="rebirth" 
          valueLabel="Rebirths" 
        />
        
        <LeaderboardTable 
          title="Top Playtime" 
          data={dataToDisplay.topPlaytime || []} 
          category="playtime" 
          valueLabel="Playtime" 
        />
        
        <LeaderboardTable 
          title="Top Completions" 
          data={dataToDisplay.topCompletions || []} 
          category="completions" 
          valueLabel="Completions" 
        />
        
        <LeaderboardTable 
          title="Fastest Times" 
          data={dataToDisplay.fastest || []} 
          category="fastest" 
          valueLabel="Time" 
        />
      </div>
    </div>
  );
}

export default App;
