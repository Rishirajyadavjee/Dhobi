import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/profile.css';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: string;
  profile_image?: string;
}

interface FormData {
  name: string;
  phone: string;
  address: string;
}

interface DhobiProfileData {
  user_id: number;
  service_area: string;
  experience_years: number;
  rate_per_item: number;
  bio: string;
}

type TabType = 'view' | 'edit' | 'dhobi' | 'security' | 'preferences';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [dhobiProfile, setDhobiProfile] = useState<DhobiProfileData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: ''
  });
  const [dhobiFormData, setDhobiFormData] = useState<DhobiProfileData>({
    user_id: 0,
    service_area: '',
    experience_years: 0,
    rate_per_item: 0,
    bio: ''
  });
  const [activeTab, setActiveTab] = useState<TabType>('view');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setProfileData(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
        
        // Fetch dhobi profile if user is a dhobi
        if (data.role === 'dhobi') {
          fetchDhobiProfile(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDhobiProfile = async (userId: number) => {
    try {
      const response = await axios.get(`${API_URL}/users/dhobi-profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        setDhobiProfile(response.data.data);
        setDhobiFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dhobi profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDhobiInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDhobiFormData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };

      const response = await axios.put(
        `${API_URL}/users/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, ...updateData } : null);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      });
    }
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setMessage({ type: '', text: '' });
  };

  const handleSaveDhobiProfile = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      if (!dhobiFormData.service_area || dhobiFormData.experience_years === 0) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setSaving(false);
        return;
      }

      const endpoint = dhobiProfile 
        ? `${API_URL}/users/dhobi-profile/${profileData?.id}`
        : `${API_URL}/users/dhobi-profile`;

      const method = dhobiProfile ? 'put' : 'post';

      const response = await axios[method](
        endpoint,
        dhobiFormData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setDhobiProfile(response.data.data);
        setMessage({ 
          type: 'success', 
          text: dhobiProfile ? 'Dhobi profile updated successfully!' : 'Dhobi profile created successfully!'
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error: any) {
      console.error('Error saving dhobi profile:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save dhobi profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage({ type: 'error', text: 'Please fill in all password fields' });
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }

      setSaving(true);
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      if (!deletePassword) {
        setMessage({ type: 'error', text: 'Please enter your password to confirm deletion' });
        return;
      }

      setSaving(true);
      const response = await axios.delete(
        `${API_URL}/users/profile`,
        {
          data: { password: deletePassword },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Account deleted successfully. Logging out...' });
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete account';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Profile Not Found</h2>
          <p>Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-role">{profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}</p>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            👁️ View Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Edit Profile
          </button>
          {profileData.role === 'dhobi' && (
            <button
              className={`tab-btn ${activeTab === 'dhobi' ? 'active' : ''}`}
              onClick={() => setActiveTab('dhobi')}
            >
              🧑‍💼 Dhobi Info
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Settings
          </button>
        </div>

        {message.text && (
          <div className={`profile-message profile-message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          {/* VIEW TAB */}
          {activeTab === 'view' && (
            <>
              {/* Profile Avatar Section */}
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {profileData.profile_image ? (
                    <img src={profileData.profile_image} alt={profileData.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="profile-info">
                <div className="info-group">
                  <label>Full Name</label>
                  <div className="info-value">{profileData.name}</div>
                </div>

                <div className="info-group">
                  <label>Email Address</label>
                  <div className="info-value">{profileData.email}</div>
                </div>

                <div className="info-group">
                  <label>Phone Number</label>
                  <div className="info-value">{profileData.phone || 'Not provided'}</div>
                </div>

                <div className="info-group">
                  <label>Address</label>
                  <div className="info-value">{profileData.address || 'Not provided'}</div>
                </div>

                <div className="info-group">
                  <label>Status</label>
                  <div className={`status-badge status-${profileData.status}`}>
                    {profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1)}
                  </div>
                </div>

                <div className="info-group">
                  <label>Account ID</label>
                  <div className="info-value">#{profileData.id}</div>
                </div>
              </div>
            </>
          )}

          {/* EDIT TAB */}
          {activeTab === 'edit' && (
            <>
              {/* Profile Avatar Section */}
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" />
                  ) : profileData.profile_image ? (
                    <img src={profileData.profile_image} alt={profileData.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="avatar-upload">
                  <label htmlFor="profile-image-input" className="upload-label">
                    📷 Choose Photo
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                </div>
              </div>

              {/* Edit Form */}
              <div className="profile-info">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address (Read-only)</label>
                  <input
                    id="email"
                    type="email"
                    value={profileData.email}
                    className="form-input disabled"
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>

                <div className="profile-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </>
          )}

          {/* DHOBI PROFILE TAB */}
          {activeTab === 'dhobi' && profileData.role === 'dhobi' && (
            <>
              <div className="dhobi-info-section">
                <h2>Dhobi Profile Information</h2>
                
                {dhobiProfile ? (
                  <div className="dhobi-display">
                    <div className="info-group">
                      <label>Service Area</label>
                      <div className="info-value">{dhobiProfile.service_area}</div>
                    </div>

                    <div className="info-group">
                      <label>Experience (Years)</label>
                      <div className="info-value">{dhobiProfile.experience_years} years</div>
                    </div>

                    <div className="info-group">
                      <label>Rate Per Item</label>
                      <div className="info-value">₹{dhobiProfile.rate_per_item}</div>
                    </div>

                    <div className="info-group">
                      <label>Bio</label>
                      <div className="info-value">{dhobiProfile.bio || 'No bio provided'}</div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab('edit')}
                    >
                      ✏️ Update Dhobi Profile
                    </button>
                  </div>
                ) : (
                  <div className="no-dhobi-profile">
                    <p>No dhobi profile found. Create one to get started!</p>
                  </div>
                )}

                <div className="dhobi-form">
                  <h3>{dhobiProfile ? 'Update' : 'Create'} Dhobi Profile</h3>

                  <div className="form-group">
                    <label htmlFor="service_area">Service Area *</label>
                    <input
                      id="service_area"
                      type="text"
                      name="service_area"
                      value={dhobiFormData.service_area}
                      onChange={handleDhobiInputChange}
                      className="form-input"
                      placeholder="e.g., Downtown, North Side"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience_years">Experience (Years) *</label>
                    <input
                      id="experience_years"
                      type="number"
                      name="experience_years"
                      value={dhobiFormData.experience_years}
                      onChange={handleDhobiInputChange}
                      className="form-input"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rate_per_item">Rate Per Item (₹)</label>
                    <input
                      id="rate_per_item"
                      type="number"
                      name="rate_per_item"
                      value={dhobiFormData.rate_per_item}
                      onChange={handleDhobiInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={dhobiFormData.bio}
                      onChange={handleDhobiInputChange}
                      className="form-textarea"
                      placeholder="Tell customers about yourself"
                      rows={4}
                    />
                  </div>

                  <div className="profile-actions">
                    <button
                      className="btn btn-success"
                      onClick={handleSaveDhobiProfile}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : '💾 Save Dhobi Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="security-section">
              <h2>Security Settings</h2>

              <div className="security-form">
                <h3>Change Password</h3>

                <div className="form-group">
                  <label htmlFor="current-password">Current Password *</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password *</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password *</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="profile-actions">
                  <button
                    className="btn btn-success"
                    onClick={handleChangePassword}
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : '🔐 Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES/SETTINGS TAB */}
          {activeTab === 'preferences' && (
            <div className="preferences-section">
              <h2>Account Settings</h2>

              <div className="settings-group">
                <h3>Account Information</h3>
                <div className="setting-item">
                  <strong>Account ID:</strong> #{profileData.id}
                </div>
                <div className="setting-item">
                  <strong>Role:</strong> {profileData.role.toUpperCase()}
                </div>
                <div className="setting-item">
                  <strong>Status:</strong> {profileData.status}
                </div>
                <div className="setting-item">
                  <strong>Email:</strong> {profileData.email}
                </div>
              </div>

              <div className="settings-group danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <p>These actions cannot be undone.</p>

                {!showDeleteConfirm ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    🗑️ Delete Account
                  </button>
                ) : (
                  <div className="delete-confirmation">
                    <h4>Delete Account?</h4>
                    <p>This will permanently delete your account and all associated data.</p>
                    
                    <div className="form-group">
                      <label htmlFor="delete-password">Enter your password to confirm *</label>
                      <input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="form-input"
                        placeholder="Your password"
                      />
                    </div>

                    <div className="profile-actions">
                      <button
                        className="btn btn-danger"
                        onClick={handleDeleteProfile}
                        disabled={saving || !deletePassword}
                      >
                        {saving ? 'Deleting...' : '✓ Confirm Delete'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                        }}
                        disabled={saving}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
