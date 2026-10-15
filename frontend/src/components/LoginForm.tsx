import { useState } from 'react';
import { AlertCircle, LogIn, Shield, Briefcase, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = (): string => {
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      return 'Email address or 10-digit mobile number is required.';
    }

    const cleanDigits = trimmedId.replace(/\D/g, '');
    const isPhoneCandidate = !trimmedId.includes('@') && cleanDigits.length > 0;

    if (isPhoneCandidate) {
      if (cleanDigits.length !== 10) {
        return 'Phone number must be exactly 10 digits.';
      }
      if (cleanDigits.startsWith('0')) {
        return 'Phone number cannot start with 0.';
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) {
        return 'Please enter a valid email address or 10-digit phone number.';
      }
    }

    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await login(identifier.trim(), password);
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setIdentifier(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex gap-3 items-start animate-pulse-subtle">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-rose-700 font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier: Email or Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Email Address or Phone Number
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. you@email.com or 9876543210"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-sm bg-white"
          />
          <p className="text-[11px] text-stone-500 mt-1">
            You can sign in using your registered email or 10-digit mobile number
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-sm bg-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-stone-400 text-white font-semibold rounded-full text-xs tracking-wide transition-all shadow-soft duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <LogIn size={15} />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>
      </form>

      {/* Quick Demo Credentials Autofill */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-2xl p-4 text-xs space-y-2.5">
        <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px] block">
          Quick Demo One-Click Fill
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo('admin@dhobi.com', 'admin123')}
            className="py-1.5 px-2 bg-white hover:bg-stone-200/70 border border-stone-300 rounded-lg text-slate-900 font-medium flex items-center justify-center gap-1 transition"
          >
            <Shield size={12} className="text-purple-600" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('ramesh@dhobi.com', 'dhobi123')}
            className="py-1.5 px-2 bg-white hover:bg-stone-200/70 border border-stone-300 rounded-lg text-slate-900 font-medium flex items-center justify-center gap-1 transition"
          >
            <Briefcase size={12} className="text-blue-600" />
            <span>Dhobi</span>
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('user@dhobi.com', 'user123')}
            className="py-1.5 px-2 bg-white hover:bg-stone-200/70 border border-stone-300 rounded-lg text-slate-900 font-medium flex items-center justify-center gap-1 transition"
          >
            <UserIcon size={12} className="text-emerald-600" />
            <span>Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
