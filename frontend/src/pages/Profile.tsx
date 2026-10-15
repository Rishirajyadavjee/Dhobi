import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Lock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Save
} from 'lucide-react';
import axios from 'axios';

interface ProfileData {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  profile_image?: string;
  dhobiProfile?: {
    service_area?: string;
    experience_years?: number;
    rating?: number;
    total_orders?: number;
    is_verified?: boolean;
    availability_status?: string;
    services_offered?: string;
    rate_per_item?: number;
    bio?: string;
  };
}

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const { token, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState<'info' | 'dhobi' | 'security' | 'danger'>('info');

  // Edit Personal Info State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Dhobi Profile State
  const [serviceArea, setServiceArea] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [ratePerItem, setRatePerItem] = useState(0);
  const [bio, setBio] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');

  // Security (Password) State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Danger Zone
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const data = res.data.data;
        setProfileData(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');

        if (data.role === 'dhobi') {
          // Fetch dhobi details if available
          try {
            const dhobiRes = await axios.get(`${API_URL}/users/dhobi-profile/${data.id || data._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const dData = dhobiRes.data.data;
            if (dData) {
              setServiceArea(dData.service_area || '');
              setExperienceYears(dData.experience_years || 0);
              setRatePerItem(dData.rate_per_item || 0);
              setBio(dData.bio || '');
              setServicesOffered(dData.services_offered || '');
              setAvailabilityStatus(dData.availability_status || 'available');
            }
          } catch (e) {
            console.error('Failed to load dhobi profile subdata:', e);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setMessage({ type: 'error', text: 'Failed to retrieve profile information.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && (cleanPhone.length !== 10 || cleanPhone.startsWith('0'))) {
      setMessage({ type: 'error', text: 'Phone number must be exactly 10 digits and cannot start with 0.' });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/users/profile`,
        { name: name.trim(), phone: cleanPhone, address: address.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile information updated successfully.' });
        fetchProfile();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDhobiProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!serviceArea.trim()) {
      setMessage({ type: 'error', text: 'Service area is required.' });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/users/dhobi-profile/${profileData?.id || profileData?._id}`,
        {
          service_area: serviceArea.trim(),
          experience_years: experienceYears,
          rate_per_item: ratePerItem,
          bio: bio.trim(),
          services_offered: servicesOffered,
          availability_status: availabilityStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Dhobi atelier profile updated successfully.' });
        fetchProfile();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update dhobi profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Password successfully changed.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your account password to authorize deletion.');
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword }
      });
      alert('Your account has been deleted.');
      logout();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center pt-20">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Loading Account Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 pt-24 pb-20 selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-card shrink-0">
                {profileData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                    {profileData?.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {profileData?.role}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profileData?.email}</span>
                  {profileData?.phone && (
                    <>
                      <span className="text-stone-300">•</span>
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{profileData.phone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                profileData?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${profileData?.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {profileData?.status === 'active' ? 'Account Active' : 'Account Suspended'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-stone-100 overflow-x-auto pb-1 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('info'); setMessage({ type: '', text: '' }); }}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-slate-900 text-white shadow-soft font-bold'
                  : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              Personal Details
            </button>

            {profileData?.role === 'dhobi' && (
              <button
                onClick={() => { setActiveTab('dhobi'); setMessage({ type: '', text: '' }); }}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'dhobi'
                    ? 'bg-slate-900 text-white shadow-soft font-bold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
                }`}
              >
                Dhobi Service Profile
              </button>
            )}

            <button
              onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }); }}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white shadow-soft font-bold'
                  : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              Password & Security
            </button>

            <button
              onClick={() => { setActiveTab('danger'); setMessage({ type: '', text: '' }); }}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'bg-rose-600 text-white shadow-soft font-bold'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Danger Zone
            </button>
          </div>
        </div>

        {/* Status / Feedback message */}
        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Tab 1: Personal Details */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-1">Personal Information</h2>
            <p className="text-xs text-stone-500 mb-6">Manage your primary contact and doorstep collection details.</p>

            <form onSubmit={handleUpdateInfo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Registered Email Address (Permanent ID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={profileData?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">To change your primary email, contact customer support.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10 digits"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
                {phone && (
                  <p className={`text-xs mt-1 ${
                    /^\d{10}$/.test(phone) && phone[0] !== '0' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {/^\d{10}$/.test(phone) && phone[0] !== '0'
                      ? '✓ Valid 10-digit number'
                      : '✗ Must be 10 digits and cannot start with 0'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Default Doorstep Collection Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Apartment, Street address, City"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-stone-300 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-soft transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Dhobi Profile (Only visible if role === 'dhobi') */}
        {activeTab === 'dhobi' && profileData?.role === 'dhobi' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-1">Dhobi Atelier Settings</h2>
            <p className="text-xs text-stone-500 mb-6">Manage your service availability, operational zones, and laundry specialty rates.</p>

            <form onSubmit={handleUpdateDhobiProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Current Availability Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'available', label: '🟢 Available', desc: 'Accepting new hampers' },
                    { id: 'busy', label: '🟡 Busy', desc: 'Full capacity' },
                    { id: 'offline', label: '⚪ Offline', desc: 'Not on duty' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setAvailabilityStatus(st.id)}
                      className={`p-3 rounded-2xl text-left border text-xs transition ${
                        availabilityStatus === st.id
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <p>{st.label}</p>
                      <p className={`text-[10px] mt-0.5 ${availabilityStatus === st.id ? 'text-stone-300' : 'text-stone-400'}`}>
                        {st.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Service Operating Area
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Central London, West End, Kensington"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Years of Garment Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Base Rate Per Item (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ratePerItem}
                  onChange={(e) => setRatePerItem(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Services Offered
                </label>
                <input
                  type="text"
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  placeholder="e.g. Wash & Fold, Steam Press, Wool Restoration"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Dhobi Bio & Fabric Craftsmanship Notes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your textile experience, enzyme wash techniques, or tailoring precision..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-stone-300 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-soft transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Save Dhobi Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-1">Password & Security</h2>
            <p className="text-xs text-stone-500 mb-6">Ensure your account has a strong password to protect your delivery addresses and payment cards.</p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-stone-300 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-soft transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-soft">
            <h2 className="font-serif text-xl font-bold text-rose-700 mb-1">Delete Account & Data</h2>
            <p className="text-xs text-stone-500 mb-6">
              Permanently delete your profile, saved hampers, addresses, and payment tokens. This action is irreversible.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-soft transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Proceed to Account Deletion</span>
            </button>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-md p-6 border border-stone-200 space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Please enter your current account password to authorize permanent deletion of your profile and records.
            </p>
            <input
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-full"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
