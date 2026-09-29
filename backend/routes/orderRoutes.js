import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getOrders,
  getOrderStats,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getDhobiOrders,
  getAdminStats,
  updateOrder,
  deleteOrder,
  assignDhobi,
  confirmOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Admin routes
router.get('/admin/stats', authenticate, authorize('admin'), getAdminStats);
router.get('/admin/all', authenticate, authorize('admin'), getOrders);
router.put('/admin/:id', authenticate, authorize('admin'), updateOrder);
router.put('/admin/:id/assign-dhobi', authenticate, authorize('admin'), assignDhobi);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteOrder);

// User routes
router.get('/user', authenticate, authorize('user'), getUserOrders);
router.post('/', authenticate, authorize('user'), createOrder);

// Dhobi routes
router.get('/dhobi', authenticate, authorize('dhobi'), getDhobiOrders);
router.put('/:id/status', authenticate, authorize('dhobi'), updateOrderStatus);
router.put('/:id/confirm', authenticate, authorize('dhobi'), confirmOrder);

// General routes
router.get('/stats', authenticate, getOrderStats);

export default router;
