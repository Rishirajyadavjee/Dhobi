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
  getAdminAnalytics,
  getAdminReports,
  getDhobisWithDistance,
  updateOrder,
  deleteOrder,
  assignDhobi,
  confirmOrder,
  dhobiAcceptOrder,
  dhobiCancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Admin routes
router.get('/admin/stats', authenticate, authorize('admin'), getAdminStats);
router.get('/admin/analytics', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/admin/reports', authenticate, authorize('admin'), getAdminReports);
router.get('/admin/all', authenticate, authorize('admin'), getOrders);
router.get('/admin/:id/dhobis-with-distance', authenticate, authorize('admin'), getDhobisWithDistance);
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
router.put('/:id/accept', authenticate, authorize('dhobi'), dhobiAcceptOrder);
router.put('/:id/dhobi-accept', authenticate, authorize('dhobi'), dhobiAcceptOrder);
router.put('/:id/dhobi-cancel', authenticate, authorize('dhobi'), dhobiCancelOrder);

// General routes
router.get('/stats', authenticate, getOrderStats);

export default router;
