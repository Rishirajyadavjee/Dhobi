import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllUsers,
  getDhobis,
  getUserStats,
  getUserProfile,
  updateUserProfile,
  getDhobiProfile,
  createDhobiProfile,
  updateDhobiProfile,
  deleteUserAccount
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllUsers);
router.get('/admin/dhobis', authenticate, authorize('admin'), getDhobis);
router.get('/admin/stats', authenticate, authorize('admin'), getUserStats);

// Public dhobi list (for assigning to orders)
router.get('/dhobis', authenticate, authorize('admin'), getDhobis);

// User routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.delete('/profile', authenticate, deleteUserAccount);

// Dhobi profile routes (CRUD)
router.get('/dhobi-profile/:userId?', authenticate, getDhobiProfile);
router.post('/dhobi-profile', authenticate, authorize('dhobi'), createDhobiProfile);
router.put('/dhobi-profile/:userId?', authenticate, authorize('dhobi'), updateDhobiProfile);

export default router;
