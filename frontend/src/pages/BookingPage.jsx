import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { busAPI, bookingAPI, paymentAPI, promoAPI, loyaltyAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [seatCount, setSeatCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payMethod, setPayMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [wantReturn, setWantReturn] = useState(false);

  useEffect(() => {
    busAPI.getTripDetail(tripId)
      .then(res => setTrip(res.data))
      .catch(() => toast.error('Trip not found'))
      .finally(() => setLoading(false));
    loyaltyAPI.getPoints().then(res => setLoyaltyData(res.data)).catch(() => {});
  }, [tripId]);

  useEffect(() => {
    if (seatCount > 0) {
      setPassengers(Array.from({ length: seatCount }, (_, i) => ({
        passenger_name: i === 0 ? (user ? `${user.first_name} ${user.last_name}`.trim() : '') : '',
        passenger_age: '',
        passenger_gender: 'M',
        passenger_phone: i === 0 ? (user?.phone || '') : '',
      })));
    }
  }, [seatCount, user]);

  if (!user) { navigate('/login'); return null; }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Sora, sans-serif' }}>Loading trip details...</p>
      </div>
    </div>
  );

  if (!trip) return <div style={{ textAlign: 'center', padding: 80 }}><div style={{ fontSize: 48 }}>😕</div><h3>Trip not found</h3></div>;

  const allSeats = trip.schedule?.bus?.seats || [];
  const bookedSeats = trip.booked_seats || [];
  const baseFare = parseFloat(trip.schedule?.fare || 0) * seatCount;
  const promoDiscount = promoResult?.valid ? parseFloat(promoResult.discount_amount || 0) : 0;
  const loyaltyDiscount = useLoyalty ? Math.min((loyaltyData?.points || 0) / 10, baseFare * 0.1) : 0;
  const totalFare = Math.max(baseFare - promoDiscount - loyaltyDiscount, 0);
  const farePerSeat = totalFare / seatCount;

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat.seat_number)) return;
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= seatCount) {
        toast.error(`You can only select ${seatCount} seat(s)!`);
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await promoAPI.validate(promoCode, baseFare);
      setPromoResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
      setPromoResult(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.passenger_name?.trim()) { toast.error(`Passenger ${i+1}: Name required`); return false; }
      if (!p.passenger_age || p.passenger_age < 1 || p.passenger_age > 120) { toast.error(`Passenger ${i+1}: Valid age required`); return false; }
      if (!p.passenger_phone?.trim()) { toast.error(`Passenger ${i+1}: Phone required`); return false; }
    }
    return true;
  };

  const handleBookings = async () => {
    if (selectedSeats.length !== seatCount) { toast.error(`Please select ${seatCount} seat(s)!`); return; }
    if (!validatePassengers()) return;
    setProcessing(true);
    try {
      const results = [];
      for (let i = 0; i < seatCount; i++) {
        const payload = {
          trip: parseInt(trip.id),
          seat: parseInt(selectedSeats[i].id),
          fare_paid: farePerSeat.toFixed(2),
          passenger_name: passengers[i].passenger_name.trim(),
          passenger_age: parseInt(passengers[i].passenger_age),
          passenger_gender: passengers[i].passenger_gender,
          passenger_phone: passengers[i].passenger_phone.trim(),
        };
        const res = await bookingAPI.createBooking(payload);
        results.push(res.data);
      }
      setBookings(results);
      setStep(3);
      toast.success('Booking confirmed! 🎉');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.seat) toast.error(errData.seat[0]);
      else if (errData?.non_field_errors) toast.error(errData.non_field_errors[0]);
      else if (errData?.detail) toast.error(errData.detail);
      else toast.error('Booking failed. Please try again.');
      console.error('Booking error:', errData);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      for (const booking of bookings) {
        await paymentAPI.initiatePayment({ booking_id: booking.id, payment_method: payMethod });
      }
      toast.success('Payment successful! 🎉');
      if (wantReturn) {
        navigate(`/search?source=${trip.schedule?.route?.destination}&destination=${trip.schedule?.route?.source}`);
      } else {
        navigate('/dashboard');
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const steps = ['Seats Count', 'Select Seats', 'Passenger Info', 'Payment'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px', paddingBottom: 100 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 4 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11,
                  background: step > i ? 'var(--success)' : step === i ? 'var(--primary)' : 'var(--border)',
                  color: step >= i ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)',
                }}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: step === i ? 600 : 400, color: step === i ? 'var(--primary)' : 'var(--text-muted)' }}>{s}</span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 2, margin: '0 4px', background: step > i ? 'var(--success)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Trip Info */}
        <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{trip.schedule?.bus?.bus_name}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                {trip.schedule?.route?.source} → {trip.schedule?.route?.destination}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>📅 {trip.trip_date}</span>
                <span>🕐 {trip.schedule?.departure_time?.slice(0, 5)}</span>
                <span>⏱️ {trip.schedule?.route?.estimated_duration}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Sora, sans-serif' }}>₹{totalFare.toFixed(0)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{seatCount} seat{seatCount > 1 ? 's' : ''} × ₹{trip.schedule?.fare}</div>
              {(promoDiscount > 0 || loyaltyDiscount > 0) && (
                <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>You save ₹{(promoDiscount + loyaltyDiscount).toFixed(0)}! 🎉</div>
              )}
            </div>
          </div>
        </div>

        {/* Step 0: Seat Count */}
        {step === 0 && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 6, fontSize: 18 }}>How many seats?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Available: <strong>{trip.available_seats}</strong> seats</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button key={num} onClick={() => setSeatCount(num)} disabled={num > trip.available_seats} style={{
                  width: 60, height: 60, borderRadius: 14, border: '2px solid',
                  borderColor: seatCount === num ? 'var(--primary)' : 'var(--border)',
                  background: seatCount === num ? 'var(--primary)' : 'var(--surface)',
                  color: seatCount === num ? '#fff' : num > trip.available_seats ? 'var(--border)' : 'var(--text)',
                  fontWeight: 800, fontSize: 22, cursor: num > trip.available_seats ? 'not-allowed' : 'pointer',
                  fontFamily: 'Sora, sans-serif', transition: 'var(--transition)',
                }}>{num}</button>
              ))}
            </div>
            {/* Return trip toggle */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>🔁 Add Return Trip?</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{trip.schedule?.route?.destination} → {trip.schedule?.route?.source}</div>
                </div>
                <div style={{ width: 44, height: 24, background: wantReturn ? 'var(--primary)' : 'var(--border)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setWantReturn(!wantReturn)}>
                  <div style={{ position: 'absolute', top: 2, left: wantReturn ? 22 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'var(--transition)' }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--primary-glow)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{seatCount} seat{seatCount > 1 ? 's' : ''} × ₹{trip.schedule?.fare}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>₹{baseFare.toFixed(0)}</span>
            </div>
            <button className="btn-primary" onClick={() => setStep(1)} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              Continue → Select Seats
            </button>
          </div>
        )}

        {/* Step 1: Seat Selection */}
        {step === 1 && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18 }}>Select {seatCount} Seat{seatCount > 1 ? 's' : ''}</h3>
              <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-glow)', padding: '4px 12px', borderRadius: 20 }}>{selectedSeats.length}/{seatCount}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              {[['🟢', 'Available', '#f0fdf4'], ['🔴', 'Booked', '#fef2f2'], ['🔵', 'Selected', '#eff6ff']].map(([e, l, bg]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, background: bg, padding: '5px 10px', borderRadius: 20, fontSize: 12 }}>
                  <span>{e}</span><span>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 8, marginBottom: 4 }}>
                  <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>🚗 Driver</div>
                </div>
                {Array.from({ length: Math.ceil(allSeats.length / 4) }, (_, rowIdx) => {
                  const rowSeats = allSeats.slice(rowIdx * 4, rowIdx * 4 + 4);
                  return (
                    <div key={rowIdx} style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                      {rowSeats.map((seat, colIdx) => {
                        const booked = bookedSeats.includes(seat.seat_number);
                        const selected = selectedSeats.find(s => s.id === seat.id);
                        return (
                          <React.Fragment key={seat.id}>
                            {colIdx === 2 && <div style={{ width: 20, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 10 }}>│</div>}
                            <button onClick={() => toggleSeat(seat)} disabled={booked} style={{
                              width: 48, height: 48, borderRadius: 10, border: '2px solid',
                              borderColor: selected ? 'var(--primary)' : booked ? '#fca5a5' : '#86efac',
                              background: selected ? 'var(--primary)' : booked ? '#fee2e2' : '#f0fdf4',
                              color: selected ? '#fff' : booked ? '#ef4444' : '#16a34a',
                              fontWeight: 700, fontSize: 12, cursor: booked ? 'not-allowed' : 'pointer',
                              transition: 'var(--transition)', fontFamily: 'Sora, sans-serif',
                            }}>{seat.seat_number}</button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedSeats.length > 0 && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--primary-glow)', borderRadius: 10, fontSize: 13 }}>
                ✅ Selected: <strong>Seat {selectedSeats.map(s => s.seat_number).join(', ')}</strong>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => { setStep(0); setSelectedSeats([]); }} style={{ padding: '12px 20px' }}>← Back</button>
              <button className="btn-primary" onClick={() => { if (selectedSeats.length === seatCount) setStep(2); else toast.error(`Select ${seatCount} seat(s)!`); }} style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
                Continue → Passenger Info
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Passenger Details */}
        {step === 2 && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 18, fontSize: 18 }}>Passenger Details</h3>
            {passengers.map((p, i) => (
              <div key={i} style={{ marginBottom: 18, padding: '14px 16px', background: 'var(--surface2)', borderRadius: 14, border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                  Passenger {i + 1} — Seat {selectedSeats[i]?.seat_number}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 5, color: 'var(--text)' }}>Full Name *</label>
                    <input type="text" placeholder="Enter passenger name" className="input-field" required
                      value={p.passenger_name}
                      onChange={e => { const updated = [...passengers]; updated[i] = { ...updated[i], passenger_name: e.target.value }; setPassengers(updated); }}
                      style={{ fontSize: 14, color: 'var(--text)', background: 'var(--surface)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 5, color: 'var(--text)' }}>Age *</label>
                    <input type="number" placeholder="Age" className="input-field" required min="1" max="120"
                      value={p.passenger_age}
                      onChange={e => { const updated = [...passengers]; updated[i] = { ...updated[i], passenger_age: e.target.value }; setPassengers(updated); }}
                      style={{ fontSize: 14, color: 'var(--text)', background: 'var(--surface)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 5, color: 'var(--text)' }}>Gender *</label>
                    <select className="input-field" value={p.passenger_gender}
                      onChange={e => { const updated = [...passengers]; updated[i] = { ...updated[i], passenger_gender: e.target.value }; setPassengers(updated); }}
                      style={{ fontSize: 14, color: 'var(--text)', background: 'var(--surface)' }}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 5, color: 'var(--text)' }}>Phone *</label>
                    <input type="tel" placeholder="+91 9876543210" className="input-field" required
                      value={p.passenger_phone}
                      onChange={e => { const updated = [...passengers]; updated[i] = { ...updated[i], passenger_phone: e.target.value }; setPassengers(updated); }}
                      style={{ fontSize: 14, color: 'var(--text)', background: 'var(--surface)' }} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ padding: '12px 20px' }}>← Back</button>
              <button className="btn-primary" onClick={handleBookings} disabled={processing} style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Confirming Booking...
                  </span>
                ) : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && bookings.length > 0 && (
          <div className="card fade-in">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }} className="bounce-in">🎫</div>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, marginBottom: 4 }}>Booking Confirmed!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>IDs: {bookings.map(b => b.booking_id).join(', ')}</p>
            </div>
            {/* Promo Code */}
            <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>🎟️ Promo Code</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input-field" placeholder="Enter promo code" value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, fontSize: 13, color: 'var(--text)', background: 'var(--surface)' }} />
                <button className="btn-accent" onClick={handleValidatePromo} disabled={promoLoading} style={{ padding: '10px 16px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
              {promoResult?.valid && <div style={{ marginTop: 8, color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✅ {promoResult.message}</div>}
            </div>
            {/* Loyalty Points */}
            {loyaltyData && loyaltyData.points > 0 && (
              <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>🏆 Loyalty Points</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><strong style={{ color: 'var(--primary)' }}>{loyaltyData.points} pts</strong> (worth ₹{(loyaltyData.points / 10).toFixed(0)})</div>
                  </div>
                  <div style={{ width: 44, height: 24, background: useLoyalty ? 'var(--primary)' : 'var(--border)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setUseLoyalty(!useLoyalty)}>
                    <div style={{ position: 'absolute', top: 2, left: useLoyalty ? 22 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'var(--transition)' }} />
                  </div>
                </div>
                {useLoyalty && <div style={{ marginTop: 6, color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✅ Saving ₹{loyaltyDiscount.toFixed(0)} with loyalty points!</div>}
              </div>
            )}
            {/* Payment Method */}
            <h4 style={{ marginBottom: 12, fontFamily: 'Sora, sans-serif', fontSize: 15 }}>💳 Payment Method</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[['CARD', '💳 Card'], ['UPI', '📱 UPI'], ['NETBANKING', '🏦 Net Banking'], ['WALLET', '👛 Wallet']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: `2px solid ${payMethod === val ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: payMethod === val ? 'var(--primary-glow)' : 'var(--surface)', transition: 'var(--transition)' }}>
                  <input type="radio" name="payment" value={val} checked={payMethod === val} onChange={() => setPayMethod(val)} style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                </label>
              ))}
            </div>
            {/* Summary */}
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              {bookings.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Seat {selectedSeats[i]?.seat_number} — {passengers[i]?.passenger_name}</span>
                  <span style={{ color: 'var(--text)' }}>₹{trip.schedule.fare}</span>
                </div>
              ))}
              {promoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--success)' }}>
                  <span>🎟️ Promo Discount</span><span>- ₹{promoDiscount.toFixed(0)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--success)' }}>
                  <span>🏆 Loyalty Discount</span><span>- ₹{loyaltyDiscount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Total Payable</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)', fontFamily: 'Sora, sans-serif' }}>₹{totalFare.toFixed(0)}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, textAlign: 'center' }}>
              🏆 You'll earn <strong style={{ color: 'var(--primary)' }}>{Math.floor(totalFare / 10)} loyalty points</strong> for this booking!
            </div>
            <button className="btn-accent" onClick={handlePayment} disabled={processing} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Processing Payment...
                </span>
              ) : `Pay ₹${totalFare.toFixed(0)} Now 🔒`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;