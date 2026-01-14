import '../App.css'
import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChart, setActiveChart] = useState('visits');
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActionStatus, setUserActionStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const mockStats = generateMockStats();
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats(mockStats);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setStats(generateMockStats());
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    fetchAllUsers();
  }, [timeRange]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:5069/api/users');
      const data = await response.json();
      console.log("API Response:", data);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const generateMockStats = () => {
    const baseVisits = 5110;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    return {
      gameInfo: {
        name: "Pizza Walk Gaem [BUG FIXES]",
        activePlayers: Math.floor(Math.random() * 12),
        favorites: 21,
        visits: 5110,
        maxPlayers: 12,
        created: "2025-08-14",
        updated: "2025-12-28"
      },
      metrics: {
        visits: {
          current: baseVisits,
          change: "+12.5%",
          daily: Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            const change = Math.floor(Math.random() * 100) + 50;
            return {
              date: date.toISOString().split('T')[0],
              value: baseVisits - (days - i - 1) * 20 + change
            };
          })
        },
        activePlayers: {
          current: Math.floor(Math.random() * 12),
          peak: 24,
          average: 8,
          hourly: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            players: Math.floor(Math.random() * 20)
          }))
        },
        revenue: {
          totalRobux: 8560,
          today: 245,
          topItems: [
            { name: "Golden Pizza Hat", sales: 125, revenue: 3125 },
            { name: "Speed Boost", sales: 89, revenue: 1780 },
            { name: "Custom Trail", sales: 67, revenue: 1340 },
            { name: "Double Rewards", sales: 45, revenue: 900 },
            { name: "Premium Skin", sales: 32, revenue: 800 }
          ]
        },
        retention: {
          day1: "68%",
          day7: "42%",
          day30: "18%",
          sessionDuration: "47 minutes"
        },
        attentionSpan: {
          average: "12.4 minutes",
          median: "8.7 minutes",
          engagement: "High"
        }
      },
      purchases: Array.from({ length: 15 }, (_, i) => {
        const items = ["Golden Pizza Hat", "Speed Boost", "Custom Trail", "Double Rewards", "Premium Skin", "VIP Pass"];
        const players = ["ProWalkerX", "PizzaMaster", "SpeedDemon", "ChillWalker", "AFKEnthusiast", "WalkKing", "PizzaQueen"];
        const randomDate = new Date();
        randomDate.setHours(randomDate.getHours() - Math.floor(Math.random() * 48));
        
        return {
          id: i + 1,
          player: players[Math.floor(Math.random() * players.length)],
          item: items[Math.floor(Math.random() * items.length)],
          amount: Math.floor(Math.random() * 30) + 10,
          time: randomDate.toISOString().replace('T', ' ').substring(0, 16)
        };
      }).sort((a, b) => new Date(b.time) - new Date(a.time)),
      errors: Array.from({ length: 10 }, (_, i) => {
        const errorTypes = [
          { type: "Script Error", message: "Rebirth counter not incrementing" },
          { type: "Network Issue", message: "High latency on server" },
          { type: "DataStore", message: "Failed to save player data" },
          { type: "UI Bug", message: "Leaderboard not updating" },
          { type: "Audio Error", message: "Background music looping" }
        ];
        const randomDate = new Date();
        randomDate.setMinutes(randomDate.getMinutes() - Math.floor(Math.random() * 1440));
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        return {
          id: i + 1,
          type: errorType.type,
          message: errorType.message,
          time: randomDate.toISOString().replace('T', ' ').substring(0, 16),
          playersAffected: Math.floor(Math.random() * 15) + 1
        };
      }).sort((a, b) => new Date(b.time) - new Date(a.time)),
      playerActivity: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          visits: Math.floor(Math.random() * 100) + 50,
          activePlayers: Math.floor(Math.random() * 15) + 5,
          revenue: Math.floor(Math.random() * 100) + 20,
          errors: Math.floor(Math.random() * 5)
        };
      }),
      leaderboardSummary: {
        topPlayers: [
          { rank: 1, username: "ProWalkerX", reborns: 892, playtime: "1245h" },
          { rank: 2, username: "PizzaMaster", reborns: 756, playtime: "987h" },
          { rank: 3, username: "SpeedDemon", reborns: 689, playtime: "856h" },
          { rank: 4, username: "ChillWalker", reborns: 567, playtime: "1245h" },
          { rank: 5, username: "AFKEnthusiast", reborns: 456, playtime: "789h" }
        ],
        dailyCompletion: "1,245",
        averageScore: "8,567",
        highestScore: "15,892"
      }
    };
  };

  const toggleAdminStatus = async (userId) => {
    try {
      setUserActionStatus({ type: 'loading', message: 'Updating admin status...' });
      const userToUpdate = users.find(user => user._id === userId);
      const newAdminStatus = !userToUpdate.admin;
      
      const response = await fetch(`http://localhost:5069/api/users/${userId}/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin: newAdminStatus }),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user._id === userId ? { ...user, admin: newAdminStatus } : user
        ));
        setUserActionStatus({ 
          type: 'success', 
          message: `${userToUpdate.name} is now ${newAdminStatus ? 'an admin' : 'a regular user'}` 
        });
      } else {
        throw new Error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      setUserActionStatus({ 
        type: 'error', 
        message: 'Failed to update admin status. Please try again.' 
      });
    }
    setTimeout(() => setUserActionStatus(null), 3000);
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setUserActionStatus({ type: 'loading', message: 'Deleting user...' });
      const response = await fetch(`http://localhost:5069/api/users/${userId}`, { method: 'DELETE' });
      
      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        setUserActionStatus({ 
          type: 'success', 
          message: `User "${username}" has been deleted successfully.` 
        });
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setUserActionStatus({ 
        type: 'error', 
        message: 'Failed to delete user. Please try again.' 
      });
    }
    setTimeout(() => setUserActionStatus(null), 3000);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const formatNumber = (num) => new Intl.NumberFormat().format(num);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>📊 {stats.gameInfo.name} - Admin Panel</h1>
          <p className="game-subtitle">
            Last Updated: {new Date(stats.gameInfo.updated).toLocaleDateString()} | 
            Created: {new Date(stats.gameInfo.created).toLocaleDateString()}
          </p>
        </div>
        <div className="time-range-selector">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              className={timeRange === range ? 'active' : ''}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {userActionStatus && (
        <div className={`login-status ${userActionStatus.type}`} style={{ marginBottom: '1rem' }}>
          {userActionStatus.message}
          {userActionStatus.type === 'loading' && <span className="loading-dots">...</span>}
        </div>
      )}

      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>👥 User Management ({users.length} users)</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                minWidth: '200px'
              }}
            />
            <button 
              onClick={fetchAllUsers}
              style={{
                padding: '0.5rem 1rem',
                background: '#4cc9f0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Refresh Users
            </button>
          </div>
        </div>

        {loadingUsers ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto 1rem' }}></div>
            <p>Loading users from database...</p>
          </div>
        ) : (
          <>
            <div className="table-scroll" style={{ maxHeight: '400px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <tr key={user._id}>
                        <td className="player-cell">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            background: user.admin ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                            color: user.admin ? '#9C27B0' : '#2196F3'
                          }}>
                            {user.admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => toggleAdminStatus(user._id)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: user.admin ? '#FF9800' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                              title={user.admin ? 'Remove Admin' : 'Make Admin'}
                            >
                              {user.admin ? '👑 Remove Admin' : '👑 Make Admin'}
                            </button>
                            
                            <button
                              onClick={() => deleteUser(user._id, user.name)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: '#ff5722',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                              title="Delete User"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>No users found. Try refreshing or check your API connection.</p>
                        <button 
                          onClick={fetchAllUsers}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            background: '#4cc9f0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Try Loading Users Again
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginTop: '1rem',
                padding: '0.5rem'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? 'rgba(255, 255, 255, 0.1)' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                
                <span style={{ color: '#aaa' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.1)' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}
            
            <div className="table-summary">
              Showing {currentUsers.length} of {filteredUsers.length} users ({users.length} total) | 
              {users.filter(u => u.admin).length} admins
            </div>
          </>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-card primary">
          <h3>👥 Current Players</h3>
          <div className="metric-value">{stats.gameInfo.activePlayers}</div>
          <div className="metric-details">
            <span>Peak: {stats.metrics.activePlayers.peak}</span>
            <span>Average: {stats.metrics.activePlayers.average}</span>
          </div>
        </div>

        <div className="metric-card success">
          <h3>🚀 Total Visits</h3>
          <div className="metric-value">{formatNumber(stats.gameInfo.visits)}</div>
          <div className="metric-change positive">
            {stats.metrics.visits.change} from yesterday
          </div>
        </div>

        <div className="metric-card warning">
          <h3>⭐ Favorites</h3>
          <div className="metric-value">{stats.gameInfo.favorites}</div>
          <div className="metric-details">
            <span>Server Size: {stats.gameInfo.maxPlayers} players</span>
          </div>
        </div>

        <div className="metric-card revenue">
          <h3>💰 Robux Earned</h3>
          <div className="metric-value">{formatNumber(stats.metrics.revenue.totalRobux)} R$</div>
          <div className="metric-details">
            <span>Today: {stats.metrics.revenue.today} R$</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-header">
          <h2>📈 Data Analytics</h2>
          <div className="chart-selector">
            {['visits', 'players', 'revenue', 'errors'].map(chart => (
              <button
                key={chart}
                className={activeChart === chart ? 'active' : ''}
                onClick={() => setActiveChart(chart)}
              >
                {chart === 'visits' && 'Visits'}
                {chart === 'players' && 'Player Activity'}
                {chart === 'revenue' && 'Revenue'}
                {chart === 'errors' && 'Error Rate'}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container">
          {activeChart === 'visits' && (
            <div className="chart">
              <h3>Visit Trends ({timeRange})</h3>
              <div className="chart-visualization">
                <div className="mock-chart">
                  <div className="chart-bars">
                    {stats.metrics.visits.daily.slice(-(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)).map((day, i) => (
                      <div
                        key={i}
                        className="chart-bar"
                        style={{ height: `${(day.value / 2000) * 25}%` }}
                        title={`${day.date}: ${day.value} visits`}
                      >
                        <div className="bar-value">{day.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {stats.metrics.visits.daily.slice(-(timeRange === '7d' ? 7 : 14)).map((day, i) => (
                      <div key={i} className="chart-label">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'players' && (
            <div className="chart">
              <h3>Player Activity (24 Hours)</h3>
              <div className="chart-visualization">
                <div className="line-chart">
                  {stats.metrics.activePlayers.hourly.map((hour, i) => (
                    <div
                      key={i}
                      className="line-point"
                      style={{
                        left: `${(i / 23) * 100}%`,
                        bottom: `${(hour.players / 20) * 100}%`
                      }}
                      title={`${hour.hour}:00 - ${hour.players} players`}
                    >
                      <div className="point-value">{hour.players}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-labels hourly">
                  {[0, 6, 12, 18, 23].map(hour => (
                    <div key={hour} className="chart-label">
                      {hour}:00
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tables-grid">
        <div className="data-table">
          <h3>🛒 Recent Purchases</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Item</th>
                  <th>Amount (R$)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.purchases.slice(0, 8).map(purchase => (
                  <tr key={purchase.id}>
                    <td className="player-cell">{purchase.player}</td>
                    <td>{purchase.item}</td>
                    <td className="amount-cell">{purchase.amount}</td>
                    <td className="time-cell">{purchase.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-summary">
            Total Revenue Today: {stats.metrics.revenue.today} R$
          </div>
        </div>

        <div className="data-table">
          <h3>⚠️ Error Logs</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Affected</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.errors.slice(0, 8).map(error => (
                  <tr key={error.id} className={error.playersAffected > 5 ? 'error-high' : ''}>
                    <td>
                      <span className={`error-type ${error.type.toLowerCase().replace(' ', '-')}`}>
                        {error.type}
                      </span>
                    </td>
                    <td className="error-message">{error.message}</td>
                    <td>{error.playersAffected}</td>
                    <td>{error.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-summary">
            Total Errors Today: {stats.errors.filter(e => 
              new Date(e.time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length}
          </div>
        </div>

        <div className="data-table">
          <h3>🏆 Top Selling Items</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Item Name</th>
                <th>Sales</th>
                <th>Revenue (R$)</th>
              </tr>
            </thead>
            <tbody>
              {stats.metrics.revenue.topItems.map((item, index) => (
                <tr key={index}>
                  <td className="rank-cell">#{index + 1}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.sales}</td>
                  <td className="revenue-cell">{formatNumber(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-table">
          <h3>📊 Player Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-item">
              <div className="analytics-label">Day 1 Retention</div>
              <div className="analytics-value">{stats.metrics.retention.day1}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Day 7 Retention</div>
              <div className="analytics-value">{stats.metrics.retention.day7}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Day 30 Retention</div>
              <div className="analytics-value">{stats.metrics.retention.day30}</div>
            </div>
            <div className="analytics-item">
              <div className="analytics-label">Avg Session</div>
              <div className="analytics-value">{stats.metrics.retention.sessionDuration}</div>
            </div>
            <div className="analytics-item attention">
              <div className="analytics-label">Attention Span</div>
              <div className="analytics-value">{stats.metrics.attentionSpan.average}</div>
              <div className="analytics-sub">Engagement: {stats.metrics.attentionSpan.engagement}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="leaderboard-summary">
        <h3>🏅 Leaderboard Overview</h3>
        <div className="leaderboard-content">
          <div className="leaderboard-stats">
            <div className="leaderboard-stat">
              <div className="stat-label">Daily Completions</div>
              <div className="stat-value">{stats.leaderboardSummary.dailyCompletion}</div>
            </div>
            <div className="leaderboard-stat">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{formatNumber(stats.leaderboardSummary.averageScore)}</div>
            </div>
            <div className="leaderboard-stat">
              <div className="stat-label">Highest Score</div>
              <div className="stat-value">{formatNumber(stats.leaderboardSummary.highestScore)}</div>
            </div>
          </div>
          <div className="top-players">
            <h4>Top 5 Players</h4>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Rebirths</th>
                  <th>Playtime</th>
                </tr>
              </thead>
              <tbody>
                {stats.leaderboardSummary.topPlayers.map(player => (
                  <tr key={player.rank}>
                    <td className="rank-badge">#{player.rank}</td>
                    <td>{player.username}</td>
                    <td>{player.reborns}</td>
                    <td>{player.playtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="game-summary">
        <h3>🎮 Game Information</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Game Name</span>
            <strong>{stats.gameInfo.name}</strong>
          </div>
          <div className="summary-item">
            <span>Created</span>
            <strong>{new Date(stats.gameInfo.created).toLocaleDateString()}</strong>
          </div>
          <div className="summary-item">
            <span>Last Updated</span>
            <strong>{new Date(stats.gameInfo.updated).toLocaleDateString()}</strong>
          </div>
          <div className="summary-item">
            <span>Server Size</span>
            <strong>{stats.gameInfo.maxPlayers} players</strong>
          </div>
          <div className="summary-item">
            <span>Total Visits</span>
            <strong>{formatNumber(stats.gameInfo.visits)}</strong>
          </div>
          <div className="summary-item">
            <span>Favorites</span>
            <strong>{stats.gameInfo.favorites}</strong>
          </div>
          <div className="summary-item">
            <span>Current Players</span>
            <strong>{stats.gameInfo.activePlayers}</strong>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <button className="btn-primary" onClick={fetchAllUsers}>
          🔄 Refresh All Data
        </button>
        <button className="btn-secondary" onClick={() => window.open('https://create.roblox.com/dashboard/analytics', '_blank')}>
          📊 Open Roblox Analytics
        </button>
        <button className="btn-warning" onClick={() => {
          if (window.confirm('This will reset all mock data. Continue?')) {
            setStats(generateMockStats());
          }
        }}>
          🔄 Reset Mock Data
        </button>
      </div>
    </div>
  );
}