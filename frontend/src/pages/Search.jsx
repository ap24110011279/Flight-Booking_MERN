import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import FlightCard from '../components/FlightCard';
import { useAuth } from '../context/AuthContext';

const CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata',
  'Goa', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi',
  'Dubai', 'Singapore', 'London', 'New York',
];

export default function Search() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ source: 'Delhi', destination: 'Mumbai', date: today });
  const [filters, setFilters] = useState({ airline: '', maxPrice: '', sort: 'departureTime' });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  const search = async (e) => {
    e?.preventDefault();
    if (!form.source || !form.destination || !form.date) {
      setError('Please fill source, destination and date.');
      return;
    }
    if (form.source.toLowerCase() === form.destination.toLowerCase()) {
      setError('Source and destination must be different.');
      return;
    }
    setError(''); setLoading(true); setSearched(true);
    try {
      const params = { ...form, ...filters };
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
      const { data } = await api.get('/flights', { params });
      setFlights(data.flights);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch flights');
    } finally { setLoading(false); }
  };

  useEffect(() => { search(); /* eslint-disable-next-line */ }, []);

  const onBook = (flight) => {
    if (!user) return nav('/login');
    nav(`/seat/${flight._id}`, { state: { flight } });
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Find your next flight</h1>
          <p className="text-sky-100 mt-1">Search across airlines for the best fares.</p>

          <form onSubmit={search} className="mt-6 bg-white text-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-lg">
            <div>
              <label className="text-xs font-semibold text-slate-500">FROM</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border rounded-md px-3 py-2 mt-1">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">TO</label>
              <select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full border rounded-md px-3 py-2 mt-1">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">DEPART</label>
              <input type="date" value={form.date} min={today} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-md px-3 py-2 mt-1" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md py-2.5">Search Flights</button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        {searched && (
          <div className="flex flex-wrap gap-3 items-end mb-4 bg-white border rounded-lg p-3">
            <div>
              <label className="text-xs text-slate-500 block">Airline</label>
              <input value={filters.airline} onChange={(e) => setFilters({ ...filters, airline: e.target.value })} placeholder="Any" className="border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block">Max price (₹)</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="No limit" className="border rounded px-2 py-1 text-sm w-32" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block">Sort by</label>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="border rounded px-2 py-1 text-sm">
                <option value="departureTime">Departure</option>
                <option value="price">Price (low → high)</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <button onClick={search} className="ml-auto px-4 py-1.5 bg-slate-800 text-white rounded text-sm">Apply</button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4">{error}</div>}
        {loading && <div className="text-center text-slate-500 py-10">Searching flights…</div>}

        {!loading && searched && flights.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border">
            <div className="text-5xl mb-2">🛫</div>
            <div className="text-lg font-semibold">No flights found</div>
            <div className="text-slate-500 text-sm">Try a different date or route.</div>
          </div>
        )}

        <div className="space-y-3">
          {flights.map((f) => <FlightCard key={f._id} flight={f} onBook={onBook} />)}
        </div>
      </section>
    </div>
  );
}
