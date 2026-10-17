import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';

interface NavigationProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function Navigation({ onLoginClick, onRegisterClick }: NavigationProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBookPickup = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onLoginClick();
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const base = "text-sm tracking-wide font-medium px-3.5 py-1.5 rounded-full transition-all duration-200";
    if (isActive(path)) {
      return `${base} text-stone-900 bg-stone-200/70 font-semibold`;
    }
    return `${base} text-stone-600 hover:text-stone-900 hover:bg-stone-100/60`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-tight text-xl font-bold text-slate-900 leading-none">
              Aura
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 mt-0.5">
              Garment Care Atelier
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-full border border-stone-200/60 shadow-inner">
          <button onClick={() => navigate('/')} className={navLinkClass('/')}>Overview</button>
          <button onClick={() => navigate('/services')} className={navLinkClass('/services')}>Services & Pricing</button>
          <button onClick={() => navigate('/about')} className={navLinkClass('/about')}>Our Craft</button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Admin
                </span>
              ) : user.role === 'dhobi' ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Artisan Partner
                </span>
              ) : null}

              <button
                onClick={handleDashboard}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-stone-700 hover:text-slate-950 px-3 py-2 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {user.role === 'admin' ? 'Control Center' : user.role === 'dhobi' ? 'Artisan Workspace' : 'Dashboard'}
              </button>
              <button
                onClick={handleProfile}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-stone-700 hover:text-slate-950 px-3 py-2 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profile
              </button>
              {user.role === 'user' && (
                <button
                  onClick={handleBookPickup}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Pickup
                </button>
              )}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-rose-50/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="text-xs font-semibold tracking-wide text-stone-700 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="hidden sm:inline-flex text-xs font-semibold tracking-wide text-stone-700 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
              >
                Register
              </button>
              <button
                onClick={handleBookPickup}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Schedule Pickup
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
