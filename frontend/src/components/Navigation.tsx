import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // Determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const baseClass = "font-semibold text-sm px-3 py-2 rounded-lg transition-all";
    if (isActive(path)) {
      return `${baseClass} text-blue-600 bg-blue-50`;
    }
    return `${baseClass} text-gray-700 hover:text-blue-600 hover:bg-gray-50`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
          <span className="font-bold text-lg text-blue-600">Aura</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => navigate('/')} className={navLinkClass('/')}>Home</button>
          <button onClick={() => navigate('/services')} className={navLinkClass('/services')}>Services</button>
          <button onClick={() => navigate('/about')} className={navLinkClass('/about')}>About</button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={handleDashboard}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg"
              >
                Dashboard
              </button>
              <button
                onClick={handleProfile}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg"
              >
                Profile
              </button>
              <button
                onClick={handleBookPickup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Book Pickup
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={onRegisterClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
