import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, CheckCircle, Linkedin, Mail, Loader, Clock, MessageCircle, ChevronDown, ChevronUp, BookOpen, GraduationCap } from 'lucide-react';

export default function Matches({ user }: { user: any }) {
  if (!user) return <Navigate to="/" />;

  const [matches, setMatches] = useState<any[]>([]);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    if (user.id) fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/matches/${user.id}`);
      if (res.ok) setMatches(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAccept = async (matchId: number) => {
    setAccepting(matchId);
    try {
      const res = await fetch(`http://localhost:8080/api/matches/${matchId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) fetchMatches();
    } catch (err) { console.error(err); }
    setAccepting(null);
  };

  const toggleDetails = (id: number) =>
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));

  const acceptedMatches = matches.filter(m => m.status === 'ACCEPTED');
  const pendingMatches  = matches.filter(m => m.status !== 'ACCEPTED');

  return (
    <div>
      <h2 className="page-title">Mutual Matches</h2>
      <p className="page-subtitle">Connect with peers for 1-on-1 skill exchange sessions</p>

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <User size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No matches found yet</h3>
          <p style={{ color: '#8b949e', maxWidth: '400px', margin: '0 auto' }}>
            Add more skills to your profile to find mutual matches.
          </p>
        </div>
      ) : (
        <>
          {/* ── Accepted Matches ── */}
          {acceptedMatches.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle size={18} color="var(--secondary-color)" />
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--secondary-color)' }}>
                  Accepted Matches ({acceptedMatches.length})
                </h3>
              </div>
              <div className="grid">
                {acceptedMatches.map((match: any) => {
                  const isUser1   = match.user1.id === user.id;
                  const otherUser = isUser1 ? match.user2 : match.user1;
                  const theyTeach = isUser1 ? match.skillTaughtByUser2 : match.skillTaughtByUser1;
                  const youTeach  = isUser1 ? match.skillTaughtByUser1 : match.skillTaughtByUser2;
                  const open      = showDetails[match.id] || false;

                  return (
                    <div key={match.id} className="card" style={{ borderColor: 'var(--secondary-color)' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(46,160,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={22} color="var(--secondary-color)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '17px', color: '#fff', margin: 0 }}>{otherUser.username}</h3>
                          <p style={{ fontSize: '13px', color: 'var(--secondary-color)', margin: 0 }}>✅ Match Accepted</p>
                        </div>
                      </div>

                      {/* Skill chips */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.25)', borderRadius: '20px', padding: '4px 10px', color: 'var(--primary-color)' }}>
                          <BookOpen size={11} /> They teach: {theyTeach?.name}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'rgba(46,160,67,0.1)', border: '1px solid rgba(46,160,67,0.25)', borderRadius: '20px', padding: '4px 10px', color: 'var(--secondary-color)' }}>
                          <GraduationCap size={11} /> You teach: {youTeach?.name}
                        </span>
                      </div>

                      {/* View Details toggle */}
                      <button
                        className="btn btn-outline"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: open ? '12px' : '0', borderColor: 'rgba(46,160,67,0.5)', color: 'var(--secondary-color)' }}
                        onClick={() => toggleDetails(match.id)}
                      >
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {open ? 'Hide Details' : 'View Details'}
                      </button>

                      {/* Expanded contact panel */}
                      {open && (
                        <div style={{ background: 'rgba(46,160,67,0.07)', border: '1px solid rgba(46,160,67,0.25)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                          <p style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Contact Details</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9', marginBottom: '8px' }}>
                            <Mail size={14} color="var(--primary-color)" />
                            <a href={`mailto:${otherUser.email}`} style={{ color: '#58a6ff', textDecoration: 'none' }}>{otherUser.email}</a>
                          </div>
                          {otherUser.linkedinUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                              <Linkedin size={14} color="#0a66c2" />
                              <a href={otherUser.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>View LinkedIn</a>
                            </div>
                          )}
                        </div>
                      )}

                      {open && (
                        <a
                          href={`mailto:${otherUser.email}`}
                          className="btn btn-secondary"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                        >
                          <MessageCircle size={17} /> Contact Them
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Pending / Suggested Matches ── */}
          {pendingMatches.length > 0 && (
            <div>
              {acceptedMatches.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Clock size={18} color="#8b949e" />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#8b949e' }}>
                    Pending Matches ({pendingMatches.length})
                  </h3>
                </div>
              )}
              <div className="grid">
                {pendingMatches.map((match: any) => {
                  const isUser1     = match.user1.id === user.id;
                  const otherUser   = isUser1 ? match.user2 : match.user1;
                  const theyTeach   = isUser1 ? match.skillTaughtByUser2 : match.skillTaughtByUser1;
                  const youTeach    = isUser1 ? match.skillTaughtByUser1 : match.skillTaughtByUser2;
                  const iAccepted   = isUser1 ? match.user1Accepted : match.user2Accepted;
                  const theyAccepted = isUser1 ? match.user2Accepted : match.user1Accepted;
                  const waitingForThem = iAccepted && !theyAccepted;

                  return (
                    <div key={match.id} className="card">
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={22} color="#8b949e" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '17px', color: '#fff', margin: 0 }}>{otherUser.username}</h3>
                          <p style={{ fontSize: '13px', color: waitingForThem ? '#e3b341' : theyAccepted ? 'var(--primary-color)' : '#8b949e', margin: 0 }}>
                            {waitingForThem ? '⏳ Waiting for them to accept...'
                            : theyAccepted  ? '👋 They accepted — your turn!'
                            : 'Campus Peer'}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div style={{ background: 'rgba(13,17,23,0.5)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>They Teach</span>
                          <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{theyTeach?.name}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>You Teach</span>
                          <div style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>{youTeach?.name}</div>
                        </div>
                      </div>

                      {/* Waiting banner */}
                      {waitingForThem && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(227,179,65,0.08)', border: '1px solid rgba(227,179,65,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#e3b341' }}>
                          <Clock size={14} /> Waiting for {otherUser.username} to accept...
                        </div>
                      )}

                      {/* Action */}
                      {!iAccepted ? (
                        <button
                          className="btn btn-secondary"
                          style={{ width: '100%' }}
                          onClick={() => handleAccept(match.id)}
                          disabled={accepting === match.id}
                        >
                          {accepting === match.id
                            ? <Loader size={17} style={{ animation: 'spin 1s linear infinite' }} />
                            : <CheckCircle size={17} />}
                          {theyAccepted ? 'Accept & Reveal Contact' : 'Accept Match'}
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ width: '100%', cursor: 'default', opacity: 0.7, borderColor: '#e3b341', color: '#e3b341' }} disabled>
                          <Clock size={17} /> Waiting for Other User to Accept
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
