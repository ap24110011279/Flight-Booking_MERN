import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Payment() {
  const { bookingId } = useParams();
  const nav = useNavigate();
  const [method, setMethod] = useState('UPI');
  const [upi, setUpi] = useState('demo@upi');
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', name: 'Demo User', exp: '12/29', cvv: '123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async (simulateFail = false) => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/payments', { bookingId, method, simulateFail });
      if (data.payment.status === 'Success') nav(`/confirmation/${bookingId}`);
      else setError('Payment failed. Booking was not confirmed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment error');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl border p-6">
        <h1 className="text-2xl font-bold mb-1">Complete payment</h1>
        <p className="text-slate-500 text-sm mb-5">Choose a method (this is a simulated payment).</p>

        <div className="flex gap-2 mb-5">
          {['UPI', 'CARD'].map((m) => (
            <button key={m} onClick={() => setMethod(m)}
              className={`flex-1 py-2 rounded-lg font-semibold border ${method === m ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700'}`}>
              {m === 'UPI' ? '💸 UPI' : '💳 Card'}
            </button>
          ))}
        </div>

        {method === 'UPI' ? (
          <div>
            <label className="text-xs text-slate-500">UPI ID</label>
            <input value={upi} onChange={(e) => setUpi(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="yourname@bank" />
          </div>
        ) : (
          <div className="space-y-2">
            <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Card number" />
            <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Cardholder name" />
            <div className="flex gap-2">
              <input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="w-1/2 border rounded px-3 py-2" placeholder="MM/YY" />
              <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="w-1/2 border rounded px-3 py-2" placeholder="CVV" />
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}

        <div className="mt-6 space-y-2">
          <button onClick={() => pay(false)} disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
            {loading ? 'Processing…' : 'Pay now'}
          </button>
          <button onClick={() => pay(true)} disabled={loading} className="w-full text-red-600 text-xs underline">
            Simulate payment failure
          </button>
        </div>
      </div>
    </div>
  );
}
