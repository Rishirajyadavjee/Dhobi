import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Get all users with optional filtering (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('name email phone role status address dhobiProfile createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users.map(u => ({
        ...u,
        _id: String(u._id),
        id: String(u._id),
        created_at: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Create User (Admin)
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'user',
      status = 'active',
      address,
      service_area,
      experience_years,
      services_offered,
      rate_per_item
    } = req.body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').toString().replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    if (cleanPhone.startsWith('0')) {
      return res.status(400).json({ success: false, message: 'Phone number cannot start with 0.' });
    }

    // Check email uniqueness
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    // Check phone uniqueness
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'A user with this phone number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role,
      status,
      address: (address || '').trim()
    };

    if (role === 'dhobi') {
      userData.dhobiProfile = {
        service_area: (service_area || '').trim(),
        experience_years: Number(experience_years) || 0,
        services_offered: services_offered || '',
        rate_per_item: Number(rate_per_item) || 0,
        is_verified: true,
        availability_status: 'available'
      };
    }

    const newUser = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: String(newUser._id),
        id: String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        address: newUser.address,
        dhobiProfile: newUser.dhobiProfile,
        created_at: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create user' });
  }
};

// Update User (Admin)
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      status,
      password,
      address,
      service_area,
      experience_years,
      services_offered,
      rate_per_item,
      is_verified,
      availability_status
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check duplicate email if changed
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'Email address is already in use by another user.' });
        }
        user.email = cleanEmail;
      }
    }

    // Check duplicate phone if changed
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, '');
      if (cleanPhone.length !== 10 || cleanPhone.startsWith('0')) {
        return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit number not starting with 0.' });
      }
      if (cleanPhone !== user.phone) {
        const existingPhone = await User.findOne({ phone: cleanPhone, _id: { $ne: id } });
        if (existingPhone) {
          return res.status(400).json({ success: false, message: 'Phone number is already registered to another user.' });
        }
        user.phone = cleanPhone;
      }
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (address !== undefined) user.address = address.trim();

    if (password && password.trim().length >= 6) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    // If role is dhobi, update dhobiProfile
    if (user.role === 'dhobi') {
      user.dhobiProfile = {
        service_area: service_area !== undefined ? service_area.trim() : (user.dhobiProfile?.service_area || ''),
        experience_years: experience_years !== undefined ? Number(experience_years) : (user.dhobiProfile?.experience_years || 0),
        services_offered: services_offered !== undefined ? services_offered : (user.dhobiProfile?.services_offered || ''),
        rate_per_item: rate_per_item !== undefined ? Number(rate_per_item) : (user.dhobiProfile?.rate_per_item || 0),
        is_verified: is_verified !== undefined ? Boolean(is_verified) : (user.dhobiProfile?.is_verified ?? false),
        availability_status: availability_status || user.dhobiProfile?.availability_status || 'available'
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: String(user._id),
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        address: user.address,
        dhobiProfile: user.dhobiProfile,
        created_at: user.createdAt
      }
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user' });
  }
};

// Delete User (Admin)
export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own account.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete associated orders
    await Order.deleteMany({ $or: [{ user_id: id }, { dhobi_id: id }] });
    await User.findByIdAndDelete(id);

    res.json({ success: true, message: `User "${user.name}" and associated records deleted successfully.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
};

// Quick Toggle User Status (Admin)
export const toggleUserStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active, suspended, or inactive.' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('name email status');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      data: user
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle status' });
  }
};

// Get all dhobis (Admin)
export const getDhobis = async (req, res) => {
  try {
    const dhobis = await User.find({ role: 'dhobi' })
      .select('name email phone status dhobiProfile')
      .lean();

    const formatted = dhobis
      .map(u => ({
        _id: String(u._id),  // Include _id as MongoDB ObjectId string
        id: String(u._id),   // Also include id for compatibility
        name: u.name,
        email: u.email,
        phone: u.phone,
        status: u.status,
        service_area: u.dhobiProfile?.service_area || null,
        experience_years: u.dhobiProfile?.experience_years || null,
        rating: u.dhobiProfile?.rating || 0,
        total_orders: u.dhobiProfile?.total_orders || 0,
        is_verified: u.dhobiProfile?.is_verified || false
      }))
      .sort((a, b) => b.rating - a.rating);

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get dhobis error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dhobis', error: error.message });
  }
};

// Get user statistics (Admin)
export const getUserStats = async (req, res) => {
  try {
    const [totalCustomers, totalDhobis, activeUsers, suspendedUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'dhobi' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' })
    ]);

    res.json({
      success: true,
      data: { totalCustomers, totalDhobis, activeUsers, suspendedUsers }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user statistics', error: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email phone role status profile_image address')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { ...user, id: user._id } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    await User.findByIdAndUpdate(req.user.id, { name, phone, address });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

// Get Dhobi Profile
export const getDhobiProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findOne({ _id: userId, role: 'dhobi' })
      .select('dhobiProfile')
      .lean();

    if (!user) {
      return res.json({ success: true, data: null, message: 'No dhobi profile found' });
    }

    res.json({ success: true, data: user.dhobiProfile || null });
  } catch (error) {
    console.error('Get dhobi profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dhobi profile', error: error.message });
  }
};

// Create Dhobi Profile
export const createDhobiProfile = async (req, res) => {
  try {
    const { service_area, experience_years, rate_per_item, bio } = req.body;

    if (!service_area || experience_years === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Service area and experience years are required'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.dhobiProfile && user.dhobiProfile.service_area) {
      return res.status(400).json({
        success: false,
        message: 'Dhobi profile already exists. Use update instead.'
      });
    }

    user.dhobiProfile = {
      service_area,
      experience_years,
      rate_per_item: rate_per_item || 0,
      bio: bio || ''
    };

    await user.save();

    res.status(201).json({
      success: true,
      data: user.dhobiProfile,
      message: 'Dhobi profile created successfully'
    });
  } catch (error) {
    console.error('Create dhobi profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to create dhobi profile', error: error.message });
  }
};

// Update Dhobi Profile
export const updateDhobiProfile = async (req, res) => {
  try {
    const { service_area, experience_years, rate_per_item, bio } = req.body;
    const userId = req.params.userId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'dhobiProfile.service_area': service_area,
          'dhobiProfile.experience_years': experience_years,
          'dhobiProfile.rate_per_item': rate_per_item || 0,
          'dhobiProfile.bio': bio || ''
        }
      },
      { new: true }
    ).select('dhobiProfile');

    res.json({
      success: true,
      data: user.dhobiProfile,
      message: 'Dhobi profile updated successfully'
    });
  } catch (error) {
    console.error('Update dhobi profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update dhobi profile', error: error.message });
  }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Delete associated orders then the user
    await Order.deleteMany({ user_id: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account', error: error.message });
  }
};
