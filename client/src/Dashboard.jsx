import { useEffect, useState } from 'react';
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

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState([]);
  const navigate = useNavigate();

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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                   Total P&L
                </h3>
                <h2>$6,240</h2>
                <span style={{ fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <TrendingUp size={16}/> +12%
                </span>
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
        return (
          <>
            <div className="header header-actions">
              <div>
                <h1>Markets</h1>
                <p>Explore assets and add them to your portfolio.</p>
              </div>
              <div className="search-container">
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search by name or symbol..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="markets-grid">
              {filteredMarkets.map(asset => (
                <div key={asset.id} className="market-card">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {asset.symbol} 
                      <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>
                        {asset.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{asset.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '16px' }}>
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '2px' }}>
                        <TrendingUp size={14}/> 0.00%
                      </div>
                    </div>
                    <button className="add-btn" title="Add to Watchlist">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredMarkets.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Nu am gasit niciun activ.
                </div>
              )}
            </div>
          </>
        );
      case 'portfolio':
        return (
          <div className="header">
            <h1>My Portfolio</h1>
            <p>Detailed breakdown of your current holdings.</p>
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
          <div className="header">
            <h1>Account Settings</h1>
            <p>Manage your preferences and profile.</p>
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
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Premium Account</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;