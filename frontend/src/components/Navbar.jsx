import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── Icons (inline SVG, no external deps) ──────────────────────
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

// ── Nav links config ───────────────────────────────────────────
const publicLinks  = [{ to: '/', label: 'Home' }];
const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/plans',     label: 'Plans'     },
  { to: '/history',   label: 'History'   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const links = user
    ? [...privateLinks, ...(user.role === 'admin' || user.role === 'employee' ? [{ to: '/employee', label: 'Employee' }] : [])]
    : publicLinks;

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 relative
     after:absolute after:bottom-[-4px] after:left-0 after:h-[2px]
     after:rounded-full after:bg-brand-500 after:transition-all after:duration-300
     ${isActive
       ? 'text-brand-500 dark:text-brand-400 after:w-full'
       : 'text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 after:w-0 hover:after:w-full'
     }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-700/60'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600
              text-white group-hover:scale-110 transition-transform duration-200">
              <BoltIcon />
            </span>
            <span className="text-xl font-black tracking-tight">
              <span className="gradient-text">Recharge</span>
              <span className="text-slate-800 dark:text-white">X</span>
            </span>
          </Link>

          {/* ── Desktop nav ───────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navLinkClass} id={`nav-${l.label.toLowerCase()}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-slate-800
                hover:text-brand-500 dark:hover:text-brand-400
                transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                  bg-slate-100 dark:bg-slate-800">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500
                    flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-red-500 hover:text-red-600
                    dark:text-red-400 dark:hover:text-red-300
                    px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20
                    transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-5 text-sm" id="nav-login-btn">
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* ── Mobile hamburger ──────────────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              id="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden
        ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-2 space-y-1 bg-white dark:bg-slate-900
          border-t border-slate-200 dark:border-slate-700">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              id={`mobile-nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500
                  flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                  text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                id="mobile-logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block btn-primary text-center text-sm"
              id="mobile-login-btn"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
