import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const notifIcons = {
    BOOKING: '🎫', PAYMENT: '💳', CANCELLATION: '❌', PROMO: '🎟️', REMINDER: '🔔'
  };

  return (
    <>
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrolled ? 'var(--shadow)' : 'none',
        transition: 'var(--transition)', height: 64,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)', fontSize: 20, flexShrink: 0,
            }}>🚌</div>
            <div>
              <div style={{
                fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>BusGo</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1 }}>
                Book Smarter
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { path: '/', label: '🏠 Home' },
              { path: '/search', label: '🔍 Search Buses' },
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: isActive(path) ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive(path) ? 'var(--primary-glow)' : 'transparent',
                transition: 'var(--transition)', textDecoration: 'none',
              }}>{label}</Link>
            ))}
            {user && (
              <>
                <Link to="/dashboard" style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive('/dashboard') ? 'var(--primary-glow)' : 'transparent',
                  transition: 'var(--transition)', textDecoration: 'none',
                }}>🎫 My Bookings</Link>
                <Link to="/tracker" style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  color: isActive('/tracker') ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive('/tracker') ? 'var(--primary-glow)' : 'transparent',
                  transition: 'var(--transition)', textDecoration: 'none',
                }}>📊 Trip Tracker</Link>
              </>
            )}
            {user?.is_staff && (
              <Link to="/admin" style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: '#f97316', background: 'rgba(249,115,22,0.08)',
                textDecoration: 'none', transition: 'var(--transition)',
              }}>⚙️ Admin</Link>
            )}
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Dark Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{darkMode ? '🌙' : '☀️'}</span>
              <button className={`dark-toggle ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode" />
            </div>

            {/* Notification Bell */}
            {user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <div className="notification-bell" onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) loadNotifications();
                }}>
                  🔔
                  {unreadCount > 0 && (
                    <div className="notification-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>

                {notifOpen && (
                  <div className="scale-in" style={{
                    position: 'absolute', top: 48, right: 0,
                    width: 340, background: 'var(--surface)',
                    borderRadius: 16, border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)', zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Sora, sans-serif' }}>
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{ marginLeft: 8, background: 'var(--danger)',
                            color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{
                          background: 'none', border: 'none', color: 'var(--primary)',
                          fontSize: 12, cursor: 'pointer', fontWeight: 600,
                        }}>Mark all read</button>
                      )}
                    </div>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                          <p style={{ fontSize: 14 }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{
                            padding: '12px 18px',
                            background: n.is_read ? 'transparent' : 'var(--primary-glow)',
                            borderBottom: '1px solid var(--border)',
                            transition: 'var(--transition)', cursor: 'pointer',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                            onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--primary-glow)'}
                            onClick={async () => {
                              if (!n.is_read) {
                                await notificationAPI.markRead(n.id);
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              }
                            }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div style={{ fontSize: 20, flexShrink: 0 }}>{notifIcons[n.type] || '🔔'}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 13, marginBottom: 3 }}>{n.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{n.created_at}</div>
                              </div>
                              {!n.is_read && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%',
                                  background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                      <Link to="/dashboard" onClick={() => setNotifOpen(false)}
                        style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                  boxShadow: '0 2px 8px var(--primary-glow)', flexShrink: 0,
                }}>
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <button onClick={handleLogout} className="btn-ghost hide-mobile"
                  style={{ padding: '7px 16px', fontSize: 13, color: 'var(--danger)',
                    borderColor: 'rgba(239,68,68,0.2)' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="hide-mobile" style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }}>Login</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {[
          { path: '/', icon: '🏠', label: 'Home' },
          { path: '/search', icon: '🔍', label: 'Search' },
          { path: '/tracker', icon: '📊', label: 'Tracker' },
          { path: '/dashboard', icon: '🎫', label: 'Bookings' },
        ].map(({ path, icon, label }) => (
          <Link key={path} to={path} className={`mobile-nav-item ${isActive(path) ? 'active' : ''}`}>
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;