import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import crypto from 'crypto';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const DHOBI_PAYMENT_LIMIT_PER_MONTH = 3; // Dhobi can receive payment 3 times per month

// Helper function to generate unique payment ID
const generatePaymentId = () => {
  return 'PAY_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
};

// Helper function to get current month's first day
const getMonthStart = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Helper function to get current month's last day
const getMonthEnd = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// ===================== USER PAYMENT APIs =====================

/**
 * User makes payment for an order
 */
export const createOrderPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod = 'cash', description = '' } = req.body;
    const userId = req.user.id;

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Order does not belong to user' });
    }

    // Create payment record
    const payment = new Payment({
      payment_id: generatePaymentId(),
      transaction_id: 'TXN_' + Date.now(),
      user_id: userId,
      order_id: orderId,
      amount: amount,
      payment_type: 'order_payment',
      payment_method: paymentMethod,
      payment_status: 'completed',
      description: description || `Payment for order ${order.order_number}`,
      processed_by: userId,
      processed_at: new Date()
    });

    await payment.save();

    // Update order payment status
    order.payment_status = 'paid';
    order.payment_method = paymentMethod;
    await order.save();

    // Update user's total spent
    const user = await User.findById(userId);
    if (user) {
      user.total_spent = (user.total_spent || 0) + amount;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error creating order payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get payment history for a user
 */
export const getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    const payments = await Payment.find({
      user_id: userId,
      payment_type: 'order_payment'
    })
      .populate('order_id', 'order_number service_type total_amount')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments({
      user_id: userId,
      payment_type: 'order_payment'
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching user payment history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get user wallet/account summary
 */
export const getUserWalletSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalPayments = await Payment.aggregate([
      {
        $match: {
          user_id: new (require('mongodb').ObjectId)(userId),
          payment_type: 'order_payment',
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        wallet_balance: user.wallet_balance || 0,
        total_spent: user.total_spent || 0,
        total_payments_made: totalPayments[0]?.total || 0,
        payment_count: totalPayments[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching wallet summary:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ===================== DHOBI PAYMENT APIs =====================

/**
 * Admin/System creates payment for dhobi (for completed work)
 */
export const createDhobiPayment = async (req, res) => {
  try {
    const { dhobiId, amount, paymentMethod = 'bank_transfer', description = '', orderId = null } = req.body;
    const adminId = req.user.id;

    // Verify requesting user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can process dhobi payments' });
    }

    // Verify dhobi exists and has dhobi role
    const dhobi = await User.findById(dhobiId);
    if (!dhobi || dhobi.role !== 'dhobi') {
      return res.status(404).json({ message: 'Dhobi not found' });
    }

    // Check monthly payment limit for this dhobi
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    const paymentsThisMonth = await Payment.countDocuments({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment',
      payment_status: 'completed',
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    if (paymentsThisMonth >= DHOBI_PAYMENT_LIMIT_PER_MONTH) {
      return res.status(400).json({
        message: `Dhobi has already received ${DHOBI_PAYMENT_LIMIT_PER_MONTH} payments this month. Limit reached.`,
        data: {
          payments_this_month: paymentsThisMonth,
          monthly_limit: DHOBI_PAYMENT_LIMIT_PER_MONTH
        }
      });
    }

    // Create payment record
    const payment = new Payment({
      payment_id: generatePaymentId(),
      transaction_id: 'TXN_' + Date.now(),
      dhobi_id: dhobiId,
      user_id: dhobiId,
      order_id: orderId ? require('mongodb').ObjectId.isValid(orderId) ? orderId : null : null,
      amount: amount,
      payment_type: 'dhobi_payment',
      payment_method: paymentMethod,
      payment_status: 'completed',
      payment_month: monthStart,
      payment_number_in_month: paymentsThisMonth + 1,
      description: description || `Dhobi payment #${paymentsThisMonth + 1}`,
      processed_by: adminId,
      processed_at: new Date()
    });

    await payment.save();

    // Update dhobi wallet and statistics
    dhobi.dhobiProfile.wallet_balance = (dhobi.dhobiProfile.wallet_balance || 0) + amount;
    dhobi.dhobiProfile.total_earnings = (dhobi.dhobiProfile.total_earnings || 0) + amount;
    dhobi.dhobiProfile.payments_this_month = paymentsThisMonth + 1;
    dhobi.dhobiProfile.last_payment_date = new Date();
    await dhobi.save();

    res.status(201).json({
      success: true,
      message: 'Dhobi payment processed successfully',
      data: {
        payment,
        dhobi_balance: dhobi.dhobiProfile.wallet_balance,
        payments_this_month: dhobi.dhobiProfile.payments_this_month,
        remaining_payments_this_month: DHOBI_PAYMENT_LIMIT_PER_MONTH - (paymentsThisMonth + 1)
      }
    });
  } catch (error) {
    console.error('Error creating dhobi payment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get dhobi payment history
 */
export const getDhobiPaymentHistory = async (req, res) => {
  try {
    const { dhobiId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Verify dhobi exists
    const dhobi = await User.findById(dhobiId);
    if (!dhobi || dhobi.role !== 'dhobi') {
      return res.status(404).json({ message: 'Dhobi not found' });
    }

    const payments = await Payment.find({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment'
    })
      .populate('order_id', 'order_number service_type total_amount')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment'
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching dhobi payment history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get dhobi payment summary
 */
export const getDhobiPaymentSummary = async (req, res) => {
  try {
    const { dhobiId } = req.params;

    const dhobi = await User.findById(dhobiId);
    if (!dhobi || dhobi.role !== 'dhobi') {
      return res.status(404).json({ message: 'Dhobi not found' });
    }

    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    // Get current month's payment count
    const paymentsThisMonth = await Payment.countDocuments({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment',
      payment_status: 'completed',
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    // Get total lifetime earnings
    const totalEarnings = await Payment.aggregate([
      {
        $match: {
          dhobi_id: new (require('mongodb').ObjectId)(dhobiId),
          payment_type: 'dhobi_payment',
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        wallet_balance: dhobi.dhobiProfile?.wallet_balance || 0,
        total_earnings: dhobi.dhobiProfile?.total_earnings || 0,
        payments_this_month: paymentsThisMonth,
        remaining_payments_this_month: DHOBI_PAYMENT_LIMIT_PER_MONTH - paymentsThisMonth,
        monthly_limit: DHOBI_PAYMENT_LIMIT_PER_MONTH,
        last_payment_date: dhobi.dhobiProfile?.last_payment_date,
        lifetime_payments_received: totalEarnings[0]?.count || 0,
        lifetime_earnings: totalEarnings[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dhobi payment summary:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Dhobi can view their own payment history
 */
export const getDhobiOwnPaymentHistory = async (req, res) => {
  try {
    const dhobiId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    const user = await User.findById(dhobiId);
    if (!user || user.role !== 'dhobi') {
      return res.status(403).json({ message: 'Only dhobis can access this endpoint' });
    }

    const payments = await Payment.find({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment'
    })
      .populate('order_id', 'order_number service_type total_amount')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment'
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching dhobi payment history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// ===================== ADMIN PAYMENT TRACKING APIs =====================

/**
 * Get all payments (admin view)
 */
export const getAllPayments = async (req, res) => {
  try {
    const { paymentType, paymentStatus, limit = 50, skip = 0, dhobiId = null } = req.query;

    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this endpoint' });
    }

    const filter = {};
    if (paymentType) filter.payment_type = paymentType;
    if (paymentStatus) filter.payment_status = paymentStatus;
    if (dhobiId) filter.dhobi_id = dhobiId;

    const payments = await Payment.find(filter)
      .populate('user_id', 'name email')
      .populate('dhobi_id', 'name email')
      .populate('order_id', 'order_number service_type total_amount')
      .populate('processed_by', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Get payment statistics for admin dashboard
 */
export const getPaymentStatistics = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this endpoint' });
    }

    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    // Total revenue from user payments
    const userPayments = await Payment.aggregate([
      {
        $match: {
          payment_type: 'order_payment',
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: '$amount' },
          total_transactions: { $sum: 1 }
        }
      }
    ]);

    // Dhobi payment statistics
    const dhobiPayments = await Payment.aggregate([
      {
        $match: {
          payment_type: 'dhobi_payment',
          payment_status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total_paid: { $sum: '$amount' },
          total_transactions: { $sum: 1 }
        }
      }
    ]);

    // Current month's dhobi payments
    const monthlyDhobiPayments = await Payment.aggregate([
      {
        $match: {
          payment_type: 'dhobi_payment',
          payment_status: 'completed',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$dhobi_id',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending payments
    const pendingPayments = await Payment.aggregate([
      {
        $match: {
          payment_status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user_payments: {
          total_revenue: userPayments[0]?.total_revenue || 0,
          total_transactions: userPayments[0]?.total_transactions || 0
        },
        dhobi_payments: {
          total_paid: dhobiPayments[0]?.total_paid || 0,
          total_transactions: dhobiPayments[0]?.total_transactions || 0
        },
        monthly_dhobi_payments: monthlyDhobiPayments,
        pending_payments: {
          total: pendingPayments[0]?.total || 0,
          count: pendingPayments[0]?.count || 0
        },
        month: {
          start: monthStart,
          end: monthEnd
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * Check dhobi's monthly payment limit status
 */
export const checkDhobiMonthlyLimitStatus = async (req, res) => {
  try {
    const { dhobiId } = req.params;

    const dhobi = await User.findById(dhobiId);
    if (!dhobi || dhobi.role !== 'dhobi') {
      return res.status(404).json({ message: 'Dhobi not found' });
    }

    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();

    const paymentsThisMonth = await Payment.countDocuments({
      dhobi_id: dhobiId,
      payment_type: 'dhobi_payment',
      payment_status: 'completed',
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    const canReceivePayment = paymentsThisMonth < DHOBI_PAYMENT_LIMIT_PER_MONTH;

    res.json({
      success: true,
      data: {
        dhobi_id: dhobiId,
        dhobi_name: dhobi.name,
        payments_this_month: paymentsThisMonth,
        monthly_limit: DHOBI_PAYMENT_LIMIT_PER_MONTH,
        can_receive_payment: canReceivePayment,
        remaining_payments: DHOBI_PAYMENT_LIMIT_PER_MONTH - paymentsThisMonth,
        month_period: {
          start: monthStart,
          end: monthEnd
        }
      }
    });
  } catch (error) {
    console.error('Error checking dhobi limit status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
