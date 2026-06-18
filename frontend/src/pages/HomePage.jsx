import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '⚡', title: 'Instant Booking', desc: 'Book your seat in under 2 minutes with our lightning-fast system.', color: '#3b5fe0' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Multiple payment options with bank-grade encryption.', color: '#10b981' },
  { icon: '📄', title: 'E-Tickets', desc: 'Get PDF tickets instantly via email & download anytime.', color: '#f97316' },
  { icon: '❌', title: 'Easy Cancellation', desc: 'Cancel anytime with hassle-free refund processing.', color: '#ef4444' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Book from any device — phone, tablet, or desktop.', color: '#8b5cf6' },
  { icon: '🎧', title: '24/7 Support', desc: 'Our team is always ready to help you with any issue.', color: '#06b6d4' },
];

const popularRoutes = [
  { from: 'Chennai', to: 'Bangalore', duration: '5h', price: 450, emoji: '🌆', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { from: 'Mumbai', to: 'Pune', duration: '3h', price: 280, emoji: '🏙️', bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { from: 'Delhi', to: 'Agra', duration: '4h', price: 320, emoji: '🕌', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { from: 'Hyderabad', to: 'Chennai', duration: '7h', price: 580, emoji: '🌴', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { from: 'Salem', to: 'Chennai', duration: '4h', price: 280, emoji: '🏔️', bg: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { from: 'Coimbatore', to: 'Chennai', duration: '6h', price: 420, emoji: '🏯', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
];

const stats = [
  { num: '500+', label: 'Routes', icon: '🗺️' },
  { num: '2M+', label: 'Happy Travelers', icon: '😊' },
  { num: '200+', label: 'Bus Operators', icon: '🚌' },
  { num: '50+', label: 'Cities', icon: '🏙️' },
];

const testimonials = [
  { name: 'Priya S.', city: 'Chennai', text: 'BusGo made my travel so easy! Booked tickets in 2 minutes. Amazing experience!', rating: 5, avatar: 'PS' },
  { name: 'Rahul M.', city: 'Mumbai', text: 'Best bus booking platform! Clean UI, instant confirmation, great service.', rating: 5, avatar: 'RM' },
  { name: 'Anitha K.', city: 'Bangalore', text: 'Love the seat selection feature! Just like movie ticket booking. 10/10!', rating: 5, avatar: 'AK' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: '', destination: '', travel_date: '' });
  const [visible, setVisible] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisible(prev => ({ ...prev, [e.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[id^="section-"]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.source || !form.destination || !form.travel_date) return;
    navigate(`/search?source=${form.source}&destination=${form.destination}&travel_date=${form.travel_date}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0e2878 40%, #1a3faa 70%, #2d54d4 100%)',
        padding: '80px 20px 0',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 580,
      }}>
        {/* Animated background circles */}
        {[
          { w: 400, h: 400, top: -150, right: -80, op: 0.04 },
          { w: 250, h: 250, bottom: 40, left: -60, op: 0.05 },
          { w: 180, h: 180, top: 80, left: '35%', op: 0.03 },
          { w: 120, h: 120, top: 40, right: '25%', op: 0.06 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255)', opacity: c.op,
            top: c.top, right: c.right, bottom: c.bottom, left: c.left,
            animation: `float ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}

        {/* Gradient overlay dots */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 24, padding: '8px 20px',
            }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>
                India's #1 Trusted Bus Booking Platform
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 68px)',
              color: '#fff', fontFamily: 'Sora, sans-serif',
              fontWeight: 800, marginBottom: 16, lineHeight: 1.1,
            }}>
              Travel Smarter,<br />
              <span style={{
                background: 'linear-gradient(135deg, #fdba74, #f97316)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Book Faster</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 18,
              maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
            }}>
              Search thousands of bus routes across India. Compare prices, pick your seat, and travel with confidence.
            </p>
          </div>

          {/* Search Box */}
          <div className="fade-in-up delay-2">
            <form onSubmit={handleSearch} style={{
              background: 'var(--surface)',
              borderRadius: 24, padding: '28px 32px',
              maxWidth: 900, margin: '0 auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 16, alignItems: 'end',
            }}>
              {[
                { label: '📍 From', key: 'source', ph: 'Enter source city', type: 'text' },
                { label: '🏁 To', key: 'destination', ph: 'Enter destination city', type: 'text' },
                { label: '📅 Travel Date', key: 'travel_date', ph: '', type: 'date' },
              ].map(({ label, key, ph, type }) => (
                <div key={key}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.8px', marginBottom: 8,
                  }}>{label}</label>
                  <input
                    type={type} placeholder={ph} required
                    min={type === 'date' ? today : undefined}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field"
                    style={{ fontSize: 15 }}
                  />
                </div>
              ))}
              <button type="submit" className="btn-accent"
                style={{ height: 50, fontSize: 15, paddingLeft: 28, paddingRight: 28, whiteSpace: 'nowrap' }}>
                Search 🔍
              </button>
            </form>
          </div>

          {/* Quick route chips */}
          <div className="fade-in-up delay-3" style={{ textAlign: 'center', marginTop: 24, paddingBottom: 32 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginRight: 12 }}>Popular:</span>
            {['Chennai→Bangalore', 'Salem→Chennai', 'Mumbai→Pune'].map(route => (
              <button key={route} onClick={() => {
                const [src, dst] = route.split('→');
                setForm({ ...form, source: src, destination: dst });
              }} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: '5px 14px',
                fontSize: 12, cursor: 'pointer', marginRight: 8, marginBottom: 8,
                transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
              }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
              >{route}</button>
            ))}
          </div>
        </div>

        {/* Animated Bus Road */}
        <div className="bus-road-container">
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
            background: 'rgba(255,255,255,0.15)',
          }} />
          <div className="road-lines" />
          <div className="animated-bus">🚌</div>
        </div>
      </div>

      {/* ===== STATS BAR ===== */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        padding: '24px 20px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 20, textAlign: 'center',
        }}>
          {stats.map(({ num, label, icon }, i) => (
            <div key={label} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fdba74', fontFamily: 'Sora, sans-serif' }}>{num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== POPULAR ROUTES ===== */}
      <div id="section-routes" className="section" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-glow)', borderRadius: 20,
            padding: '6px 16px', marginBottom: 12 }}>
            <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>🗺️ POPULAR ROUTES</span>
          </div>
          <h2 className="section-title">Most Searched Routes</h2>
          <p className="section-subtitle">Explore our top bus routes across India</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {popularRoutes.map(({ from, to, duration, price, emoji, bg }, i) => (
            <div key={`${from}-${to}`}
              className={`card card-hover ${visible['section-routes'] ? 'fade-in-up' : ''}`}
              style={{ cursor: 'pointer', animationDelay: `${i * 0.1}s`, opacity: visible['section-routes'] ? undefined : 0 }}
              onClick={() => navigate(`/search?source=${from}&destination=${to}`)}>
              <div style={{ height: 80, borderRadius: 12, background: bg, marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                {emoji}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Sora, sans-serif' }}>{from}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Origin</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{duration}</div>
                  <div style={{ height: 2, background: bg, borderRadius: 2 }} />
                  <div style={{ fontSize: 16, marginTop: 4 }}>🚌</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Sora, sans-serif' }}>{to}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Destination</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Sora, sans-serif' }}>
                  ₹{price}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface2)',
                  padding: '4px 10px', borderRadius: 20 }}>per seat</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div id="section-features" style={{ background: 'var(--surface2)', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'var(--primary-glow)', borderRadius: 20,
              padding: '6px 16px', marginBottom: 12 }}>
              <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>✨ WHY BUSGO</span>
            </div>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Designed for a stress-free travel experience</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map(({ icon, title, desc, color }, i) => (
              <div key={title}
                className={`card ${visible['section-features'] ? 'fade-in-up' : ''}`}
                style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  animationDelay: `${i * 0.1}s`,
                  opacity: visible['section-features'] ? undefined : 0,
                  borderLeft: `4px solid ${color}`,
                }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>{icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div id="section-testimonials" className="section" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-glow)', borderRadius: 20,
            padding: '6px 16px', marginBottom: 12 }}>
            <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>⭐ TESTIMONIALS</span>
          </div>
          <h2 className="section-title">What Our Travelers Say</h2>
          <p className="section-subtitle">Trusted by millions of happy travelers across India</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {testimonials.map(({ name, city, text, rating, avatar }, i) => (
            <div key={name}
              className={`card ${visible['section-testimonials'] ? 'fade-in-up' : ''}`}
              style={{ animationDelay: `${i * 0.15}s`, opacity: visible['section-testimonials'] ? undefined : 0 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {Array.from({ length: rating }).map((_, j) => (
                  <span key={j} style={{ fontSize: 16, color: '#f59e0b' }}>★</span>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                "{text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>{avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>📍 {city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA SECTION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #0e2878, #1a3faa, #3b5fe0)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 6s ease infinite',
        padding: '80px 20px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚌</div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(28px,4vw,42px)', fontFamily: 'Sora, sans-serif', marginBottom: 14 }}>
            Ready for Your Next Journey?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Join millions of happy travelers. Book your bus ticket now!
          </p>
          <button className="btn-accent" style={{ fontSize: 16, padding: '14px 40px' }}
            onClick={() => navigate('/search')}>
            Book Now →
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#080e1f', color: 'rgba(255,255,255,0.5)', padding: '48px 20px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚌</div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: 'Sora, sans-serif' }}>BusGo</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>Your Journey, Our Responsibility. Trusted by millions across India.</p>
            </div>
            {[
              { title: 'Quick Links', links: ['Home', 'Search Buses', 'My Bookings', 'About Us'] },
              { title: 'Support', links: ['Help Center', 'Cancellation Policy', 'Refund Policy', 'Contact Us'] },
              { title: 'Contact', links: ['support@busgo.com', '+91 1800-XXX-XXXX', 'Mon-Sun: 24/7', 'India 🇮🇳'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ color: '#fff', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{title}</div>
                {links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 6, cursor: 'pointer' }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, textAlign: 'center', fontSize: 13 }}>
            © 2024 BusGo. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
