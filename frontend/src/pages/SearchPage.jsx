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
      style={{ marginBottom: 16, animationDelay: `${index * 0.08}s`, opacity: 0, borderLeft: `4px solid ${typeColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
            {s.bus?.operator?.name || 'BusGo Travels'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: 'Sora, sans-serif', marginBottom: 8, color: 'var(--text)' }}>
            {s.bus?.bus_name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ background: `${typeColor}18`, color: typeColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              {BUS_TYPE_LABELS[s.bus?.bus_type] || s.bus?.bus_type}
            </span>
            {s.bus?.amenities?.slice(0, 2).map(a => (
              <span key={a} style={{ background: 'var(--surface2)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 20, fontSize: 11 }}>• {a}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text)' }}>{s.departure_time?.slice(0, 5)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.route?.source}</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 70 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>⏱ {s.route?.estimated_duration}</div>
            <div style={{ position: 'relative', height: 2, background: 'var(--border)', borderRadius: 2 }}>
              <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>🚌</div>
              <div style={{ height: '100%', width: '60%', background: `linear-gradient(90deg, ${typeColor}, transparent)`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Direct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Sora, sans-serif', color: 'var(--text)' }}>{s.arrival_time?.slice(0, 5)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.route?.destination}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Sora, sans-serif' }}>₹{s.fare}</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: isLowSeats ? 'var(--danger)' : 'var(--success)' }}>
            {isLowSeats ? '🔥' : '✅'} {trip.available_seats} seats left
          </div>
          <button className="btn-primary" onClick={() => onSelect(trip)} style={{ padding: '10px 20px', fontSize: 14 }}>
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

  // Available Dates Feature
  const [availableDates, setAvailableDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [showDatesPanel, setShowDatesPanel] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const search = async () => {
    if (!form.source || !form.destination || !form.travel_date) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = { ...form };
      if (busType) params.bus_type = busType;
      const res = await busAPI.searchTrips(params);
      setTrips(res.data);
      if (res.data.length === 0) toast('No buses found for this date. Try "Available Dates" below!', { icon: '🔍' });
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailableDates = async () => {
    if (!form.source || !form.destination) {
      toast.error('Please enter From and To cities first!');
      return;
    }
    setDatesLoading(true);
    setShowDatesPanel(true);
    try {
      const dates = [];
      const checkDate = new Date();
      const promises = [];
      for (let i = 0; i < 25; i++) {
        const d = new Date();
        d.setDate(checkDate.getDate() + i + 1);
        const dateStr = d.toISOString().split('T')[0];
        promises.push(
          busAPI.searchTrips({ source: form.source, destination: form.destination, travel_date: dateStr })
            .then(res => ({ date: dateStr, count: res.data.length, dateObj: d }))
            .catch(() => ({ date: dateStr, count: 0, dateObj: d }))
        );
      }
      const results = await Promise.all(promises);
      setAvailableDates(results);
    } catch {
      toast.error('Failed to check availability');
    } finally {
      setDatesLoading(false);
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Search Bar */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '20px 16px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 From</label>
              <input type="text" placeholder="Source city" value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
                className="input-field" style={{ background: '#fff', color: '#0f172a', fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏁 To</label>
              <input type="text" placeholder="Destination city" value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                className="input-field" style={{ background: '#fff', color: '#0f172a', fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Date</label>
              <input type="date" min={today} value={form.travel_date}
                onChange={e => setForm({ ...form, travel_date: e.target.value })}
                className="input-field" style={{ background: '#fff', color: '#0f172a', fontSize: 15 }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚌 Bus Type</label>
              <select value={busType} onChange={e => setBusType(e.target.value)}
                className="input-field" style={{ background: '#fff', color: '#0f172a', fontSize: 15 }}>
                {BUS_TYPES.map(t => <option key={t} value={t}>{BUS_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'transparent', fontSize: 11, marginBottom: 6 }}>_</label>
              <button className="btn-accent" onClick={search} style={{ width: '100%', height: 50, fontSize: 15, justifyContent: 'center' }}>
                {loading ? '⏳' : '🔍 Search'}
              </button>
            </div>
          </div>

          {/* Show Available Dates Button */}
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button onClick={checkAvailableDates} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', padding: '9px 22px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.12)'}>
              📅 Show Available Dates &amp; Buses {showDatesPanel ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Available Dates Panel */}
      {showDatesPanel && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 0' }} className="fade-in-up">
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface2))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, color: 'var(--text)' }}>
                  📅 Available Dates — Next 25 Days
                </h3>
                {form.source && form.destination && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                    {form.source} → {form.destination}
                  </p>
                )}
              </div>
              <button onClick={() => setShowDatesPanel(false)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>✕ Close</button>
            </div>

            {datesLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Checking availability for next 25 days...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                {availableDates.map(({ date: d, count, dateObj }) => {
                  const isSelected = d === form.travel_date;
                  const hasbuses = count > 0;
                  return (
                    <button key={d} onClick={() => {
                      setForm({ ...form, travel_date: d });
                      setTimeout(() => {
                        const params = { source: form.source, destination: form.destination, travel_date: d };
                        if (busType) params.bus_type = busType;
                        setLoading(true);
                        setSearched(true);
                        busAPI.searchTrips(params).then(res => setTrips(res.data)).finally(() => setLoading(false));
                      }, 50);
                    }}
                      disabled={!hasbuses}
                      style={{
                        padding: '10px 8px', borderRadius: 10, border: '2px solid',
                        borderColor: isSelected ? 'var(--primary)' : hasbuses ? 'rgba(16,185,129,0.3)' : 'var(--border)',
                        background: isSelected ? 'var(--primary)' : hasbuses ? 'rgba(16,185,129,0.08)' : 'var(--surface2)',
                        cursor: hasbuses ? 'pointer' : 'not-allowed',
                        transition: 'var(--transition)', textAlign: 'center',
                        opacity: hasbuses ? 1 : 0.5,
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-muted)', marginBottom: 2 }}>
                        {dateObj.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#fff' : 'var(--text)', fontFamily: 'Sora, sans-serif' }}>
                        {dateObj.getDate()}
                      </div>
                      <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', marginBottom: 4 }}>
                        {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                      </div>
                      <div style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                        background: isSelected ? 'rgba(255,255,255,0.2)' : hasbuses ? 'rgba(16,185,129,0.15)' : 'var(--border)',
                        color: isSelected ? '#fff' : hasbuses ? 'var(--success)' : 'var(--text-light)',
                      }}>
                        {hasbuses ? `${count} buses` : 'No buses'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {searched && !loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, color: 'var(--text)' }}>
                {trips.length > 0 ? `${trips.length} Bus${trips.length > 1 ? 'es' : ''} Found` : 'No Buses Found'}
              </h2>
              {form.source && form.destination && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{form.source} → {form.destination} • {form.travel_date}</p>
              )}
            </div>
            {trips.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</span>
                {[['price', '💰 Price'], ['seats', '💺 Seats'], ['departure', '🕐 Time']].map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: sortBy === val ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'var(--transition)',
                    background: sortBy === val ? 'var(--primary)' : 'var(--surface)',
                    color: sortBy === val ? '#fff' : 'var(--text-muted)',
                  }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && <div className="fade-in">{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>}

        {!loading && sortedTrips.length > 0 && (
          <div>{sortedTrips.map((trip, i) => <TripCard key={trip.id} trip={trip} index={i} onSelect={() => navigate(`/book/${trip.id}`)} />)}</div>
        )}

        {!loading && searched && trips.length === 0 && (
          <div className="card fade-in-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🚌</div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>No Buses Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Try the "Show Available Dates" button above!</p>
            <button className="btn-primary" onClick={checkAvailableDates}>📅 Check Available Dates</button>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 14 }} className="float">🔍</div>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>Search for Buses</h3>
            <p style={{ color: 'var(--text-muted)' }}>Enter source, destination and date above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;