function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short' });
}
function fmtDur(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h ${m}m`;
}

export default function FlightCard({ flight, onBook }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
            {flight.airlineName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold">{flight.airlineName}</div>
            <div className="text-xs text-slate-500">{flight.flightNumber} · {flight.aircraft}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-center">
          <div className="text-center">
            <div className="text-xl font-bold">{fmtTime(flight.departureTime)}</div>
            <div className="text-xs text-slate-500">{flight.source}</div>
            <div className="text-xs text-slate-400">{fmtDate(flight.departureTime)}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-slate-500">{fmtDur(flight.durationMinutes)}</div>
            <div className="w-24 h-px bg-slate-300 my-1 relative">
              <span className="absolute -top-1.5 right-0 text-slate-400">→</span>
            </div>
            <div className="text-[10px] text-slate-400">Non-stop</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{fmtTime(flight.arrivalTime)}</div>
            <div className="text-xs text-slate-500">{flight.destination}</div>
            <div className="text-xs text-slate-400">{fmtDate(flight.arrivalTime)}</div>
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end gap-3 justify-between">
          <div className="text-2xl font-bold text-sky-700">₹{flight.price.toLocaleString()}</div>
          <button
            onClick={() => onBook(flight)}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold"
          >Book</button>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">{flight.seatsAvailable} seats left</div>
    </div>
  );
}
