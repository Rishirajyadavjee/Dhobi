import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user' as 'user' | 'dhobi',
    // Dhobi fields
    service_area: '',
    experience_years: '',
    services_offered: '',
    rate_per_item: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Validation function
  const validateForm = (): string => {
    // Name validation
    if (!formData.name.trim()) {
      return 'Full name is required';
    }
    if (formData.name.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (formData.name.trim().length > 50) {
      return 'Full name must not exceed 50 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (formData.email.length > 100) {
      return 'Email is too long';
    }

    // Phone validation (required for both roles)
    if (!formData.phone.trim()) {
      return 'Phone number is required';
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!/^[0-9]{10}$/.test(phoneDigits)) {
      return 'Phone number must contain only digits';
    }
    // Check if phone starts with valid digit (1-9)
    if (phoneDigits[0] === '0') {
      return 'Phone number cannot start with 0';
    }

    // Password validation
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (formData.password.length > 50) {
      return 'Password must not exceed 50 characters';
    }
    // Check for at least one uppercase, one lowercase, and one number (optional but recommended)
    // For now, we'll keep it simple but strong enough

    // Confirm password validation
    if (!formData.confirmPassword) {
      return 'Please confirm your password';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Dhobi validation
    if (formData.role === 'dhobi') {
      // Years of experience validation
      if (!formData.experience_years) {
        return 'Years of experience is required for service providers';
      }
      const expYears = parseInt(formData.experience_years, 10);
      if (isNaN(expYears) || expYears < 0) {
        return 'Years of experience must be a valid positive number';
      }
      if (expYears > 60) {
        return 'Years of experience must be 60 or less';
      }

      // Services offered validation
      if (!formData.services_offered) {
        return 'Please select at least one service';
      }

      // Rate per item validation
      if (!formData.rate_per_item) {
        return 'Rate per item is required';
      }
      const rate = parseFloat(formData.rate_per_item);
      if (isNaN(rate) || rate <= 0) {
        return 'Rate per item must be a positive number';
      }
      if (rate > 10000) {
        return 'Rate per item must be 10,000 or less';
      }

      // Service area validation
      if (!formData.service_area.trim()) {
        return 'Service area is required for service providers';
      }
      if (formData.service_area.trim().length < 3) {
        return 'Service area must be at least 3 characters';
      }
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const submitData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.replace(/\D/g, ''),
        role: formData.role,
      };

      // Add dhobi-specific fields if registering as dhobi
      if (formData.role === 'dhobi') {
        submitData.service_area = formData.service_area.trim();
        submitData.experience_years = parseInt(formData.experience_years, 10);
        submitData.services_offered = formData.services_offered;
        submitData.rate_per_item = parseFloat(formData.rate_per_item);
      }

      await register(submitData);
      onSuccess?.();
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Register as</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFormData(prev => ({ ...prev, role: 'user' }));
                setError('');
              }}
              className={`p-3 rounded-lg font-medium text-sm transition ${
                formData.role === 'user'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFormData(prev => ({ ...prev, role: 'dhobi' }));
                setError('');
              }}
              className={`p-3 rounded-lg font-medium text-sm transition ${
                formData.role === 'dhobi'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              💼 Dhobi (Service Provider)
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
          {formData.phone && (
            <p className={`text-xs mt-1 ${
              /^\d{10}$/.test(formData.phone.replace(/\D/g, '')) && formData.phone[0] !== '0'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {/^\d{10}$/.test(formData.phone.replace(/\D/g, '')) && formData.phone[0] !== '0'
                ? '✓ Valid phone number'
                : '✗ Phone must be 10 digits (1-9 to 9999999999)'}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Dhobi-Specific Fields */}
        {formData.role === 'dhobi' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">🧺 Dhobi Profile Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Area *</label>
              <input
                type="text"
                name="service_area"
                value={formData.service_area}
                onChange={handleChange}
                placeholder="e.g., North Delhi, Sector 5"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '30px'
                }}
              >
                <option value="">Select years of experience</option>
                <option value="0">0 years (Fresher)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
                <option value="6">6 years</option>
                <option value="7">7 years</option>
                <option value="8">8 years</option>
                <option value="9">9 years</option>
                <option value="10">10 years</option>
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="25">25 years</option>
                <option value="30">30+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered *</label>
              <select
                name="services_offered"
                value={formData.services_offered}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '30px'
                }}
              >
                <option value="">Select primary service</option>
                <option value="Washing">Washing</option>
                <option value="Washing & Ironing">Washing & Ironing</option>
                <option value="Washing, Ironing & Dry Cleaning">Washing, Ironing & Dry Cleaning</option>
                <option value="Dry Cleaning">Dry Cleaning</option>
                <option value="Ironing">Ironing Only</option>
                <option value="Stain Removal">Stain Removal</option>
                <option value="Fabric Care">Special Fabric Care</option>
                <option value="All Services">All Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Item (₹) *</label>
              <input
                type="number"
                name="rate_per_item"
                step="0.50"
                min="0"
                max="10000"
                value={formData.rate_per_item}
                onChange={handleChange}
                placeholder="e.g., 15.00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
              {formData.rate_per_item && (
                <p className="text-xs mt-1 text-gray-600">
                  💰 Rate: ₹{parseFloat(formData.rate_per_item).toFixed(2)} per item
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer-Specific Fields */}
        {formData.role === 'user' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 text-sm">👤 Customer Profile</h3>
            <p className="text-xs text-gray-600 mt-2">
              ✓ You can book laundry services from registered Dhobis<br/>
              ✓ Track your orders and manage pickup/delivery<br/>
              ✓ Rate and review service providers
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-xs text-gray-600 text-center">
        Already have an account? Switch to the Log In tab above.
      </p>
    </div>
  );
}
