import { useEffect, useState } from 'react';
import api from '../api/client';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/me');
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((bs) => bs.map((b) => (b._id === id ? { ...b, status: 'Cancelled' } : b)));
    } catch (err) { alert(err.response?.data?.message || 'Cancel failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      {loading && <div className="text-slate-500">Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && bookings.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
          You have no bookings yet.
        </div>
      )}
      <div className="space-y-3">
        {bookings.map((b) => {
          const f = b.flightId;
          const seats = b.seatNumbers?.join(', ') || b.passengers?.map((p) => p.seatNumber).join(', ') || b.seatNumber;
          const pax = b.passengers?.length || 1;
          return (
            <div key={b._id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">Booking #{b._id.slice(-6).toUpperCase()} · {new Date(b.bookingDate).toLocaleDateString()}</div>
                <div className="font-semibold">{f?.airlineName} · {f?.flightNumber}</div>
                <div className="text-sm text-slate-600">{f?.source} → {f?.destination} · {f && new Date(f.departureTime).toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {pax} passenger{pax > 1 ? 's' : ''} · Seats {seats} · Total ₹{b.amount?.toLocaleString()}
                </div>
                {b.passengers?.length > 0 && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {b.passengers.map((p) => p.name).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded font-semibold
                  ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                {b.status === 'Confirmed' && (
                  <button onClick={() => cancel(b._id)} className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded">Cancel</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
