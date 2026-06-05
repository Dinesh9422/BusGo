import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../utils/api';

const TripTracker = () => {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(res => {
        const confirmed = (res.data.results || res.data).filter(b => b.status === 'CONFIRMED');
        setBookings(confirmed);
        if (confirmed.length > 0) setSelected(confirmed[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (booking) => {
    const tripDate = new Date(booking.trip_detail?.trip_date);
    const now = new Date();
    const departure = new Date(`${booking.trip_detail?.trip_date}T${booking.trip_detail?.schedule?.departure_time}`);
    const arrival = new Date(`${booking.trip_detail?.trip_date}T${booking.trip_detail?.schedule?.arrival_time}`);

    if (now < departure) return { status: 'upcoming', percent: 0, label: 'Upcoming' };
    if (now > arrival) return { status: 'completed', percent: 100, label: 'Completed' };

    const total = arrival - departure;
    const elapsed = now - departure;
    const percent = Math.min(Math.round((elapsed / total) * 100), 100);
    return { status: 'ongoing', percent, label: 'In Progress' };
  };

  const stages = [
    { icon: '🎫', label: 'Booked' },
    { icon: '⏳', label: 'Boarding Soon' },
    { icon: '🚌', label: 'In Transit' },
    { icon: '🏁', label: 'Arrived' },
  ];

  const getStage = (percent) => {
    if (percent === 0) return 0;
    if (percent < 10) return 1;
    if (percent < 100) return 2;
    return 3;
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
    </div>
  );

  return (
    <div style={{ padding: '32px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, marginBottom: 6 }}>📊 Trip Tracker</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Track your live journey status</p>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚌</div>
          <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>No Active Trips</h3>
          <p style={{ color: 'var(--text-muted)' }}>Book a trip to track your journey!</p>
        </div>
      ) : (
        <>
          {/* Trip Selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {bookings.map(b => (
              <button key={b.id} onClick={() => setSelected(b)} style={{
                padding: '8px 16px', borderRadius: 10, border: '2px solid',
                borderColor: selected?.id === b.id ? 'var(--primary)' : 'var(--border)',
                background: selected?.id === b.id ? 'var(--primary-glow)' : 'var(--surface)',
                color: selected?.id === b.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
              }}>
                {b.trip_detail?.schedule?.route?.source} → {b.trip_detail?.schedule?.route?.destination}
                <span style={{ marginLeft: 6, opacity: 0.7 }}>{b.trip_detail?.trip_date}</span>
              </button>
            ))}
          </div>

          {selected && (() => {
            const progress = getProgress(selected);
            const stage = getStage(progress.percent);

            return (
              <div>
                {/* Main Progress Card */}
                <div className="card" style={{ marginBottom: 20,
                  background: progress.status === 'ongoing'
                    ? 'linear-gradient(135deg, var(--primary-dark), var(--primary))'
                    : progress.status === 'completed'
                    ? 'linear-gradient(135deg, #065f46, #10b981)'
                    : 'linear-gradient(135deg, #1e3a5f, #1a3faa)',
                  color: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
                        {selected.trip_detail?.schedule?.bus?.bus_name}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                        {selected.trip_detail?.schedule?.route?.source} → {selected.trip_detail?.schedule?.route?.destination}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                        📅 {selected.trip_detail?.trip_date} &nbsp; 💺 Seat {selected.seat_detail?.seat_number}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>
                        {progress.status === 'completed' ? '✅' : progress.status === 'ongoing' ? '🚌' : '⏰'}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700,
                        background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20 }}>
                        {progress.label}
                      </div>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>DEPARTURE</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                        {selected.trip_detail?.schedule?.departure_time?.slice(0, 5)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>
                        {selected.trip_detail?.schedule?.route?.estimated_duration}
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' }}>
                        <div style={{ height: '100%', width: `${progress.percent}%`,
                          background: '#fdba74', borderRadius: 2, transition: 'width 1s ease' }} />
                        {progress.status === 'ongoing' && (
                          <div style={{ position: 'absolute', top: -8, left: `${progress.percent}%`,
                            transform: 'translateX(-50%)', fontSize: 20 }}>🚌</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                        {progress.percent}% completed
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>ARRIVAL</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                        {selected.trip_detail?.schedule?.arrival_time?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Tracker */}
                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 20, fontSize: 16 }}>Journey Stages</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%',
                      height: 3, background: 'var(--border)', borderRadius: 2, zIndex: 0 }}>
                      <div style={{ height: '100%', borderRadius: 2,
                        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                        width: `${(stage / 3) * 100}%`, transition: 'width 0.8s ease' }} />
                    </div>
                    {stages.map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%', margin: '0 auto 10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, transition: 'var(--transition)',
                          background: i <= stage ? 'var(--primary)' : 'var(--surface2)',
                          border: `3px solid ${i <= stage ? 'var(--primary)' : 'var(--border)'}`,
                          boxShadow: i === stage ? '0 0 0 4px var(--primary-glow)' : 'none',
                        }}>{s.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: i <= stage ? 700 : 400,
                          color: i <= stage ? 'var(--primary)' : 'var(--text-muted)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Route Map (Visual) */}
                <div className="card">
                  <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 16, fontSize: 16 }}>🗺️ Route Map</h3>
                  <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '24px',
                    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    {/* Map background grid */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
                      backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                      backgroundSize: '30px 30px' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Source */}
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, margin: '0 auto 8px',
                            boxShadow: '0 4px 12px var(--primary-glow)' }}>📍</div>
                          <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Sora, sans-serif' }}>
                            {selected.trip_detail?.schedule?.route?.source}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                            {selected.trip_detail?.schedule?.departure_time?.slice(0, 5)}
                          </div>
                        </div>

                        {/* Route Line */}
                        <div style={{ flex: 1, position: 'relative' }}>
                          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, borderRadius: 2,
                              background: `linear-gradient(90deg, var(--primary) ${progress.percent}%, transparent ${progress.percent}%)`,
                              transition: 'all 1s ease' }} />
                          </div>
                          {/* Bus icon on route */}
                          <div style={{ position: 'absolute', top: -14, left: `${Math.max(0, Math.min(progress.percent - 5, 90))}%`,
                            fontSize: 24, transition: 'left 1s ease',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                            {progress.status === 'completed' ? '✅' : '🚌'}
                          </div>
                          {/* Route info */}
                          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                            📏 {selected.trip_detail?.schedule?.route?.distance_km} km &nbsp;
                            ⏱️ {selected.trip_detail?.schedule?.route?.estimated_duration}
                          </div>
                        </div>

                        {/* Destination */}
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%',
                            background: progress.status === 'completed'
                              ? 'linear-gradient(135deg, #065f46, #10b981)'
                              : 'linear-gradient(135deg, #374151, #6b7280)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, margin: '0 auto 8px' }}>🏁</div>
                          <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Sora, sans-serif' }}>
                            {selected.trip_detail?.schedule?.route?.destination}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {selected.trip_detail?.schedule?.arrival_time?.slice(0, 5)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default TripTracker;