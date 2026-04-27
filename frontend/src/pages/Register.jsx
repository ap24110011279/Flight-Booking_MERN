import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (form.password.length < 6) { setError('Password must be at least 6 chars'); setLoading(false); return; }
    try { await register(form.name.trim(), form.email.trim().toLowerCase(), form.password); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-5">Start booking in seconds.</p>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input type="password" required placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded px-3 py-2" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded py-2.5 disabled:opacity-60">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4">Already have one? <Link to="/login" className="text-sky-700 font-semibold">Login</Link></p>
      </div>
    </div>
  );
}
