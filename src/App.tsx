import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecordsProvider } from './context/RecordsContext';
import { FcGoogle } from 'react-icons/fc';
import { FiHome, FiCalendar, FiList, FiPlusSquare, FiLogOut } from 'react-icons/fi';
import { Dashboard } from './components/Dashboard';
import { InputForm } from './components/InputForm';
import { CalendarView } from './components/CalendarView';
import { HistoryList } from './components/HistoryList';
import './index.css';

const LoginScreen = () => {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="app-container" style={{ justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>BP Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track your daily blood pressure easily</p>
        
        <button 
          className="btn-primary" 
          onClick={signInWithGoogle}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}
        >
          <FcGoogle size={24} />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'input' | 'calendar' | 'list'>('home');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleDateClick = (date: string) => {
    setSelectedHistoryDate(date);
    setActiveTab('list');
  };

  return (
    <RecordsProvider>
      <div className="app-container">
        <header style={{ padding: '1.5rem 1.25rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', zIndex: 10 }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', flexDirection: 'column' }}>
            Blood Pressure Tracker
            <span style={{ fontSize: '0.65em', opacity: 0.6, fontWeight: 400, marginTop: '0.1rem' }}>by Peggy</span>
          </h1>
          
          <div style={{ position: 'relative' }}>
            <div 
              style={{ width: 40, height: 40, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#000000', boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Avatar'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.displayName?.charAt(0) || 'U'
              )}
            </div>
            
            {showUserMenu && (
              <div style={{ position: 'absolute', top: '120%', right: 0, backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', minWidth: '200px', boxShadow: 'var(--shadow-lg)', zIndex: 50 }}>
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.displayName || 'User'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </div>
                </div>
                <button onClick={() => { setShowUserMenu(false); signOut(); }} style={{ width: '100%', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.6rem 0 0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                  <FiLogOut size={18} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {activeTab === 'home' && <Dashboard />}
          {activeTab === 'input' && <InputForm onSuccess={() => setActiveTab('home')} />}
          {activeTab === 'calendar' && <CalendarView onDateClick={handleDateClick} />}
          {activeTab === 'list' && <HistoryList initialFilterDate={selectedHistoryDate} onClearFilter={() => setSelectedHistoryDate(null)} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <div className="nav-icon-wrap"><FiHome size={20} /></div>
            <span>Home</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <div className="nav-icon-wrap"><FiPlusSquare size={20} /></div>
            <span>Record</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <div className="nav-icon-wrap"><FiCalendar size={20} /></div>
            <span>Calendar</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <div className="nav-icon-wrap"><FiList size={20} /></div>
            <span>History</span>
          </button>
        </nav>
      </div>
    </RecordsProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

const AuthConsumer = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Loading...</div>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginScreen />;
};

export default App;
