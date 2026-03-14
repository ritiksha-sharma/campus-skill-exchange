import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, Calendar, Clock, Plus, Star, CheckSquare, Shield, CheckCircle, XCircle, Mail, Linkedin, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function Sessions({ user }: { user: any }) {
  if (!user) return <Navigate to="/" />;

  const [sessions, setSessions] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [hostRequests, setHostRequests] = useState<{ [sessionId: number]: any[] }>({});
  
  const [showCreate, setShowCreate] = useState(false);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxParams, setMaxParams] = useState<number | ''>('');
  
  const [userSkillsToLearn, setUserSkillsToLearn] = useState<string[]>([]);

  // Track which sessions have host-details panel open (for joined users)
  const [showHostDetails, setShowHostDetails] = useState<{ [sessionId: number]: boolean }>({});

  // Track which sessions have the manage panel open (for hosts)
  const [showManage, setShowManage] = useState<{ [sessionId: number]: boolean }>({});

  // Notify-participants state: message per session, sending state
  const [notifMsg, setNotifMsg] = useState<{ [sessionId: number]: string }>({});
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchUserSkills();
    fetchMyRequests();
  }, []);

  const fetchUserSkills = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserSkillsToLearn((data.skillsToLearn || []).map((s: any) => s.name.toLowerCase()));
      }
    } catch {}
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        data.forEach((s: any) => {
          if (s.hostUser.id === user.id) fetchHostRequests(s.id);
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/sessions/my-requests/${user.id}`);
      if (res.ok) setMyRequests(await res.json());
    } catch {}
  };

  const fetchHostRequests = async (sessionId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/sessions/${sessionId}/join-requests`);
      if (res.ok) {
        const reqs = await res.json();
        setHostRequests(prev => ({ ...prev, [sessionId]: reqs }));
      }
    } catch {}
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date || !time) return;
    try {
      await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.id,
          topic,
          description,
          dateTime: `${date}T${time}:00`,
          isGroup: true,
          maxParticipants: maxParams === '' ? null : maxParams
        })
      });
      setShowCreate(false); setTopic(''); setDescription(''); setDate(''); setTime(''); setMaxParams('');
      fetchSessions();
    } catch (err) { console.error(err); }
  };

  const requestJoin = async (sessionId: number) => {
    try {
      await fetch(`http://localhost:8080/api/sessions/${sessionId}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      fetchMyRequests();
    } catch (err) { console.error(err); }
  };

  const respondToRequest = async (requestId: number, sessionId: number, accept: boolean) => {
    try {
      await fetch(`http://localhost:8080/api/sessions/join-requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.id, accept })
      });
      fetchHostRequests(sessionId);
      fetchSessions();
    } catch {}
  };

  const sendNotification = async (sessionId: number) => {
    const msg = notifMsg[sessionId]?.trim();
    if (!msg) return;
    setSending(sessionId);
    try {
      const res = await fetch(`http://localhost:8080/api/sessions/${sessionId}/notify-participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.id, message: msg })
      });
      if (res.ok) {
        setNotifMsg(prev => ({ ...prev, [sessionId]: '' }));
      }
    } catch {}
    setSending(null);
  };

  const mySessions = sessions.filter(s =>
    s.hostUser.id === user.id ||
    (s.participantUsers && s.participantUsers.some((p: any) => p.id === user.id))
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Case-insensitive topic match against user's skills to learn
  const mightBeInterested = (session: any) =>
    userSkillsToLearn.some(skill => session.topic.toLowerCase().includes(skill.toLowerCase()));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING': return <span className="badge" style={{ background: 'var(--primary-color)', color: '#fff' }}>UPCOMING</span>;
      case 'ONGOING':  return <span className="badge" style={{ background: 'var(--secondary-color)', color: '#fff' }}>ONGOING</span>;
      case 'PAST':     return <span className="badge" style={{ background: '#8b949e', color: '#fff' }}>PAST</span>;
      default: return null;
    }
  };

  const toggleHostDetails = (sessionId: number) =>
    setShowHostDetails(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));

  const toggleManage = (sessionId: number) => {
    setShowManage(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
    fetchHostRequests(sessionId); // refresh when opening
  };

  return (
    <div>
      {/* ── My Upcoming Sessions: To-Do List ─────────────────── */}
      {mySessions.length > 0 && (
        <div className="card" style={{ marginBottom: '32px', borderColor: 'rgba(227,179,65,0.4)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <CheckSquare size={20} color="#e3b341" />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#e3b341' }}>My Upcoming Sessions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mySessions.map(s => {
              const d = new Date(s.dateTime);
              const isHost = s.hostUser.id === user.id;
              const isPast = d < new Date();
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '8px',
                  background: isPast ? 'rgba(139,148,158,0.08)' : 'rgba(227,179,65,0.06)',
                  border: '1px solid rgba(227,179,65,0.15)',
                  opacity: isPast ? 0.6 : 1,
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: isPast ? '#8b949e' : '#e3b341' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{s.topic}</div>
                    <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '2px' }}>
                      {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}<span style={{ color: isHost ? 'var(--secondary-color)' : 'var(--primary-color)' }}>{isHost ? 'Hosting' : 'Attending'}</span>
                      {isPast && <span style={{ color: '#8b949e', marginLeft: '8px' }}>[past]</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '8px' }}>Group Sessions</h2>
          <p className="page-subtitle" style={{ margin: 0 }}>Join collaborative learning sessions led by peers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={18} /> Host a Session
        </button>
      </div>

      {/* ── Create form ───────────────────────────────────────── */}
      {showCreate && (
        <div className="card" style={{ marginBottom: '32px', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Create New Session</h3>
          <form onSubmit={createSession} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Topic</label>
              <input type="text" className="form-input" value={topic} onChange={e => setTopic(e.target.value)} required placeholder="e.g. Introduction to Machine Learning" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What will you cover?" />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Max Participants <span style={{color: '#8b949e', fontWeight: 400}}>(optional)</span></label>
              <input type="number" min="1" className="form-input" value={maxParams} onChange={e => setMaxParams(parseInt(e.target.value) || '')} placeholder="Leave empty for unlimited" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Session</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Session Cards ─────────────────────────────────────── */}
      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Users size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No upcoming sessions</h3>
          <p style={{ color: '#8b949e', maxWidth: '400px', margin: '0 auto' }}>
            Be the first to host a group learning session on campus!
          </p>
        </div>
      ) : (
        <div className="grid">
          {sessions.map((session: any) => {
            const dateObj = new Date(session.dateTime);
            const isHost = session.hostUser.id === user.id;
            const isJoined = session.participantUsers && session.participantUsers.some((p: any) => p.id === user.id);
            const interested = mightBeInterested(session) && !isHost && !isJoined;
            
            const req = myRequests.find(r => r.session.id === session.id);
            const isPending = req?.status === 'PENDING';
            const isDeclined = req?.status === 'DECLINED';
            
            const isFull = session.maxParticipants != null && session.participantUsers.length >= session.maxParticipants;
            const pendingReqsForHost = hostRequests[session.id] || [];
            const isManageOpen = showManage[session.id] || false;
            const isHostDetailsOpen = showHostDetails[session.id] || false;
            const host = session.hostUser;

            return (
              <div key={session.id} className="card" style={{ borderColor: interested ? 'rgba(227,179,65,0.5)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>{session.topic}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {getStatusBadge(session.status)}
                  </div>
                </div>

                {interested && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(227,179,65,0.1)', border: '1px solid rgba(227,179,65,0.3)', borderRadius: '6px', padding: '6px 10px', marginBottom: '12px', fontSize: '12px', color: '#e3b341' }}>
                    <Star size={13} /> You might be interested — matches a skill you want to learn!
                  </div>
                )}

                <p style={{ fontSize: '14px', color: '#8b949e', marginBottom: '24px', minHeight: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                   {session.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9' }}>
                    <Calendar size={16} color="var(--primary-color)" /> {dateObj.toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9' }}>
                    <Clock size={16} color="var(--primary-color)" /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9' }}>
                    <Users size={16} color="var(--primary-color)" />
                    {session.participantUsers ? session.participantUsers.length : 0} {session.maxParticipants ? `/ ${session.maxParticipants}` : ''} Joined
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--secondary-color)', fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>
                      {host.username.charAt(0).toUpperCase()}
                    </span>
                    Host: {host.username}
                  </div>
                </div>

                {/* ── HOST VIEW ───────────────────────────────── */}
                {isHost ? (
                  <div>
                    {/* Manage Session Toggle */}
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => toggleManage(session.id)}
                    >
                      <Shield size={16} />
                      Manage Session
                      {isManageOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isManageOpen && (
                      <div style={{ background: 'rgba(13,17,23,0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                        
                        {/* Pending Join Requests */}
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                            Pending Join Requests
                          </p>
                          {pendingReqsForHost.length === 0 ? (
                            <div style={{ fontSize: '13px', color: '#8b949e' }}>No pending requests.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {pendingReqsForHost.map(r => (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(88,166,255,0.05)', borderRadius: '6px', padding: '8px 10px' }}>
                                  <span style={{ fontSize: '14px', color: '#c9d1d9' }}>{r.requester.username} wants to join</span>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => respondToRequest(r.id, session.id, true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-color)' }}><CheckCircle size={18} /></button>
                                    <button onClick={() => respondToRequest(r.id, session.id, false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149' }}><XCircle size={18} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Participants List */}
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                            Participants ({session.participantUsers?.length || 0})
                          </p>
                          {(!session.participantUsers || session.participantUsers.length === 0) ? (
                            <div style={{ fontSize: '13px', color: '#8b949e' }}>No participants yet.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {session.participantUsers.map((p: any) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(46,160,67,0.06)', borderRadius: '6px', padding: '8px 10px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(46,160,67,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--secondary-color)', flexShrink: 0 }}>
                                    {p.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#c9d1d9' }}>{p.username}</div>
                                    <div style={{ fontSize: '12px', color: '#8b949e' }}>{p.email}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Notify Participants */}
                        {session.participantUsers && session.participantUsers.length > 0 && (
                          <div>
                            <p style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                              Notify Participants
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                                placeholder="e.g. Venue changed to Room 204..."
                                value={notifMsg[session.id] || ''}
                                onChange={e => setNotifMsg(prev => ({ ...prev, [session.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && sendNotification(session.id)}
                              />
                              <button
                                className="btn btn-primary"
                                style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                onClick={() => sendNotification(session.id)}
                                disabled={sending === session.id || !notifMsg[session.id]?.trim()}
                              >
                                <Send size={14} />
                                {sending === session.id ? 'Sending...' : 'Send'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                /* ── JOINED (PARTICIPANT) VIEW ─────────────────── */
                ) : isJoined ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', opacity: 0.75, cursor: 'default' }}
                      disabled
                    >
                      ✅ Already Joined
                    </button>

                    {/* View Host Details toggle */}
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => toggleHostDetails(session.id)}
                    >
                      <Mail size={15} />
                      {isHostDetailsOpen ? 'Hide Host Details' : 'View Host Details'}
                      {isHostDetailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isHostDetailsOpen && (
                      <div style={{ background: 'rgba(46,160,67,0.07)', border: '1px solid rgba(46,160,67,0.25)', borderRadius: '8px', padding: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Host Contact</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#c9d1d9', marginBottom: '8px' }}>
                          <Mail size={14} color="var(--primary-color)" />
                          <a href={`mailto:${host.email}`} style={{ color: '#58a6ff', textDecoration: 'none' }}>{host.email}</a>
                        </div>
                        {host.linkedinUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <Linkedin size={14} color="#0a66c2" />
                            <a href={host.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>View LinkedIn</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                /* ── DEFAULT ACTIONS ────────────────────────────── */
                ) : isPending ? (
                  <button className="btn btn-outline" style={{ width: '100%', borderColor: '#e3b341', color: '#e3b341' }} disabled>Join Request Pending</button>
                ) : isDeclined ? (
                  <button className="btn btn-outline" style={{ width: '100%', borderColor: '#f85149', color: '#f85149' }} disabled>Request Declined</button>
                ) : isFull ? (
                  <button className="btn btn-outline" style={{ width: '100%', opacity: 0.5 }} disabled>Session Full</button>
                ) : session.status === 'PAST' ? (
                  <button className="btn btn-outline" style={{ width: '100%', opacity: 0.5 }} disabled>Session Ended</button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => requestJoin(session.id)}>
                    Request to Join
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
