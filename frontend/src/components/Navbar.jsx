import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:text-sky-700'}`;

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sky-700">
          <span>✈️</span> SkyVault
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>Search</NavLink>
          {user && <NavLink to="/bookings" className={linkCls}>My Bookings</NavLink>}
          {!user ? (
            <>
              <NavLink to="/login" className={linkCls}>Login</NavLink>
              <NavLink to="/register" className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-700">Sign up</NavLink>
            </>
          ) : (
            <>
              <span className="text-sm text-slate-500 ml-2 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={() => { logout(); nav('/'); }}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50"
              >Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
