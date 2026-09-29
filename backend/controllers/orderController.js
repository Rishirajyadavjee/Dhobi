import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Pricing configuration (per item)
const SERVICE_PRICING = {
  'wash': 50,        // ₹50 per item
  'dry-clean': 80,   // ₹80 per item
  'iron': 30,        // ₹30 per item
  'wash-iron': 100   // ₹100 per item
};

// Get all orders (Admin)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('user_id', 'name')
      .populate('dhobi_id', 'name')
      .lean();

    // Normalise field names for frontend compatibility
    const formatted = orders.map(o => ({
      ...o,
      _id: String(o._id), // Ensure _id is string (in case it's stored as numeric)
      id: String(o._id),  // Also provide id field
      customer_name: o.user_id?.name || null,
      dhobi_name: o.dhobi_id?.name || null,
      created_at: o.createdAt
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders.map(o => ({ ...o, id: o._id, created_at: o.createdAt })) });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your orders', error: error.message });
  }
};

// Get dhobi's assigned orders
export const getDhobiOrders = async (req, res) => {
  try {
    const orders = await Order.find({ dhobi_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user_id', 'name phone')
      .lean();

    const formatted = orders.map(o => ({
      ...o,
      id: o._id,
      customer_name: o.user_id?.name || null,
      customer_phone: o.user_id?.phone || null,
      created_at: o.createdAt
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get dhobi orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned orders', error: error.message });
  }
};

// Get admin statistics
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDhobis,
      totalOrders,
      revenueResult,
      recentOrders,
      activeDhobis
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'dhobi' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user_id', 'name')
        .lean(),
      User.aggregate([
        { $match: { role: 'dhobi' } },
        {
          $lookup: {
            from: 'orders',
            let: { uid: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$dhobi_id', '$$uid'] }, { $eq: ['$status', 'delivered'] }] } } },
              { $count: 'count' }
            ],
            as: 'completedOrdersData'
          }
        },
        {
          $project: {
            name: 1,
            rating: '$dhobiProfile.rating',
            completed_orders: { $ifNull: [{ $arrayElemAt: ['$completedOrdersData.count', 0] }, 0] }
          }
        },
        { $sort: { rating: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDhobis,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        recentOrders: recentOrders.map(o => ({ ...o, id: o._id, customer_name: o.user_id?.name || null })),
        activeDhobis
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
};

// Create order
export const createOrder = async (req, res) => {
  try {
    const { service_type, pickup_address, delivery_address, pickup_date, total_items, notes } = req.body;

    console.log('Order creation request:', { service_type, pickup_address, delivery_address, pickup_date, total_items, notes, user_id: req.user?.id });

    if (!service_type || !pickup_address || !delivery_address || !pickup_date || !total_items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: service_type, pickup_address, delivery_address, pickup_date, total_items'
      });
    }

    if (!SERVICE_PRICING[service_type]) {
      return res.status(400).json({
        success: false,
        message: `Invalid service_type. Allowed values: ${Object.keys(SERVICE_PRICING).join(', ')}`
      });
    }

    const pricePerItem = SERVICE_PRICING[service_type];
    const calculatedAmount = pricePerItem * total_items;
    const order_number = `ORD-${Date.now()}`;

    const order = await Order.create({
      user_id: req.user.id,
      order_number,
      service_type,
      pickup_address,
      delivery_address,
      pickup_date,
      total_items,
      total_amount: calculatedAmount,
      notes: notes || '',
      status: 'pending'
    });

    console.log('Order inserted successfully:', { id: order._id, order_number });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order._id,
        order_number,
        total_amount: calculatedAmount
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

// Update order status (Dhobi)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    await Order.findOneAndUpdate(
      { _id: id, dhobi_id: req.user.id },
      { status }
    );

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

// Get order statistics (User)
export const getOrderStats = async (req, res) => {
  try {
    const activeStatuses = ['pending', 'confirmed', 'picked-up', 'processing'];

    const [activeOrders, completedOrders, revenueResult] = await Promise.all([
      Order.countDocuments({ user_id: req.user.id, status: { $in: activeStatuses } }),
      Order.countDocuments({ user_id: req.user.id, status: 'delivered' }),
      Order.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(req.user.id), payment_status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        activeOrders,
        completedOrders,
        totalSpent: revenueResult[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
};

// Admin: Update Order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dhobi_id, payment_status } = req.body;

    if (!status && !dhobi_id && !payment_status) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (status, dhobi_id, payment_status) is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (dhobi_id) updateFields.dhobi_id = dhobi_id;
    if (payment_status) updateFields.payment_status = payment_status;

    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
};

// Admin: Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
  }
};

// Admin: Assign Dhobi to Order
export const assignDhobi = async (req, res) => {
  try {
    const { id } = req.params;
    const { dhobi_id } = req.body;

    console.log('assignDhobi - Received ID:', { id, id_type: typeof id, id_length: String(id).length, dhobi_id });

    if (!dhobi_id) {
      return res.status(400).json({ success: false, message: 'dhobi_id is required' });
    }

    // Log ObjectId validation
    const id_valid = mongoose.Types.ObjectId.isValid(id);
    const dhobi_id_valid = mongoose.Types.ObjectId.isValid(dhobi_id);
    console.log('ID Validation:', { id_valid, dhobi_id_valid, id, dhobi_id });

    if (!id_valid || !dhobi_id_valid) {
      return res.status(400).json({ success: false, message: 'Invalid ID provided' });
    }

    // Verify dhobi exists and has dhobi role
    const dhobi = await User.findOne({ _id: dhobi_id, role: 'dhobi' });
    if (!dhobi) {
      return res.status(400).json({ success: false, message: 'Invalid dhobi ID or user is not a dhobi' });
    }

    // Try to find order with ObjectId first, then try numeric ID
    let order = await Order.findByIdAndUpdate(
      id,
      { dhobi_id, status: 'confirmed' },
      { new: true }
    );

    // If not found with ObjectId, try with numeric ID (backward compatibility)
    if (!order) {
      console.log('Order not found with ObjectId, trying numeric ID...');
      order = await Order.findOne({ _id: parseInt(id) });
      if (order) {
        order = await Order.findByIdAndUpdate(
          order._id,
          { dhobi_id, status: 'confirmed' },
          { new: true }
        );
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Dhobi assigned successfully', data: { order_id: id, dhobi_id } });
  } catch (error) {
    console.error('Assign dhobi error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign dhobi', error: error.message });
  }
};

// Dhobi: Confirm assigned order
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // Verify the order is assigned to the dhobi and status is 'confirmed'
    const order = await Order.findOne({
      _id: id,
      dhobi_id: req.user.id,
      status: 'confirmed'
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    }

    // Update status to 'picked-up' to indicate dhobi has confirmed
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'picked-up' },
      { new: true }
    );

    res.json({ success: true, message: 'Order confirmed successfully', data: updatedOrder });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm order', error: error.message });
  }
};
