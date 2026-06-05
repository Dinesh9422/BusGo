import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    username: '', phone: '', password: '', password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to BusGo 🎉');
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach(e => toast.error(Array.isArray(e) ? e[0] : e));
      } else {
        toast.error('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', ph = '', icon = '') => (
    <div>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text)' }}>
        {icon} {label}
      </label>
      <input type={type} placeholder={ph} required className="input-field"
        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  const strengthScore = () => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strengthColors = ['#ef4444', '#f59e0b', '#10b981', '#10b981'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const score = strengthScore();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0e2878 50%, #1a3faa 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {[
        { w: 350, h: 350, top: -100, right: -80, op: 0.05 },
        { w: 200, h: 200, bottom: -60, left: -40, op: 0.06 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255)', opacity: c.op,
          top: c.top, right: c.right, bottom: c.bottom, left: c.left,
        }} />
      ))}

      <div style={{
        background: 'var(--surface)', borderRadius: 28, padding: '48px 40px',
        maxWidth: 560, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        position: 'relative', zIndex: 2,
      }} className="fade-in-up scale-in">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }} className="bounce-in">🚌</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, marginBottom: 6 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step >= s ? 'var(--primary)' : 'var(--border)',
                  color: step >= s ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, transition: 'var(--transition)',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 13, fontWeight: step === s ? 600 : 400,
                  color: step === s ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {s === 1 ? 'Personal Info' : 'Account Setup'}
                </span>
              </div>
              {i < 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 12px',
                  background: step > 1 ? 'var(--primary)' : 'var(--border)',
                  transition: 'var(--transition)', borderRadius: 2 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {field('First Name', 'first_name', 'text', 'John', '👤')}
                {field('Last Name', 'last_name', 'text', 'Doe', '👤')}
              </div>
              <div style={{ marginBottom: 16 }}>
                {field('Phone Number', 'phone', 'tel', '+91 9876543210', '📱')}
              </div>
              <button type="button" className="btn-primary"
                onClick={() => {
                  if (!form.first_name || !form.last_name || !form.phone) {
                    toast.error('Please fill all fields!'); return;
                  }
                  setStep(2);
                }}
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div style={{ marginBottom: 16 }}>
                {field('Email Address', 'email', 'email', 'john@example.com', '📧')}
              </div>
              <div style={{ marginBottom: 16 }}>
                {field('Username', 'username', 'text', 'johndoe123', '🏷️')}
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>🔒 Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters"
                    required className="input-field" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                  }}>{showPwd ? '🙈' : '👁️'}</button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= score ? strengthColors[score-1] : 'var(--border)',
                          transition: 'var(--transition)',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: strengthColors[score-1] || 'var(--text-muted)', fontWeight: 600 }}>
                      {form.password ? strengthLabels[score-1] || 'Enter password' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>🔒 Confirm Password</label>
                <input type="password" placeholder="Repeat password" required
                  className="input-field" value={form.password2}
                  onChange={e => setForm({ ...form, password2: e.target.value })}
                  style={{ borderColor: form.password2 && form.password !== form.password2 ? 'var(--danger)' : undefined }} />
                {form.password2 && form.password !== form.password2 && (
                  <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>❌ Passwords don't match</p>
                )}
                {form.password2 && form.password === form.password2 && (
                  <p style={{ color: 'var(--success)', fontSize: 12, marginTop: 4 }}>✅ Passwords match</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}
                  style={{ padding: '13px 20px', fontSize: 14 }}>← Back</button>
                <button type="submit" className="btn-primary" disabled={loading}
                  style={{ flex: 1, justifyContent: 'center', padding: 13, fontSize: 15 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                        display: 'inline-block' }} />
                      Creating...
                    </span>
                  ) : 'Create Account 🎉'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;