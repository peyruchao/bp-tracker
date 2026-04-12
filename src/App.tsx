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

  return (
    <RecordsProvider>
      <div className="app-container">
        {/* Top Header */}
        <header style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.displayName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Google Account</div>
            </div>
          </div>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
            <FiLogOut size={20} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {activeTab === 'home' && <Dashboard />}
          {activeTab === 'input' && <InputForm onSuccess={() => setActiveTab('home')} />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'list' && <HistoryList />}
        </main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <FiHome />
            <span>Home</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <FiPlusSquare />
            <span>Record</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <FiCalendar />
            <span>Calendar</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <FiList />
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
