import '../App.css'
import { useState, useEffect, useRef } from 'react'

export default function LeaderboardsPage() {
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

  const getFallbackData = () => {
    return {
      topRebirths: [
        { rank: 1, username: "ProWalkerX", value: 892 },
        { rank: 2, username: "PizzaMaster", value: 756 },
        { rank: 3, username: "SpeedDemon", value: 689 },
        { rank: 4, username: "ChillWalker", value: 567 },
        { rank: 5, username: "AFKEnthusiast", value: 456 }
      ],
      topPlaytime: [
        { rank: 1, username: "ChillWalker", value: "1245h" },
        { rank: 2, username: "ProWalkerX", value: "987h" },
        { rank: 3, username: "PizzaMaster", value: "856h" },
        { rank: 4, username: "SpeedDemon", value: "789h" },
        { rank: 5, username: "AFKEnthusiast", value: "654h" }
      ],
      topCompletions: [
        { rank: 1, username: "ProWalkerX", value: 1256 },
        { rank: 2, username: "SpeedDemon", value: 987 },
        { rank: 3, username: "PizzaMaster", value: 856 },
        { rank: 4, username: "ChillWalker", value: 745 },
        { rank: 5, username: "CompletionsKing", value: 632 }
      ],
      fastest: [
        { rank: 1, username: "SpeedDemon", value: "01:45" },
        { rank: 2, username: "ProWalkerX", value: "01:52" },
        { rank: 3, username: "QuickFinish", value: "01:58" },
        { rank: 4, username: "PizzaMaster", value: "02:05" },
        { rank: 5, username: "FastWalker", value: "02:12" }
      ],
      _metadata: {
        source: 'fallback',
        timestamp: new Date().toISOString(),
        connected: false
      }
    };
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