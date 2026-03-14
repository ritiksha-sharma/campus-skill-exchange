import { useEffect, useState } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';

export default function NotificationBar({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${user.id}`);
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  const markRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'POST' });
      fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    await Promise.all(notifications.map(n => markRead(n.id)));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  const typeColor: Record<string, string> = {
    MATCH_FOUND: 'var(--primary-color)',
    MATCH_ACCEPTED: 'var(--secondary-color)',
    SESSION_REMINDER: '#e3b341',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9d1d9', padding: '6px', position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <Bell size={22} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            background: '#f85149', borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '11px', fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', width: '340px',
          background: '#161b22', border: '1px solid var(--border-color)',
          borderRadius: '12px', zIndex: 100, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>
              Notifications {unread > 0 && <span style={{ background: '#f85149', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', marginLeft: '6px' }}>{unread}</span>}
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all read" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCheck size={14} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8b949e', fontSize: '14px' }}>
                <Bell size={32} color="var(--border-color)" style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(48,54,61,0.5)',
                    background: n.isRead ? 'transparent' : 'rgba(88,166,255,0.04)',
                    cursor: n.isRead ? 'default' : 'pointer',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : typeColor[n.type] || 'var(--primary-color)', flexShrink: 0, marginTop: '5px' }} />
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: n.isRead ? '#8b949e' : '#c9d1d9', lineHeight: 1.4 }}>{n.message}</p>
                    <span style={{ fontSize: '11px', color: '#8b949e' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
