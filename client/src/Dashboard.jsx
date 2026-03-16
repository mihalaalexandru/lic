import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  LineChart, 
  PieChart, 
  ArrowLeftRight, 
  Settings, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Search,
  Plus
} from 'lucide-react';
import './Dashboard.css';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedSellAsset, setSelectedSellAsset] = useState(null);
  const [sellQuantity, setSellQuantity] = useState('');

useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/assets');
        setAssets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (activeView === 'markets') {
      fetchAssets();
    }
  }, [activeView]);

  const handleBuyAsset = async () => {
    if (!buyQuantity || buyQuantity <= 0) return;
    try {
      const res = await axios.post('http://localhost:3000/api/trade/buy', {
        userId: user.id,
        assetId: selectedAsset.id,
        quantity: buyQuantity
      });
      const updatedUser = { ...user, balance: res.data.newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Asset purchased successfully!');
      setIsBuyModalOpen(false);
      setBuyQuantity('');
    } catch (err) {
      alert(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleSellAsset = async () => {
    if (!sellQuantity || sellQuantity <= 0) return;
    if (sellQuantity > selectedSellAsset.quantity) {
      return alert('You cannot sell more than you own!');
    }

    try {
      const res = await axios.post('http://localhost:3000/api/trade/sell', {
        userId: user.id,
        assetId: selectedSellAsset.asset.id,
        quantity: sellQuantity
      });
      
      const updatedUser = { ...user, balance: res.data.newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Asset sold successfully!');
      setIsSellModalOpen(false);
      setSellQuantity('');
      
      const portRes = await axios.get(`http://localhost:3000/api/portfolio/${user.id}`);
      setPortfolio(portRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Transaction failed');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/');
    } else {
      setUser(JSON.parse(userData));
      fetchAssets();
      
      const interval = setInterval(() => {
        fetchAssets();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/assets');
      setMarkets(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        if (user && user.id) {
          const res = await axios.get(`http://localhost:3000/api/portfolio/${user.id}`);
          setPortfolio(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (activeView === 'portfolio') {
      fetchPortfolio();
    }
  }, [activeView, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredMarkets = markets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <>
            <header className="header">
              <h1>Investment Dashboard</h1>
              <p>Welcome back! Here's your portfolio overview.</p>
            </header>

            <div className="alert-banner">
              <AlertTriangle size={20} />
              <span><strong>Portfolio highly concentrated in Tech sector</strong> - Consider diversifying your investments to reduce risk exposure.</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                   Total Portfolio Value
                </h3>
                <h2>$58,200</h2>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>243,400 RON</span>
              </div>
              
              <div className="stat-card">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Available Balance</p>
    <div style={{ padding: '4px', background: '#ecfdf5', borderRadius: '4px' }}>
      <TrendingUp size={16} color="#10b981" />
    </div>
  </div>
  
  <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
    {new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: user.currency || 'USD' 
    }).format(user.balance || 0)}
  </h2>
  
  <button 
    className="custom-file-btn" 
    style={{ width: '100%', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white', border: 'none' }}
    onClick={async () => {
      const amount = prompt("Enter the amount of virtual USD to deposit:");
      if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
          const res = await axios.post('http://localhost:3000/api/trade/deposit', {
            userId: user.id,
            amount: parseFloat(amount)
          });
          
          const updatedUser = { ...user, balance: res.data.newBalance };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          alert(`Success! Your new balance is ${res.data.newBalance} ${user.currency || 'USD'}`);
        } catch (err) {
          alert(err.response?.data?.message || 'Deposit failed');
        }
      }
    }}
  >
    <Plus size={16} style={{ marginRight: '8px' }} /> Add Funds
  </button>
</div>

              <div className="stat-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                   Day's Gain
                </h3>
                <h2>$420</h2>
                <span style={{ fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <TrendingUp size={16}/> +0.72%
                </span>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="chart-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Portfolio Evolution</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '4px 12px', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>1M</button>
                    <button style={{ padding: '4px 12px', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>3M</button>
                    <button style={{ padding: '4px 12px', border: 'none', background: '#2563eb', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>6M</button>
                    <button style={{ padding: '4px 12px', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>1Y</button>
                    <button style={{ padding: '4px 12px', border: 'none', background: '#f1f5f9', borderRadius: '4px', cursor: 'pointer' }}>ALL</button>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0' }}>Last 6 Months - Historical Data</p>
                
                <div style={{ height: '300px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                  Zona pentru graficul interactiv
                </div>
              </div>

              <div className="watchlist-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Watchlist</h3>
                  <span style={{ color: '#3b82f6', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>View All</span>
                </div>
                
                <div className="watchlist-item">
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>TSLA <span style={{ color: '#fbbf24' }}>★</span></div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Tesla Inc.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>$242.84</div>
                    <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      <TrendingUp size={14}/> 5.4%
                    </div>
                  </div>
                </div>

                <div className="watchlist-item">
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>AAPL <span style={{ color: '#fbbf24' }}>★</span></div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Apple Inc.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>$195.71</div>
                    <div style={{ fontSize: '13px', color: '#ef4444' }}>-1.08%</div>
                  </div>
                </div>

                <div className="watchlist-item">
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>NVDA <span style={{ color: '#fbbf24' }}>★</span></div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>NVIDIA Corp.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>$495.22</div>
                    <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      <TrendingUp size={14}/> 3.9%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
     case 'markets':
        const filteredAssets = assets.filter(asset => 
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <div className="markets-section">
            <header className="header">
              <h1>Markets</h1>
              <p>Explore assets and expand your portfolio.</p>
            </header>

            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search by symbol or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="assets-list-container">
              {filteredAssets.map(asset => {
                const isPositive = asset.change24h >= 0;
                return (
                  <div key={asset.id} className="asset-row-clean">
                    <div className="asset-info-main">
                      <span className="asset-symbol">{asset.symbol}</span>
                      <span className="asset-name">{asset.name}</span>
                      <span className="asset-type-badge">{asset.type}</span>
                    </div>
                    
                    <div className="asset-price-section">
                      <div className="price-wrapper">
                        <span className="current-price">${asset.currentPrice.toFixed(2)}</span>
                        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(asset.change24h || 0).toFixed(2)}%
                        </span>
                      </div>
                      <button 
                        className="trade-btn-outline"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setIsBuyModalOpen(true);
                        }}
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'portfolio':
        const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
        const totalInvested = portfolio.reduce((sum, item) => sum + (item.quantity * item.avgBuyPrice), 0);
        const totalPnL = totalPortfolioValue - totalInvested;
        const isPnLPositive = totalPnL >= 0;

        return (
          <div className="portfolio-section">
            <header className="header">
              <h1>My Assets</h1>
              <p>Track your assets and overall performance.</p>
            </header>

            <div className="portfolio-summary-cards">
              <div className="summary-box">
                <span className="summary-label">Total Portfolio Value</span>
                <span className="summary-value">
                  ${totalPortfolioValue.toFixed(2)}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-box">
                <span className="summary-label">Total P&L</span>
                <span className={`summary-value ${isPnLPositive ? 'text-green' : 'text-red'}`}>
                  {isPnLPositive ? '+' : ''}${totalPnL.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="table-container">
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>ASSET NAME</th>
                    <th>SYMBOL</th>
                    <th>QUANTITY</th>
                    <th>AVG. BUY PRICE</th>
                    <th>CURRENT PRICE</th>
                    <th>TOTAL VALUE</th>
                    <th>PROFIT/LOSS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No assets found. Start trading to build your portfolio.
                      </td>
                    </tr>
                  ) : (
                    portfolio.map(item => {
                      const isPositive = item.profitLoss >= 0;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="table-asset-name">
                              <span className="table-icon">{item.asset.symbol.charAt(0)}</span>
                              {item.asset.name}
                            </div>
                          </td>
                          <td><span className="badge">{item.asset.symbol}</span></td>
                          <td>{item.quantity}</td>
                          <td>${item.avgBuyPrice.toFixed(2)}</td>
                          <td className="text-blue">${item.asset.currentPrice.toFixed(2)}</td>
                          <td>${item.currentValue.toFixed(2)}</td>
                          <td>
                            <span className={`pnl-badge ${isPositive ? 'pnl-positive' : 'pnl-negative'}`}>
                              {isPositive ? '+' : ''}${item.profitLoss.toFixed(2)} ({isPositive ? '+' : ''}{item.profitLossPercentage.toFixed(2)}%)
                            </span>
                          </td>
                          <td>
                            <button 
                              className="sell-btn"
                              onClick={() => {
                                setSelectedSellAsset(item);
                                setIsSellModalOpen(true);
                              }}
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="header">
            <h1>Transaction History</h1>
            <p>View all your past trades and operations.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-section">
            <header className="header">
              <h1>Settings</h1>
              <p>Manage your account security and preferences.</p>
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
              
          <div className="stat-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ color: '#0f172a', fontSize: '18px', marginBottom: '24px' }}>Profile Preferences</h3>
                <form className="auth-form" style={{ padding: 0 }} onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await axios.put('http://localhost:3000/api/auth/update-profile', {
                      userId: user.id,
                      name: user.name,
                      currency: user.currency || 'USD',
                      profilePicture: user.profilePicture
                    });
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setUser(response.data.user);
                    alert('Profile preferences updated!');
                  } catch (err) {
                    alert('Failed to update profile');
                  }
                }}>
                  
                  {/* Secțiunea de Avatar Stilată */}
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-display">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="profile-avatar-actions">
                      <label className="settings-label">Profile Picture</label>
                      {/* Butonul Ascuns al Browserului */}
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef} // Avem nevoie de useRef() definit sus
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5000000) return alert('File is too large. Maximum size is 5MB.');
                            const reader = new FileReader();
                            reader.onloadend = () => setUser({...user, profilePicture: reader.result});
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {/* Butonul Nostru Stilizat care declanșează input-ul ascuns */}
                      <button 
                        type="button" 
                        className="custom-file-btn"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Choose Image
                      </button>
                      <p className="helper-text">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="settings-label">Full Name</label>
                    <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="settings-input" />
                  </div>
                  
                  <div className="form-group">
                    <label className="settings-label">Display Currency</label>
                    <select 
                      className="settings-select"
                      value={user.currency || 'USD'}
                      onChange={(e) => setUser({...user, currency: e.target.value})}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="RON">RON (lei)</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="submit-btn" style={{ marginTop: '16px' }}>
                    Save Preferences
                  </button>
                </form>
              </div>

              <div className="stat-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ color: '#0f172a', fontSize: '18px', marginBottom: '20px' }}>Change Password</h3>
                <form className="auth-form" style={{ padding: 0 }} onSubmit={async (e) => {
                  e.preventDefault();
                  const currentPassword = e.target.currentPassword.value;
                  const newPassword = e.target.newPassword.value;
                  const confirmPassword = e.target.confirmPassword.value;
                  
                  if (newPassword !== confirmPassword) return alert('New passwords do not match');
                  if (newPassword.length < 6) return alert('Password must be at least 6 characters');

                  try {
                    await axios.put('http://localhost:3000/api/auth/change-password', {
                      userId: user.id,
                      currentPassword,
                      newPassword
                    });
                    alert('Password updated successfully!');
                    e.target.reset();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Error updating password');
                  }
                }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" name="currentPassword" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" name="newPassword" required />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="confirmPassword" required />
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Update Password</button>
                </form>
              </div>

              <div className="stat-card" style={{ maxWidth: '600px', border: '1px solid #fee2e2' }}>
                <h3 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '10px' }}>Danger Zone</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button 
                  onClick={async () => {
                    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                      try {
                        await axios.delete(`http://localhost:3000/api/auth/delete-account/${user.id}`);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/');
                      } catch (err) {
                        alert('Error deleting account');
                      }
                    }
                  }}
                  style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Delete Account
                </button>
              </div>

            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TrendingUp size={20} color="white" />
          </div>
          <span>InvestPro</span>
        </div>
        
        <nav className="sidebar-menu">
          <div 
            className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div 
            className={`menu-item ${activeView === 'markets' ? 'active' : ''}`}
            onClick={() => setActiveView('markets')}
          >
            <LineChart size={20} /> Markets
          </div>
          <div 
            className={`menu-item ${activeView === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveView('portfolio')}
          >
            <PieChart size={20} /> Portfolio
          </div>
          <div 
            className={`menu-item ${activeView === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveView('transactions')}
          >
            <ArrowLeftRight size={20} /> Transactions
          </div>
          <div 
            className={`menu-item ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={20} /> Settings
          </div>
        </nav>

       <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
          <div className="user-avatar" style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div className="user-info">
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#f8fafc' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {user.email}
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
      {isBuyModalOpen && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Buy {selectedAsset.symbol}</h2>
            <div className="modal-price-box">
              <span>Current Price</span>
              <h3>${selectedAsset.currentPrice.toFixed(2)}</h3>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Quantity</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                placeholder="e.g. 1.5"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="modal-summary">
              <span>Estimated Cost:</span>
              <span>${(selectedAsset.currentPrice * (buyQuantity || 0)).toFixed(2)}</span>
            </div>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setIsBuyModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleBuyAsset}>Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}

      {isSellModalOpen && selectedSellAsset && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Sell {selectedSellAsset.asset.symbol}</h2>
            <div className="modal-price-box">
              <span>Current Price</span>
              <h3>${selectedSellAsset.asset.currentPrice.toFixed(2)}</h3>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Quantity to Sell (Max: {selectedSellAsset.quantity})</label>
              <input 
                type="number" 
                min="0" 
                max={selectedSellAsset.quantity}
                step="0.01" 
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                placeholder="e.g. 1.5"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="modal-summary">
              <span>Estimated Return:</span>
              <span className="text-green">${(selectedSellAsset.asset.currentPrice * (sellQuantity || 0)).toFixed(2)}</span>
            </div>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setIsSellModalOpen(false)}>Cancel</button>
              <button className="sell-confirm-btn" onClick={handleSellAsset}>Confirm Sale</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;