import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Briefcase } from 'lucide-react';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user' as 'user' | 'dhobi',
    service_area: '',
    experience_years: '',
    services_offered: '',
    rate_per_item: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build the data object based on role
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      // Add dhobi-specific fields if registering as dhobi
      if (formData.role === 'dhobi') {
        Object.assign(submitData, {
          service_area: formData.service_area,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : undefined,
          services_offered: formData.services_offered,
          rate_per_item: formData.rate_per_item ? parseFloat(formData.rate_per_item) : undefined
        });
      }

      await register(submitData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={32} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Dhobi Service today</p>
        </div>

        {error && (
          <div className="error-box">
            <div className="error-icon">
              <AlertCircle size={18} />
            </div>
            <p className="error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="role-selector-top">
            <label>Register as</label>
            <div className="role-toggle">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`role-btn-toggle ${formData.role === 'user' ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'dhobi' })}
                className={`role-btn-toggle ${formData.role === 'dhobi' ? 'active' : ''}`}
              >
                <Briefcase size={18} />
                <span>Dhobi (Service Provider)</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <User size={18} />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Phone size={18} />
              </div>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Dhobi-specific fields */}
          {formData.role === 'dhobi' && (
            <div className="dhobi-section">
              <h3>Dhobi Profile Information</h3>
              
              <div className="form-group">
                <label htmlFor="service_area">Service Area</label>
                <input
                  id="service_area"
                  type="text"
                  value={formData.service_area}
                  onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                  placeholder="e.g., North Delhi, Sector 5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience_years">Years of Experience</label>
                <input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="services_offered">Services Offered</label>
                <input
                  id="services_offered"
                  type="text"
                  value={formData.services_offered}
                  onChange={(e) => setFormData({ ...formData, services_offered: e.target.value })}
                  placeholder="e.g., Washing, Ironing, Dry Cleaning"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rate_per_item">Rate per Item (₹)</label>
                <input
                  id="rate_per_item"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.rate_per_item}
                  onChange={(e) => setFormData({ ...formData, rate_per_item: e.target.value })}
                  placeholder="e.g., 15.00"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
