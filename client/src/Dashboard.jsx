import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  ArrowLeftRight, 
  Settings, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Star,
  Activity
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
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('ALL');
  
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedSellAsset, setSelectedSellAsset] = useState(null);
  const [sellQuantity, setSellQuantity] = useState('');

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedChartAsset, setSelectedChartAsset] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const portfolioPieData = portfolio.map(item => ({
    name: item.asset.symbol,
    value: parseFloat((item.quantity * item.asset.currentPrice).toFixed(2))
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

  const fetchAssets = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/assets');
      setAssets(response.data);
    } catch (error) {}
  };
   
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (user && user.id) {
          const res = await axios.get(`http://localhost:3000/api/trade/history/${user.id}`);
          setTransactions(res.data);
        }
      } catch (err) {}
    };

    if (activeView === 'transactions') {
      fetchTransactions();
    }
  }, [activeView, user]);

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
        if (isChartModalOpen && selectedChartAsset) {
          handleRefreshChartData(selectedChartAsset.id);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [navigate, isChartModalOpen, selectedChartAsset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.id) {
          const portRes = await axios.get(`http://localhost:3000/api/portfolio/${user.id}`);
          setPortfolio(portRes.data);
          
          const histRes = await axios.get(`http://localhost:3000/api/portfolio/history/${user.id}`);
          setBalanceHistory(histRes.data);

          const watchRes = await axios.get(`http://localhost:3000/api/watchlist/${user.id}`);
          setWatchlist(watchRes.data);
        }
      } catch (err) {}
    };

    if (activeView === 'portfolio' || activeView === 'dashboard') {
      fetchData();
    }
  }, [activeView, user]);

  const handleRefreshChartData = async (assetId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/assets/history/${assetId}`);
      setChartData(res.data);
    } catch (err) {}
  };

  const handleOpenChart = async (asset) => {
    setSelectedChartAsset(asset);
    setIsChartModalOpen(true);
    setChartData([]);
    try {
      const res = await axios.get(`http://localhost:3000/api/assets/history/${asset.id}`);
      setChartData(res.data);
    } catch (err) {}
  };

  const handleToggleWatchlist = async (assetId) => {
    try {
      await axios.post('http://localhost:3000/api/watchlist/toggle', {
        userId: user.id,
        assetId
      });
      const watchRes = await axios.get(`http://localhost:3000/api/watchlist/${user.id}`);
      setWatchlist(watchRes.data);
    } catch (err) {}
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="dashboard-section">
            <header className="header">
              <h1>Overview</h1>
              <p>Welcome back, {user?.name || 'Investor'}. Here is what's happening with your money.</p>
            </header>

            <div className="dashboard-grid">
              <div className="stat-card" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Available Balance</p>
                  <h2 style={{ fontSize: '32px', margin: 0, color: '#0f172a' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(user?.balance || 0)}
                  </h2>
                </div>
                <button 
                  className="trade-btn-outline"
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
                      } catch (err) {
                        alert(err.response?.data?.message || 'Deposit failed');
                      }
                    }
                  }}
                >
                  <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
                  Add Funds
                </button>
              </div>

              <div className="stat-card" style={{ gridColumn: 'span 2', minHeight: '350px' }}>
                <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '24px' }}>Balance History</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [`$${value}`, 'Balance']}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '24px' }}>Asset Allocation</h3>
                {portfolioPieData.length > 0 ? (
                  <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {portfolioPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                      {portfolioPieData.map((entry, index) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
                    No assets in portfolio yet.<br/>Buy some assets to see your allocation.
                  </div>
                )}
              </div>

              <div className="watchlist-section" style={{ gridColumn: '1 / -1', backgroundColor: 'white', padding: '24px 32px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Watchlist</h3>
                </div>
                
                {watchlist.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                    Your watchlist is empty. Go to Markets to add assets.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {watchlist.map(item => {
                      const isPositive = item.asset.change24h >= 0;
                      return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.asset.symbol} <span style={{ color: '#fbbf24' }}>★</span></div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{item.asset.name}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>${item.asset.currentPrice.toFixed(2)}</div>
                            <div style={{ fontSize: '13px', color: isPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                              {isPositive ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {Math.abs(item.asset.change24h || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        );

      case 'markets':
        const filteredAssets = assets.filter(asset => {
          const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter = marketFilter === 'ALL' || asset.type === marketFilter;
          return matchesSearch && matchesFilter;
        });

        return (
          <div className="markets-section">
            <header className="header">
              <h1>Markets</h1>
              <p>Explore assets and expand your portfolio.</p>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="search-container" style={{ margin: 0 }}>
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by symbol or name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setMarketFilter('ALL')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: marketFilter === 'ALL' ? '#0f172a' : 'white', color: marketFilter === 'ALL' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  All
                </button>
                <button 
                  onClick={() => setMarketFilter('CRYPTO')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: marketFilter === 'CRYPTO' ? '#0f172a' : 'white', color: marketFilter === 'CRYPTO' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Crypto
                </button>
                <button 
                  onClick={() => setMarketFilter('STOCK')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: marketFilter === 'STOCK' ? '#0f172a' : 'white', color: marketFilter === 'STOCK' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Stocks
                </button>
              </div>
            </div>

            <div className="assets-list-container" style={{ marginTop: 0 }}>
              {filteredAssets.map(asset => {
                const isPositive = asset.change24h >= 0;
                return (
                  <div key={asset.id} className="asset-row-clean">
                    <div 
                      className="asset-info-main" 
                      onClick={() => handleOpenChart(asset)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="asset-symbol">{asset.symbol}</span>
                      <span className="asset-name">{asset.name}</span>
                      <span className="asset-type-badge">{asset.type}</span>
                    </div>
                    
                    <div className="asset-price-section">
                      <div className="price-wrapper" style={{ marginRight: '16px' }}>
                        <span className="current-price">${asset.currentPrice.toFixed(2)}</span>
                        <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(asset.change24h || 0).toFixed(2)}%
                        </span>
                      </div>
                      <button 
                        onClick={() => handleOpenChart(asset)}
                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', marginRight: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '600' }}
                      >
                        <Activity size={16} /> Chart
                      </button>
                      <button 
                        onClick={() => handleToggleWatchlist(asset.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', display: 'flex', alignItems: 'center' }}
                      >
                        <Star size={22} fill={watchlist.some(w => w.assetId === asset.id) ? "#fbbf24" : "none"} color={watchlist.some(w => w.assetId === asset.id) ? "#fbbf24" : "#cbd5e1"} />
                      </button>
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
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No assets found. Start trading to build your portfolio.
                      </td>
                    </tr>
                  ) : (
                    portfolio.map(item => {
                      const isPositive = item.profitLoss >= 0;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="table-asset-name" onClick={() => handleOpenChart(item.asset)} style={{ cursor: 'pointer' }}>
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
          <div className="transactions-section">
            <header className="header">
              <h1>Transaction History</h1>
              <p>View all your past trades and operations.</p>
            </header>

            <div className="table-container">
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>ASSET</th>
                    <th>TYPE</th>
                    <th>QUANTITY</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No transactions found. Start trading to see your history here.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(tx => {
                      const isBuy = tx.type === 'BUY';
                      return (
                        <tr key={tx.id}>
                          <td>{new Date(tx.date).toLocaleString()}</td>
                          <td>
                            <div className="table-asset-name">
                              <span className="table-icon">{tx.asset.symbol.charAt(0)}</span>
                              {tx.asset.name} <span className="badge">{tx.asset.symbol}</span>
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: isBuy ? '#d1fae5' : '#fee2e2', 
                                color: isBuy ? '#047857' : '#b91c1c' 
                              }}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td>{tx.quantity}</td>
                          <td>${tx.priceAtPurchase.toFixed(2)}</td>
                          <td style={{ fontWeight: '600', color: isBuy ? '#ef4444' : '#10b981' }}>
                            {isBuy ? '-' : '+'}${(tx.quantity * tx.priceAtPurchase).toFixed(2)}
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
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
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
                    <input type="text" value={user.name || ''} onChange={(e) => setUser({...user, name: e.target.value})} className="settings-input" />
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
            <LineChartIcon size={20} /> Markets
          </div>
          <div 
            className={`menu-item ${activeView === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveView('portfolio')}
          >
            <PieChartIcon size={20} /> Portfolio
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
      
      {isChartModalOpen && selectedChartAsset && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>{selectedChartAsset.name}</h2>
                <span className="badge" style={{ fontSize: '14px' }}>{selectedChartAsset.symbol}</span>
              </div>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }} 
                onClick={() => setIsChartModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-price-box" style={{ marginBottom: '24px', textAlign: 'left', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Current Price</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <h3 style={{ fontSize: '28px', margin: '4px 0 0 0' }}>${selectedChartAsset.currentPrice.toFixed(4)}</h3>
                <span style={{ fontSize: '14px', fontWeight: '600', color: selectedChartAsset.change24h >= 0 ? '#10b981' : '#ef4444', marginBottom: '6px' }}>
                  {selectedChartAsset.change24h >= 0 ? '+' : ''}{selectedChartAsset.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '350px', marginBottom: '24px' }}>
              {chartData.length === 0 ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Loading chart data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis 
                    domain={[(dataMin) => dataMin * 0.9995, (dataMax) => dataMax * 1.0005]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dx={-10} 
                    tickFormatter={(value) => `$${value < 1 ? value.toFixed(6) : value.toFixed(2)}`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value) => [`$${Number(value) < 1 ? Number(value).toFixed(6) : Number(value).toFixed(2)}`, 'Price']}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="modal-buttons">
              <button 
                className="confirm-btn" 
                style={{ width: '100%' }}
                onClick={() => {
                  setIsChartModalOpen(false);
                  setSelectedAsset(selectedChartAsset);
                  setIsBuyModalOpen(true);
                }}
              >
                Trade {selectedChartAsset.symbol}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBuyModalOpen && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Buy {selectedAsset.symbol}</h2>
            <div className="modal-price-box">
              <span>Current Price</span>
              <h3>${selectedAsset.currentPrice.toFixed(4)}</h3>
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
              <h3>${selectedSellAsset.asset.currentPrice.toFixed(4)}</h3>
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