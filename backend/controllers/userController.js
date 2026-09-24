import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email phone role status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users.map(u => ({ ...u, id: u._id, created_at: u.createdAt }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
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
