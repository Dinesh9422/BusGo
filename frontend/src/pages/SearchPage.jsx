import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { busAPI } from '../utils/api';
import toast from 'react-hot-toast';

const BUS_TYPES = ['', 'AC_SEATER', 'NON_AC_SEATER', 'AC_SLEEPER', 'NON_AC_SLEEPER', 'LUXURY', 'VOLVO'];
const BUS_TYPE_LABELS = {
  '': 'All Types', AC_SEATER: 'AC Seater', NON_AC_SEATER: 'Non-AC Seater',
  AC_SLEEPER: 'AC Sleeper', NON_AC_SLEEPER: 'Non-AC Sleeper', LUXURY: 'Luxury', VOLVO: 'Volvo'
};

const SkeletonCard = () => (
  <div className="card" style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 10 }} />
        <div className="skeleton skeleton-title" style={{ width: '60%', marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 20 }} />
          <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 20 }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 50, height: 14 }} />
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="skeleton" style={{ width: 80, height: 36, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 70, height: 14, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const TripCard = ({ trip, onSelect, index }) => {
  const s = trip.schedule;
  const isLowSeats = trip.available_seats < 5;
  const busTypeColors = {
    AC_SEATER: '#3b5fe0', NON_AC_SEATER: '#64748b',
    AC_SLEEPER: '#8b5cf6', NON_AC_SLEEPER: '#06b6d4',
    LUXURY: '#f59e0b', VOLVO: '#10b981',
  };
  const typeColor = busTypeColors[s.bus?.bus_type] || '#3b5fe0';

  return (
    <div className="card card-hover fade-in-up"
      style={{ marginBottom: 16, animationDelay: `${index * 0.08}s`, opacity: 0,
        borderLeft: `4px solid ${typeColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>

        {/* Bus Info */}
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
            {s.bus?.operator?.name || 'BusGo Travels'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            {s.bus?.bus_name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{
              background: `${typeColor}18`, color: typeColor,
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>
              {BUS_TYPE_LABELS[s.bus?.bus_type] || s.bus?.bus_type}
            </span>
            {s.bus?.amenities?.slice(0, 3).map(a => (
              <span key={a} style={{
                background: 'var(--surface2)', color: 'var(--text-muted)',
                padding: '3px 8px', borderRadius: 20, fontSize: 11,
              }}>• {a}</span>
            ))}
          </div>
        </div>

        {/* Route & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text)' }}>
              {s.departure_time?.slice(0, 5)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {s.route?.source}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              ⏱ {s.route?.estimated_duration}
            </div>
            <div style={{ position: 'relative', height: 2, background: 'var(--border)', borderRadius: 2 }}>
              <div style={{
                position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
                fontSize: 16,
              }}>🚌</div>
              <div style={{
                height: '100%', width: '60%',
                background: `linear-gradient(90deg, ${typeColor}, transparent)`,
                borderRadius: 2,
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Direct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text)' }}>
              {s.arrival_time?.slice(0, 5)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {s.route?.destination}
            </div>
          </div>
        </div>

        {/* Price & Book */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Sora, sans-serif' }}>
            ₹{s.fare}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600, marginBottom: 12,
            color: isLowSeats ? 'var(--danger)' : 'var(--success)',
          }}>
            {isLowSeats ? '🔥' : '✅'} {trip.available_seats} seats left
          </div>
          <button className="btn-primary" onClick={() => onSelect(trip)}
            style={{ padding: '10px 24px', fontSize: 14 }}>
            Select Seats →
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busType, setBusType] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({
    source: searchParams.get('source') || '',
    destination: searchParams.get('destination') || '',
    travel_date: searchParams.get('travel_date') || new Date().toISOString().split('T')[0],
  });

  const search = async () => {
    if (!form.source || !form.destination || !form.travel_date) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = { ...form };
      if (busType) params.bus_type = busType;
      const res = await busAPI.searchTrips(params);
      setTrips(res.data);
      if (res.data.length === 0) toast('No buses found for this route.', { icon: '🔍' });
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.source && form.destination && form.travel_date) search();
  }, []);

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'price') return a.schedule.fare - b.schedule.fare;
    if (sortBy === 'seats') return b.available_seats - a.available_seats;
    if (sortBy === 'departure') return a.schedule.departure_time.localeCompare(b.schedule.departure_time);
    return 0;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Search Bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        padding: '24px 20px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, alignItems: 'flex-end' }}>
            {[
              { key: 'source', label: '📍 From', ph: 'Source city', type: 'text' },
              { key: 'destination', label: '🏁 To', ph: 'Destination city', type: 'text' },
              { key: 'travel_date', label: '📅 Date', ph: '', type: 'date' },
            ].map(({ key, label, ph, type }) => (
              <div key={key}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)',
                  fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </label>
                <input type={type} placeholder={ph}
                  value={form[key]} min={type === 'date' ? today : undefined}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.95)', fontSize: 14 }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)',
                fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🚌 Bus Type
              </label>
              <select value={busType} onChange={e => setBusType(e.target.value)}
                className="input-field"
                style={{ background: 'rgba(255,255,255,0.95)', fontSize: 14 }}>
                {BUS_TYPES.map(t => <option key={t} value={t}>{BUS_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <button className="btn-accent" onClick={search}
              style={{ height: 50, padding: '0 28px', fontSize: 15, whiteSpace: 'nowrap' }}>
              {loading ? '⏳' : '🔍 Search'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        {/* Results Header */}
        {searched && !loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20 }}>
                {trips.length > 0 ? `${trips.length} Bus${trips.length > 1 ? 'es' : ''} Found` : 'No Buses Found'}
              </h2>
              {form.source && form.destination && (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {form.source} → {form.destination} • {form.travel_date}
                </p>
              )}
            </div>
            {trips.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
                {[['price', '💰 Price'], ['seats', '💺 Seats'], ['departure', '🕐 Time']].map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                    background: sortBy === val ? 'var(--primary)' : 'var(--surface)',
                    color: sortBy === val ? '#fff' : 'var(--text-muted)',
                    boxShadow: sortBy === val ? 'var(--shadow)' : 'none',
                    border: sortBy === val ? 'none' : '1px solid var(--border)',
                  }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="fade-in">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Trip Cards */}
        {!loading && sortedTrips.length > 0 && (
          <div>
            {sortedTrips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i}
                onSelect={() => navigate(`/book/${trip.id}`)} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && trips.length === 0 && (
          <div className="card fade-in-up" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚌</div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, marginBottom: 8 }}>No Buses Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Try a different date or route
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        )}

        {/* Initial State */}
        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }} className="float">🔍</div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, marginBottom: 8 }}>
              Search for Buses
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Enter your source, destination and date above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;