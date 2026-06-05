import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, gradient, trend }) => (
  <div style={{
    background: 'var(--surface)', borderRadius: 20, padding: '22px',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
    transition: 'var(--transition)', overflow: 'hidden', position: 'relative',
    cursor: 'default',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{
      position: 'absolute', top: -24, right: -24, width: 96, height: 96,
      borderRadius: '50%', background: gradient, opacity: 0.12,
    }} />
    <div style={{
      width: 48, height: 48, borderRadius: 14, background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, marginBottom: 14,
    }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Sora, sans-serif', marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: trend ? 8 : 0 }}>{label}</div>
    {trend && <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>↑ {trend}</div>}
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busForm, setBusForm] = useState({ bus_number: '', bus_name: '', bus_type: 'AC_SEATER', total_seats: 40, operator_id: 1 });
  const [routeForm, setRouteForm] = useState({ source: '', destination: '', distance_km: '', estimated_duration: '' });

  const loadData = async (section) => {
    setLoading(true);
    try {
      if (section === 'overview' || section === 'bookings') {
        const res = await adminAPI.getAllBookings();
        setBookings(res.data.results || res.data);
      }
      if (section === 'overview' || section === 'payments') {
        const res = await adminAPI.getAllPayments();
        setPayments(res.data.results || res.data);
      }
      if (section === 'buses') {
        const res = await adminAPI.getBuses();
        setBuses(res.data.results || res.data);
      }
      if (section === 'routes') {
        const res = await adminAPI.getRoutes();
        setRoutes(res.data.results || res.data);
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(tab); }, [tab]);

  const handleAddBus = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createBus(busForm);
      toast.success('Bus added successfully! 🚌');
      loadData('buses');
      setBusForm({ bus_number: '', bus_name: '', bus_type: 'AC_SEATER', total_seats: 40, operator_id: 1 });
    } catch { toast.error('Failed to add bus'); }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createRoute(routeForm);
      toast.success('Route added successfully! 🗺️');
      loadData('routes');
      setRouteForm({ source: '', destination: '', distance_km: '', estimated_duration: '' });
    } catch { toast.error('Failed to add route'); }
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await adminAPI.deleteBus(id);
      setBuses(prev => prev.filter(b => b.id !== id));
      toast.success('Bus deleted');
    } catch { toast.error('Delete failed'); }
  };

  const totalRevenue = payments.filter(p => p.status === 'SUCCESS')
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'bookings', label: 'Bookings', icon: '🎫' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'buses', label: 'Buses', icon: '🚌' },
    { key: 'routes', label: 'Routes', icon: '🗺️' },
  ];

  const inputStyle = { marginBottom: 14 };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div className="fade-in-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>⚙️</div>
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 28, marginBottom: 2 }}>Admin Panel</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>BusGo Management Dashboard</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="fade-in-up delay-1" style={{
          display: 'flex', gap: 8, marginBottom: 28,
          background: 'var(--surface)', padding: 6, borderRadius: 16,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
        }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, minWidth: 100, padding: '10px 16px',
              borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, transition: 'var(--transition)',
              background: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              boxShadow: tab === t.key ? 'var(--shadow)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading data...</p>
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && !loading && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon="🎫" label="Total Bookings" value={bookings.length}
                gradient="linear-gradient(135deg,#667eea,#764ba2)" trend="12% this week" />
              <StatCard icon="✅" label="Confirmed" value={bookings.filter(b => b.status === 'CONFIRMED').length}
                gradient="linear-gradient(135deg,#43e97b,#38f9d7)" />
              <StatCard icon="💰" label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`}
                gradient="linear-gradient(135deg,#fa709a,#fee140)" trend="8% this month" />
              <StatCard icon="💳" label="Payments" value={payments.length}
                gradient="linear-gradient(135deg,#4facfe,#00f2fe)" />
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 20, fontSize: 18 }}>
                📋 Recent Bookings
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['Booking ID', 'Passenger', 'Route', 'Date', 'Fare', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px',
                          color: 'var(--text-muted)', fontWeight: 700, fontSize: 11,
                          textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>{b.booking_id}</td>
                        <td style={{ padding: '12px' }}>{b.passenger_name}</td>
                        <td style={{ padding: '12px' }}>
                          {b.trip_detail?.schedule?.route?.source} → {b.trip_detail?.schedule?.route?.destination}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{b.trip_detail?.trip_date}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--success)' }}>₹{b.fare_paid}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No bookings yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && !loading && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18 }}>All Bookings</h3>
              <span className="badge badge-info">{bookings.length} total</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderRadius: 10 }}>
                    {['#', 'Booking ID', 'User', 'Passenger', 'Route', 'Date', 'Seat', 'Fare', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px',
                        color: 'var(--text-muted)', fontWeight: 700, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>{b.booking_id}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12 }}>{b.user}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 600 }}>{b.passenger_name}</td>
                      <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                        {b.trip_detail?.schedule?.route?.source} → {b.trip_detail?.schedule?.route?.destination}
                      </td>
                      <td style={{ padding: '11px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.trip_detail?.trip_date}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span className="badge badge-purple">#{b.seat_detail?.seat_number}</span>
                      </td>
                      <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--success)' }}>₹{b.fare_paid}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No bookings found</div>}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {tab === 'payments' && !loading && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18 }}>All Payments</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="badge badge-success">Revenue: ₹{totalRevenue.toFixed(0)}</span>
                <span className="badge badge-info">{payments.length} total</span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Payment ID', 'Booking', 'Amount', 'Method', 'Transaction ID', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px',
                        color: 'var(--text-muted)', fontWeight: 700, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 11 }}>{p.payment_id}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12 }}>{p.booking}</td>
                      <td style={{ padding: '11px 12px', fontWeight: 800, color: 'var(--success)', fontSize: 14 }}>₹{p.amount}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span className="badge badge-info">{p.payment_method}</span>
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.transaction_id}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <span className={`badge ${p.status === 'SUCCESS' ? 'badge-success' : p.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payments found</div>}
            </div>
          </div>
        )}

        {/* Buses Tab */}
        {tab === 'buses' && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, alignItems: 'start' }} className="fade-in">
            <div className="card">
              <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 20, fontSize: 18 }}>➕ Add New Bus</h3>
              <form onSubmit={handleAddBus}>
                {[
                  { label: 'Bus Number', key: 'bus_number', ph: 'TN01AB1234' },
                  { label: 'Bus Name', key: 'bus_name', ph: 'Super Express' },
                ].map(({ label, key, ph }) => (
                  <div key={key} style={inputStyle}>
                    <label style={labelStyle}>{label}</label>
                    <input className="input-field" placeholder={ph} required
                      value={busForm[key]} onChange={e => setBusForm({ ...busForm, [key]: e.target.value })} />
                  </div>
                ))}
                <div style={inputStyle}>
                  <label style={labelStyle}>Bus Type</label>
                  <select className="input-field" value={busForm.bus_type}
                    onChange={e => setBusForm({ ...busForm, bus_type: e.target.value })}>
                    {['AC_SEATER', 'NON_AC_SEATER', 'AC_SLEEPER', 'NON_AC_SLEEPER', 'LUXURY', 'VOLVO'].map(t => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div style={inputStyle}>
                  <label style={labelStyle}>Total Seats</label>
                  <input type="number" className="input-field" min={1} max={60}
                    value={busForm.total_seats}
                    onChange={e => setBusForm({ ...busForm, total_seats: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                  Add Bus 🚌
                </button>
              </form>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18 }}>All Buses</h3>
                <span className="badge badge-info">{buses.length} buses</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
                {buses.map(bus => (
                  <div key={bus.id} style={{
                    padding: '14px 16px', background: 'var(--surface2)',
                    borderRadius: 14, border: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{bus.bus_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {bus.bus_number} • {bus.bus_type?.replace('_', ' ')} • {bus.total_seats} seats
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBus(bus.id)} style={{
                      background: '#fee2e2', color: '#ef4444', border: 'none',
                      borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'var(--transition)',
                    }}>🗑️ Delete</button>
                  </div>
                ))}
                {buses.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No buses added yet</div>}
              </div>
            </div>
          </div>
        )}

        {/* Routes Tab */}
        {tab === 'routes' && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24, alignItems: 'start' }} className="fade-in">
            <div className="card">
              <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 20, fontSize: 18 }}>➕ Add New Route</h3>
              <form onSubmit={handleAddRoute}>
                {[
                  { label: 'Source City', key: 'source', ph: 'Chennai' },
                  { label: 'Destination City', key: 'destination', ph: 'Bangalore' },
                  { label: 'Distance (km)', key: 'distance_km', ph: '350' },
                  { label: 'Estimated Duration', key: 'estimated_duration', ph: '5h 30m' },
                ].map(({ label, key, ph }) => (
                  <div key={key} style={inputStyle}>
                    <label style={labelStyle}>{label}</label>
                    <input className="input-field" placeholder={ph} required
                      value={routeForm[key]} onChange={e => setRouteForm({ ...routeForm, [key]: e.target.value })} />
                  </div>
                ))}
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                  Add Route 🗺️
                </button>
              </form>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18 }}>All Routes</h3>
                <span className="badge badge-info">{routes.length} routes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
                {routes.map(route => (
                  <div key={route.id} style={{
                    padding: '14px 16px', background: 'var(--surface2)',
                    borderRadius: 14, border: '1px solid var(--border)',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{route.source}</span>
                      <span style={{ color: 'var(--primary)' }}>→</span>
                      <span>{route.destination}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      <span>📏 {route.distance_km} km</span>
                      <span>⏱️ {route.estimated_duration}</span>
                    </div>
                  </div>
                ))}
                {routes.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No routes yet</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;