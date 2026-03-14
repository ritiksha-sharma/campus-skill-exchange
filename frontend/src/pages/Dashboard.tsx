import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { PlusCircle, BookOpen, GraduationCap } from 'lucide-react';

export default function Dashboard({ user }: { user: any }) {
  if (!user) return <Navigate to="/" />;

  const [skillsToTeach, setSkillsToTeach] = useState<any[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<any[]>([]);
  
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSkillsToTeach(data.skillsToTeach || []);
        setSkillsToLearn(data.skillsToLearn || []);
      }
    } catch (err) {
      console.error("Could not fetch profile", err);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchProfile();
    }
  }, [user]);

  const addTeachSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachSkill) return;
    try {
      await fetch(`http://localhost:8080/api/users/${user.id}/skills/teach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: newTeachSkill })
      });
      setNewTeachSkill('');
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const addLearnSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearnSkill) return;
    try {
      await fetch(`http://localhost:8080/api/users/${user.id}/skills/learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: newLearnSkill })
      });
      setNewLearnSkill('');
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Manage your skills profile</p>

      <div className="grid">
        {/* Teach Skills */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(88, 166, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <GraduationCap size={24} color="var(--primary-color)" />
            </div>
            <h3 style={{ fontSize: '20px' }}>I can teach</h3>
          </div>
          
          <form onSubmit={addTeachSkill} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. React" 
              value={newTeachSkill}
              onChange={(e) => setNewTeachSkill(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
              <PlusCircle size={20} />
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsToTeach.map(s => (
              <span key={s.id} className="badge">
                {s.name}
              </span>
            ))}
            {skillsToTeach.length === 0 && <span style={{ color: '#8b949e', fontSize: '14px' }}>No skills added yet</span>}
          </div>
        </div>

        {/* Learn Skills */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(46, 160, 67, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <BookOpen size={24} color="var(--secondary-color)" />
            </div>
            <h3 style={{ fontSize: '20px' }}>I want to learn</h3>
          </div>
          
          <form onSubmit={addLearnSkill} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Python" 
              value={newLearnSkill}
              onChange={(e) => setNewLearnSkill(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0 16px' }}>
              <PlusCircle size={20} />
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsToLearn.map(s => (
              <span key={s.id} className="badge badge-secondary">
                {s.name}
              </span>
            ))}
            {skillsToLearn.length === 0 && <span style={{ color: '#8b949e', fontSize: '14px' }}>No skills added yet</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
