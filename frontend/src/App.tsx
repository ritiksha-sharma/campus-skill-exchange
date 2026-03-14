import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Sessions from './pages/Sessions';
import ProfilePage from './pages/ProfilePage';
import NotificationBar from './components/NotificationBar';
import { LogOut, BookOpen, Users, Compass, User as UserIcon } from 'lucide-react';

function Navigation({ user, setUser }: { user: any, setUser: any }) {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <header className="header">
      <div className="container header-content">
        <h1 className="logo">Campus Skill Exchange</h1>
        <nav className="nav-links">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Compass size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Dashboard
          </Link>
          <Link to="/matches" className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}>
            <Users size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Matches
          </Link>
          <Link to="/sessions" className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}>
            <BookOpen size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Sessions
          </Link>

          <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationBar user={user} />

            <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserIcon size={16} /> <span style={{ fontWeight: 600 }}>{user?.username}</span>
            </Link>

            <button
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '14px' }}
              onClick={() => setUser(null)}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation user={user} setUser={setUser} />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/matches" element={<Matches user={user} />} />
            <Route path="/sessions" element={<Sessions user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
