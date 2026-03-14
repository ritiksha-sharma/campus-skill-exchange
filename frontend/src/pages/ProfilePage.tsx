import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Linkedin, Book, Users, Star, CheckCircle } from 'lucide-react';

export default function ProfilePage({ user }: { user: any }) {
  if (!user) return <Navigate to="/" />;

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}/profile`);
      if (res.ok) setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  if (!profile) return <div style={{ textAlign: 'center', padding: '64px', color: '#8b949e' }}>Loading profile...</div>;

  return (
    <div>
      <h2 className="page-title" style={{ marginBottom: '8px' }}>My Profile</h2>
      <p className="page-subtitle" style={{ marginBottom: '32px' }}>Manage your details and view your Campus Skill Exchange activity</p>

      <div className="grid">
        {/* Left Column: Info & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* User Info Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800 }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>{profile.username}</h3>
                <p style={{ margin: 0, color: '#8b949e', fontSize: '14px' }}>Campus Student</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c9d1d9', fontSize: '15px' }}>
                <Mail size={16} color="var(--primary-color)" /> {profile.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c9d1d9', fontSize: '15px' }}>
                <Linkedin size={16} color="#0a66c2" /> 
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>View Profile</a>
                ) : (
                  <span style={{ color: '#8b949e' }}>Not provided</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c9d1d9', fontSize: '15px' }}>
                <CheckCircle size={16} color="var(--secondary-color)" /> {profile.acceptedMatches} Accepted Matches
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="var(--primary-color)" /> My Skills
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b949e', marginBottom: '8px' }}>Can Teach</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skillsToTeach.length > 0 ? profile.skillsToTeach.map((s: any) => (
                  <span key={s.id} className="badge badge-primary">{s.name}</span>
                )) : <span style={{ color: '#8b949e', fontSize: '14px' }}>None added</span>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b949e', marginBottom: '8px' }}>Want to Learn</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skillsToLearn.length > 0 ? profile.skillsToLearn.map((s: any) => (
                  <span key={s.id} className="badge badge-secondary">{s.name}</span>
                )) : <span style={{ color: '#8b949e', fontSize: '14px' }}>None added</span>}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Book size={18} color="var(--secondary-color)" /> Sessions Hosted ({profile.sessionsHosted.length})
            </h3>
            {profile.sessionsHosted.length === 0 ? (
              <p style={{ color: '#8b949e', fontSize: '14px', margin: 0 }}>You haven't hosted any sessions yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.sessionsHosted.map((s: any) => {
                   const d = new Date(s.dateTime);
                   const isPast = d < new Date();
                   return (
                     <div key={s.id} style={{ padding: '12px', background: 'rgba(13,17,23,0.5)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: isPast ? 0.6 : 1 }}>
                       <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{s.topic}</div>
                       <div style={{ fontSize: '12px', color: '#8b949e' }}>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                       <div style={{ fontSize: '12px', marginTop: '6px' }}>
                         <span className="badge badge-secondary" style={{ padding: '2px 6px', fontSize: '10px' }}>{s.participantUsers?.length || 0} Joined</span>
                       </div>
                     </div>
                   );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#e3b341" /> Sessions Attending ({profile.sessionsAttending.length})
            </h3>
            {profile.sessionsAttending.length === 0 ? (
              <p style={{ color: '#8b949e', fontSize: '14px', margin: 0 }}>You aren't attending any sessions yet.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.sessionsAttending.map((s: any) => {
                   const d = new Date(s.dateTime);
                   const isPast = d < new Date();
                   return (
                     <div key={s.id} style={{ padding: '12px', background: 'rgba(13,17,23,0.5)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: isPast ? 0.6 : 1 }}>
                       <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{s.topic}</div>
                       <div style={{ fontSize: '12px', color: '#8b949e' }}>Host: {s.hostUser.username}</div>
                       <div style={{ fontSize: '12px', color: '#8b949e' }}>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                     </div>
                   );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
