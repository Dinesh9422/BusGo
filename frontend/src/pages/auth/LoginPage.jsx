import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.first_name}! 🎉`);
      navigate(user.is_staff ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0e2878 50%, #1a3faa 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background circles */}
      {[
        { w: 400, h: 400, top: -150, right: -100, op: 0.05 },
        { w: 250, h: 250, bottom: -80, left: -60, op: 0.06 },
        { w: 150, h: 150, top: '30%', left: '10%', op: 0.04 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255)', opacity: c.op,
          top: c.top, right: c.right, bottom: c.bottom, left: c.left,
        }} />
      ))}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        maxWidth: 900, width: '100%',
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        position: 'relative', zIndex: 2,
      }} className="fade-in-up">

        {/* Left Panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '56px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 52, marginBottom: 20 }} className="float">🚌</div>
          <h2 style={{ color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: 30, marginBottom: 12 }}>
            Welcome Back!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 36, fontSize: 15 }}>
            Sign in to access your bookings and manage your trips seamlessly.
          </p>
          {[
            '🎫 View & manage all bookings',
            '📄 Download PDF tickets instantly',
            '❌ Cancel & get easy refunds',
            '📧 Real-time email notifications',
            '💺 Smart seat selection',
          ].map(f => (
            <div key={f} style={{
              color: 'rgba(255,255,255,0.8)', fontSize: 14,
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
            }}>{f}</div>
          ))}
          <div style={{ marginTop: 36, padding: '16px 20px',
            background: 'rgba(255,255,255,0.06)', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>Don't have an account?</p>
            <Link to="/register" style={{ color: '#fdba74', fontWeight: 700, fontSize: 14 }}>
              Create free account →
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ background: 'var(--surface)', padding: '56px 40px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, marginBottom: 6 }}>Sign In</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13,
                color: 'var(--text)', marginBottom: 8 }}>📧 Email Address</label>
              <input type="email" placeholder="you@example.com" required
                className="input-field" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13,
                color: 'var(--text)', marginBottom: 8 }}>🔒 Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} placeholder="Your password"
                  required className="input-field" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                }}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <Link to="/register" className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14 }}>
            Create New Account 🎉
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;