import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function Confirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api.get('/bookings/me').then(({ data }) => {
      setBooking(data.find((b) => b._id === bookingId));
    });
  }, [bookingId]);

  if (!booking) return <div className="p-10 text-center text-slate-500">Loading confirmation…</div>;
  const f = booking.flightId;
  const seats = booking.seatNumbers?.join(', ') || booking.passengers?.map((p) => p.seatNumber).join(', ');

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl border p-6 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold mt-2">Booking Confirmed</h1>
        <p className="text-slate-500 text-sm">Your booking ID</p>
        <div className="font-mono bg-slate-100 inline-block px-3 py-1 rounded mt-1">{booking._id}</div>

        <div className="text-left mt-6 border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Airline</span><span className="font-semibold">{f.airlineName} ({f.flightNumber})</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-semibold">{f.source} → {f.destination}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Departure</span><span>{new Date(f.departureTime).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Passengers</span><span className="font-semibold">{booking.passengers?.length || 1}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Seats</span><span className="font-semibold">{seats}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Amount paid</span><span className="font-semibold text-sky-700">₹{booking.amount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-green-700 font-semibold">{booking.status}</span></div>
        </div>

        {booking.passengers?.length > 0 && (
          <div className="text-left mt-4 border-t pt-3">
            <div className="text-xs font-semibold text-slate-500 mb-2">PASSENGER DETAILS</div>
            <div className="space-y-1">
              {booking.passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm bg-slate-50 px-3 py-1.5 rounded">
                  <span>{i + 1}. {p.name} <span className="text-slate-400">({p.gender}, {p.age})</span></span>
                  <span className="font-semibold text-sky-700">Seat {p.seatNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Link to="/bookings" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-semibold">My Bookings</Link>
          <Link to="/" className="flex-1 border py-2 rounded font-semibold">Search more</Link>
        </div>
      </div>
    </div>
  );
}
