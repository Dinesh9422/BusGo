import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, loyaltyAPI, reviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMED: { cls: 'badge-success', icon: '✅' },
    PENDING: { cls: 'badge-warning', icon: '⏳' },
    CANCELLED: { cls: 'badge-danger', icon: '❌' },
    COMPLETED: { cls: 'badge-info', icon: '🏁' }
  };
  const { cls, icon } = map[status] || { cls: 'badge-info', icon: '❓' };
  return <span className={`badge ${cls}`}>{icon} {status}</span>;
};

const StarRating = ({ rating, onRate }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map(star => (
      <span key={star} className={`star ${star <= rating ? 'filled' : 'empty'}`}
        onClick={() => onRate && onRate(star)}>★</span>
    ))}
  </div>
);

const SkeletonBooking = () => (
  <div className="card" style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '50%', height: 20, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '40%', height: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ width: 120, height: 38, borderRadius: 10 }} />
        <div className="skeleton" style={{ width: 80, height: 38, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [cancelling, setCancelling] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');

  // Review
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(res => setBookings(res.data.results || res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));

    loyaltyAPI.getPoints()
      .then(res => setLoyaltyData(res.data))
      .catch(() => {});
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await bookingAPI.cancelBooking(bookingId, 'User requested cancellation');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      toast.success('Booking cancelled. Refund will be processed shortly.');
    } catch {
      toast.error('Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const handleDownload = async (bookingId) => {
    setDownloading(bookingId);
    try {
      const res = await bookingAPI.downloadTicket(bookingId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `BusGo_Ticket_${bookingId}.pdf`;
      a.click();
      toast.success('Ticket downloaded! 🎫');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await reviewAPI.addReview({
        bus: reviewModal.busId,
        booking: reviewModal.bookingId,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted! ⭐');
      setReviewModal(null);
      setReviewComment('');
      setReviewRating(5);
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const filtered = bookingFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter.toUpperCase());

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    spent: bookings.filter(b => b.status === 'CONFIRMED').reduce((s, b) => s + parseFloat(b.fare_paid || 0), 0),
  };

  const loyaltyLevel = loyaltyData?.total_earned >= 500 ? 'Gold' :
    loyaltyData?.total_earned >= 200 ? 'Silver' : 'Bronze';
  const loyaltyColors = { Gold: '#f59e0b', Silver: '#94a3b8', Bronze: '#b45309' };
  const loyaltyNextLevel = loyaltyData?.total_earned >= 500 ? null :
    loyaltyData?.total_earned >= 200 ? 500 : 200;

  const mainTabs = [
    { key: 'bookings', label: 'My Bookings', icon: '🎫' },
    { key: 'loyalty', label: 'Loyalty Points', icon: '🏆' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, marginBottom: 4 }}>My Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Welcome back, <strong style={{ color: 'var(--primary)' }}>{user?.first_name}</strong>! 👋
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {loyaltyData && (
              <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: `${loyaltyColors[loyaltyLevel]}22`, color: loyaltyColors[loyaltyLevel],
                border: `1px solid ${loyaltyColors[loyaltyLevel]}44` }}>
                {loyaltyLevel === 'Gold' ? '🥇' : loyaltyLevel === 'Silver' ? '🥈' : '🥉'} {loyaltyLevel} Member
              </div>
            )}
            <div style={{ width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              boxShadow: '0 4px 16px var(--primary-glow)' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-in-up delay-1" style={{ display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Bookings', val: stats.total, icon: '🎫', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
            { label: 'Confirmed', val: stats.confirmed, icon: '✅', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
            { label: 'Cancelled', val: stats.cancelled, icon: '❌', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
            { label: 'Total Spent', val: `₹${stats.spent.toFixed(0)}`, icon: '💰', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
            { label: 'Loyalty Pts', val: loyaltyData?.points || 0, icon: '🏆', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
          ].map(({ label, val, icon, gradient }) => (
            <div key={label} style={{ background: 'var(--surface)', borderRadius: 18, padding: '18px 20px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              transition: 'var(--transition)', cursor: 'default', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                borderRadius: '50%', background: gradient, opacity: 0.1 }} />
              <div style={{ width: 40, height: 40, borderRadius: 12, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <div className="fade-in-up delay-2" style={{ display: 'flex', gap: 6, marginBottom: 24,
          background: 'var(--surface)', padding: 6, borderRadius: 16,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          {mainTabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: '10px 16px', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'var(--transition)',
              background: activeTab === t.key ? 'var(--primary)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20 }}>My Bookings</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'confirmed', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setBookingFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                    background: bookingFilter === f ? 'var(--primary)' : 'var(--surface2)',
                    color: bookingFilter === f ? '#fff' : 'var(--text-muted)',
                  }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>

            {loading && [1, 2, 3].map(i => <SkeletonBooking key={i} />)}

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }} className="float">🎫</div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, marginBottom: 8 }}>No Bookings Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Start your journey!</p>
                <a href="/search" className="btn-primary" style={{ display: 'inline-flex' }}>🔍 Search Buses</a>
              </div>
            )}

            {!loading && filtered.map((booking, i) => (
              <div key={booking.id} className="fade-in-up"
                style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px',
                  background: 'var(--surface2)', marginBottom: 14, transition: 'var(--transition)',
                  animationDelay: `${i * 0.06}s`, opacity: 0,
                  borderLeft: booking.status === 'CONFIRMED' ? '4px solid var(--success)'
                    : booking.status === 'CANCELLED' ? '4px solid var(--danger)'
                    : '4px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'Sora, sans-serif', fontSize: 16 }}>
                        {booking.trip_detail?.schedule?.route?.source} → {booking.trip_detail?.schedule?.route?.destination}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
                      {[
                        { icon: '📅', val: booking.trip_detail?.trip_date },
                        { icon: '🕐', val: booking.trip_detail?.schedule?.departure_time?.slice(0, 5) },
                        { icon: '💺', val: `Seat ${booking.seat_detail?.seat_number}` },
                        { icon: '🚌', val: booking.trip_detail?.schedule?.bus?.bus_name },
                      ].map(({ icon, val }) => val && (
                        <span key={icon} style={{ fontSize: 13, color: 'var(--text-muted)' }}>{icon} {val}</span>
                      ))}
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>₹{booking.fare_paid}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                      ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>{booking.booking_id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button onClick={() => handleDownload(booking.id)}
                          disabled={downloading === booking.id} className="btn-secondary"
                          style={{ padding: '8px 14px', fontSize: 12 }}>
                          {downloading === booking.id ? '⏳' : '📄'} Ticket
                        </button>
                        <button onClick={() => setReviewModal({
                          busId: booking.trip_detail?.schedule?.bus?.id,
                          bookingId: booking.id,
                          busName: booking.trip_detail?.schedule?.bus?.bus_name,
                        })} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
                          ⭐ Review
                        </button>
                        <button onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, fontWeight: 600,
                            border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent',
                            color: 'var(--danger)', cursor: 'pointer', transition: 'var(--transition)' }}>
                          {cancelling === booking.id ? '⏳' : '❌'} Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loyalty Points Tab */}
        {activeTab === 'loyalty' && (
          <div className="fade-in">
            {/* Level Card */}
            <div style={{ background: `linear-gradient(135deg, ${loyaltyColors[loyaltyLevel]}, ${loyaltyColors[loyaltyLevel]}99)`,
              borderRadius: 20, padding: '28px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150,
                borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {loyaltyLevel === 'Gold' ? '🥇' : loyaltyLevel === 'Silver' ? '🥈' : '🥉'}
              </div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 26, marginBottom: 4 }}>
                {loyaltyLevel} Member
              </h2>
              <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
                {loyaltyData?.points || 0}
              </div>
              <div style={{ fontSize: 14, opacity: 0.85 }}>Available Points • Worth ₹{((loyaltyData?.points || 0) / 10).toFixed(0)}</div>
              {loyaltyNextLevel && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                    {loyaltyNextLevel - (loyaltyData?.total_earned || 0)} more points to next level
                  </div>
                  <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="progress-fill" style={{
                      width: `${Math.min(((loyaltyData?.total_earned || 0) / loyaltyNextLevel) * 100, 100)}%`,
                      background: 'rgba(255,255,255,0.8)'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Available', val: loyaltyData?.points || 0, icon: '⭐', color: '#f59e0b' },
                { label: 'Total Earned', val: loyaltyData?.total_earned || 0, icon: '📈', color: '#10b981' },
                { label: 'Redeemed', val: loyaltyData?.total_redeemed || 0, icon: '🎁', color: '#8b5cf6' },
              ].map(({ label, val, icon, color }) => (
                <div key={label} className="card" style={{ textAlign: 'center', padding: '18px 14px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif', color, marginBottom: 4 }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Transaction History */}
            <div className="card">
              <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 16, fontSize: 18 }}>Transaction History</h3>
              {loyaltyData?.transactions?.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                  <p>No transactions yet. Book a trip to earn points!</p>
                </div>
              )}
              {loyaltyData?.transactions?.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '12px 0',
                  borderBottom: i < loyaltyData.transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16,
                    color: t.type === 'EARNED' ? 'var(--success)' : 'var(--danger)',
                    fontFamily: 'Sora, sans-serif' }}>
                    {t.type === 'EARNED' ? '+' : ''}{t.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card fade-in">
            <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 24, fontSize: 20 }}>My Profile</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28,
              padding: '20px', background: 'var(--surface2)', borderRadius: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: 'Sora, sans-serif',
                boxShadow: '0 4px 16px var(--primary-glow)', flexShrink: 0 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>📧 {user?.email}</div>
                {user?.phone && <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>📱 {user?.phone}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'First Name', val: user?.first_name },
                { label: 'Last Name', val: user?.last_name },
                { label: 'Email', val: user?.email },
                { label: 'Username', val: user?.username },
                { label: 'Phone', val: user?.phone || 'Not set' },
                { label: 'Member Since', val: new Date(user?.date_joined).toLocaleDateString('en-IN') },
              ].map(({ label, val }) => (
                <div key={label} style={{ padding: '12px 16px', background: 'var(--surface2)',
                  borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20 }} className="fade-in">
          <div className="card scale-in" style={{ maxWidth: 440, width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>Rate Your Experience</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              {reviewModal.busName}
            </p>
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <StarRating rating={reviewRating} onRate={setReviewRating} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
              </div>
            </div>
            <textarea placeholder="Share your experience (optional)..."
              value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              className="input-field" rows={3}
              style={{ resize: 'none', marginBottom: 20, fontSize: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setReviewModal(null)}
                style={{ flex: 1, justifyContent: 'center', padding: 12 }}>Cancel</button>
              <button className="btn-primary" onClick={handleReviewSubmit} disabled={reviewLoading}
                style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
                {reviewLoading ? '⏳' : '⭐ Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;