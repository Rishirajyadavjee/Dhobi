import express from 'express';
import {
  // User payment APIs
  createOrderPayment,
  getUserPaymentHistory,
  getUserWalletSummary,
  // Dhobi payment APIs
  createDhobiPayment,
  getDhobiPaymentHistory,
  getDhobiPaymentSummary,
  getDhobiOwnPaymentHistory,
  // Admin payment APIs
  getAllPayments,
  getPaymentStatistics,
  checkDhobiMonthlyLimitStatus
} from '../controllers/paymentController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ==================== USER PAYMENT ROUTES ====================

// Create payment for order
router.post('/user/order-payment', authenticate, createOrderPayment);

// Get user payment history
router.get('/user/payment-history', authenticate, getUserPaymentHistory);

// Get user wallet summary
router.get('/user/wallet-summary', authenticate, getUserWalletSummary);

// ==================== DHOBI PAYMENT ROUTES ====================

// Get dhobi's own payment history
router.get('/dhobi/payment-history', authenticate, getDhobiOwnPaymentHistory);

// Get dhobi's payment summary (accessible to dhobi)
router.get('/dhobi/payment-summary', authenticate, async (req, res) => {
  // Dhobi can only see their own summary
  const dhobiId = req.user.id;
  const user = await (await import('../models/User.js')).default.findById(dhobiId);
  
  if (!user || user.role !== 'dhobi') {
    return res.status(403).json({ message: 'Only dhobis can access this endpoint' });
  }
  
  // Delegate to getDhobiPaymentSummary
  req.params.dhobiId = dhobiId;
  return getDhobiPaymentSummary(req, res);
});

// ==================== ADMIN PAYMENT ROUTES ====================

// Create dhobi payment (admin only)
router.post('/admin/dhobi-payment', authenticate, createDhobiPayment);

// Get all payments (admin only)
router.get('/admin/all-payments', authenticate, getAllPayments);

// Get payment statistics (admin only)
router.get('/admin/statistics', authenticate, getPaymentStatistics);

// Get specific dhobi payment history (admin only)
router.get('/admin/dhobi/:dhobiId/payment-history', authenticate, getDhobiPaymentHistory);

// Get specific dhobi payment summary (admin only)
router.get('/admin/dhobi/:dhobiId/payment-summary', authenticate, getDhobiPaymentSummary);

// Check dhobi monthly payment limit status (admin only)
router.get('/admin/dhobi/:dhobiId/limit-status', authenticate, checkDhobiMonthlyLimitStatus);

export default router;
