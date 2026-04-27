import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

const ROWS = 10;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_PASSENGERS = 10;

const emptyPassenger = () => ({ name: '', age: '', gender: 'Male' });

export default function SeatSelect() {
  const { flightId } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const [flight, setFlight] = useState(state?.flight || null);

  const [count, setCount] = useState(1); // number of passengers (1..10)
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [seats, setSeats] = useState([]); // array of selected seat IDs

  const [taken] = useState(() => {
    // Pseudo-random "occupied" seats for visual realism
    const set = new Set();
    for (let i = 0; i < 14; i++)
      set.add(`${1 + Math.floor(Math.random() * ROWS)}${COLS[Math.floor(Math.random() * COLS.length)]}`);
    return set;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!flight) {
      api
        .get(`/flights/${flightId}`)
        .then(({ data }) => setFlight(data))
        .catch(() => setError('Flight not found'));
    }
  }, [flight, flightId]);

  // Keep passengers array length in sync with count
  useEffect(() => {
    setPassengers((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        return [...prev, ...Array.from({ length: count - prev.length }, emptyPassenger)];
      }
      return prev.slice(0, count);
    });
    // Trim selected seats if count decreased
    setSeats((prev) => prev.slice(0, count));
  }, [count]);

  const totalAmount = useMemo(
    () => (flight ? flight.price * count : 0),
    [flight, count]
  );

  const toggleSeat = (id) => {
    setError('');
    setSeats((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= count) {
        setError(`You can pick exactly ${count} seat${count > 1 ? 's' : ''}.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const updatePassenger = (i, field, value) => {
    setPassengers((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const confirm = async () => {
    setError('');
    if (seats.length !== count) {
      return setError(`Please select ${count} seat${count > 1 ? 's' : ''}.`);
    }
    for (const [i, p] of passengers.entries()) {
      if (!p.name.trim() || !p.age || !p.gender) {
        return setError(`Please fill all details for passenger ${i + 1}.`);
      }
      const ageNum = Number(p.age);
      if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return setError(`Passenger ${i + 1}: age must be between 1 and 120.`);
      }
    }

    // Map each passenger to a seat (in selection order)
    const payload = {
      flightId,
      passengers: passengers.map((p, i) => ({
        name: p.name.trim(),
        age: Number(p.age),
        gender: p.gender,
        seatNumber: seats[i],
      })),
    };

    setLoading(true);
    try {
      const { data } = await api.post('/bookings', payload);
      nav(`/payment/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return <div className="p-8 text-center text-slate-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Flight summary */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <div className="flex justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm text-slate-500">
              {flight.airlineName} · {flight.flightNumber}
            </div>
            <div className="text-xl font-bold">
              {flight.source} → {flight.destination}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sky-700">
              ₹{totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              ₹{flight.price.toLocaleString()} × {count} passenger{count > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger count */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Passengers</h2>
            <p className="text-xs text-slate-500">Book up to {MAX_PASSENGERS} travellers in one go.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Number of passengers</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          {passengers.map((p, i) => (
            <div key={i} className="border rounded-lg p-3 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold">Passenger {i + 1}</div>
                <div className="text-xs text-slate-500">
                  Seat: <span className="font-bold text-sky-700">{seats[i] || '—'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={p.name}
                  onChange={(e) => updatePassenger(i, 'name', e.target.value)}
                  className="col-span-2 border rounded px-2 py-1.5 text-sm"
                  placeholder="Full name"
                  maxLength={80}
                />
                <input
                  value={p.age}
                  onChange={(e) => updatePassenger(i, 'age', e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Age"
                />
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(i, 'gender', e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm bg-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat map */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-1">Select your seats</h2>
        <p className="text-xs text-slate-500 mb-4">
          Pick {count} seat{count > 1 ? 's' : ''}. Seats are assigned to passengers in the order you tap them.
        </p>
        <div className="flex justify-center mb-4 text-sm text-slate-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <i className="w-4 h-4 inline-block bg-slate-100 border rounded" /> Available
            </span>
            <span className="flex items-center gap-1">
              <i className="w-4 h-4 inline-block bg-sky-600 rounded" /> Selected
            </span>
            <span className="flex items-center gap-1">
              <i className="w-4 h-4 inline-block bg-slate-300 rounded" /> Taken
            </span>
          </div>
        </div>

        <div className="mx-auto w-fit border-2 border-slate-200 rounded-t-[3rem] rounded-b-xl px-6 py-4 bg-slate-50">
          {Array.from({ length: ROWS }, (_, r) => (
            <div key={r} className="flex items-center gap-1 my-1">
              <div className="w-6 text-center text-xs text-slate-400">{r + 1}</div>
              {COLS.map((c, idx) => {
                const id = `${r + 1}${c}`;
                const isTaken = taken.has(id);
                const selIdx = seats.indexOf(id);
                const isSel = selIdx !== -1;
                return (
                  <span key={id} className="flex items-center">
                    <button
                      disabled={isTaken}
                      onClick={() => toggleSeat(id)}
                      className={`w-9 h-9 rounded text-xs font-semibold transition relative
                        ${
                          isTaken
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : isSel
                            ? 'bg-sky-600 text-white'
                            : 'bg-white border hover:border-sky-500'
                        }`}
                      title={isSel ? `Passenger ${selIdx + 1}` : ''}
                    >
                      {isSel ? selIdx + 1 : c}
                    </button>
                    {idx === 2 && <div className="w-4" />}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        {error && <div className="text-red-600 text-sm mt-3 text-center">{error}</div>}

        <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
          <div className="text-sm text-slate-600">
            Seats:{' '}
            <span className="font-bold">
              {seats.length ? seats.join(', ') : '—'}
            </span>{' '}
            ({seats.length}/{count})
          </div>
          <button
            onClick={confirm}
            disabled={loading}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? 'Reserving…' : `Continue to payment · ₹${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
