import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-slate-500 text-sm mb-5">Login to continue booking.</p>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded px-3 py-2" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded py-2.5 disabled:opacity-60">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4">No account? <Link to="/register" className="text-sky-700 font-semibold">Sign up</Link></p>
      </div>
    </div>
  );
}
