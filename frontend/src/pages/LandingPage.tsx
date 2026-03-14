import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Book, Users, Linkedin, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LandingPage({ setUser }: { user: any, setUser: any }) {
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [linkedin, setLinkedin]   = useState('');
  const [isLogin, setIsLogin]     = useState(true);
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        const res = await fetch('http://localhost:8080/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          navigate('/dashboard');
        } else {
          const err = await res.json();
          setError(err.error || 'Invalid credentials');
        }
      } catch {
        setError('Could not connect to server');
      }
    } else {
      try {
        const res = await fetch('http://localhost:8080/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, linkedinUrl: linkedin })
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          navigate('/dashboard');
        } else {
          const err = await res.json();
          setError(err.error || 'Registration failed');
        }
      } catch {
        setError('Could not connect to server');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', marginBottom: '64px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: 1.2, marginBottom: '24px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #8b949e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Trade Skills. <br />Grow Together.
        </h1>
        <p style={{ fontSize: '20px', color: '#c9d1d9', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Connect with peers on campus to exchange knowledge. Teach what you know, learn what you love.
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '64px' }}>
          <div className="card" style={{ flex: 1, textAlign: 'left', padding: '32px' }}>
            <Book size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>1-on-1 Matching</h3>
            <p style={{ color: '#8b949e', fontSize: '14px' }}>Our system finds students who want to learn exactly what you can teach.</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'left', padding: '32px' }}>
            <Users size={32} color="var(--secondary-color)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Group Sessions</h3>
            <p style={{ color: '#8b949e', fontSize: '14px' }}>Join collaborative group sessions led by expert peers in your campus.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#8b949e', marginBottom: '24px', fontSize: '14px' }}>
          {isLogin ? 'Log in to your account to continue.' : 'Join the campus skill exchange community.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(248, 81, 73, 0.15)', border: '1px solid rgba(248, 81, 73, 0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#f85149', fontSize: '14px', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. johndoe" required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label"><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@campus.edu" required />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label"><Linkedin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />LinkedIn URL <span style={{ color: '#8b949e', fontWeight: 400 }}>(optional)</span></label>
                <input type="url" className="form-input" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </div>
            </>
          )}

          <div className="form-group" style={{ textAlign: 'left', position: 'relative' }}>
            <label className="form-label"><Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Password</label>
            <input type={showPw ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: '44px' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 0 }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isLogin ? 'Log In' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px', color: '#8b949e' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <a href="#" onClick={e => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }} style={{ fontWeight: 600 }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </a>
        </div>
      </div>
    </div>
  );
}
