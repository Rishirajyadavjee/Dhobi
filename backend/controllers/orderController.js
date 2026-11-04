import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import {
  calculateDistanceKm,
  resolveCoordinates,
  getOrderPickupCoords,
  getDhobiCoords
} from '../utils/geoUtils.js';

// Pricing configuration (per item)
const SERVICE_PRICING = {
  'wash': 50,        // ₹50 per item
  'dry-clean': 80,   // ₹80 per item
  'iron': 30,        // ₹30 per item
  'wash-iron': 100   // ₹100 per item
};

/**
 * Helper: Find the nearest available Dhobi partner to an order by shortest distance
 * Excludes any dhobi IDs in excludedDhobiIds (e.g. who declined, timed out, or cancelled)
 */
export const findNearestAvailableDhobi = async (order, excludedDhobiIds = []) => {
  const excludedSet = new Set((excludedDhobiIds || []).map(id => String(id)));

  // Try finding available dhobis first (not offline)
  let dhobis = await User.find({
    role: 'dhobi',
    status: 'active',
    'dhobiProfile.availability_status': { $ne: 'offline' }
  }).lean();

  let candidates = dhobis.filter(d => !excludedSet.has(String(d._id)));

  // Fallback to any active dhobi if no non-offline candidate exists
  if (candidates.length === 0) {
    dhobis = await User.find({
      role: 'dhobi',
      status: 'active'
    }).lean();
    candidates = dhobis.filter(d => !excludedSet.has(String(d._id)));
  }

  if (candidates.length === 0) {
    return null;
  }

  // Calculate order pickup coordinates
  const orderCoords = getOrderPickupCoords(order);

  // Compute distance for each candidate
  const candidatesWithDistance = candidates.map(d => {
    const coords = getDhobiCoords(d);
    const distanceKm = calculateDistanceKm(orderCoords.lat, orderCoords.lng, coords.lat, coords.lng);
    return {
      ...d,
      coords,
      distanceKm
    };
  });

  // Sort strictly ascending by distance (shortest first)
  candidatesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return candidatesWithDistance[0];
};

/**
 * Background & On-Demand Processor:
 * Checks orders pending dhobi acceptance where the 5-minute timeout has expired.
 * Automatically shifts them to the next nearest dhobi by shortest distance.
 */
export const processExpiredPendingAssignments = async () => {
  try {
    const now = new Date();
    const expiredOrders = await Order.find({
      dhobi_id: { $ne: null },
      assignment_status: 'pending_acceptance',
      acceptance_deadline: { $lte: now },
      status: { $nin: ['delivered', 'cancelled'] }
    }).populate('dhobi_id', 'name email');

    for (const order of expiredOrders) {
      const prevDhobi = order.dhobi_id;
      const prevDhobiId = prevDhobi?._id || prevDhobi;
      const prevDhobiName = prevDhobi?.name || 'Assigned Dhobi';

      // Record current dhobi in declined list
      const declined = (order.declined_dhobis || []).map(d => String(d));
      if (!declined.includes(String(prevDhobiId))) {
        declined.push(String(prevDhobiId));
      }
      order.declined_dhobis = declined;

      // Find next nearest available dhobi
      const nextDhobi = await findNearestAvailableDhobi(order, declined);

      if (nextDhobi) {
        const distanceKm = nextDhobi.distanceKm;
        const newDeadline = new Date(Date.now() + 5 * 60 * 1000); // New 5-minute window

        order.reassignment_history.push({
          from_dhobi_id: prevDhobiId,
          to_dhobi_id: nextDhobi._id,
          reason: 'timeout_5min',
          distance_km: distanceKm,
          notes: `5-minute acceptance timer expired for ${prevDhobiName}. Automatically shifted to next nearest partner (${distanceKm} km away).`,
          timestamp: new Date()
        });

        order.dhobi_id = nextDhobi._id;
        order.assigned_at = new Date();
        order.acceptance_deadline = newDeadline;
        order.assignment_status = 'pending_acceptance';
        order.status = 'confirmed';

        await order.save();
        console.log(`⏱️ [Auto-Shift 5-min Timeout] Order #${order.order_number} shifted from ${prevDhobiName} to ${nextDhobi.name} (${distanceKm} km).`);
      } else {
        // No other dhobi available
        order.assignment_status = 'timeout_reassigned';
        order.reassignment_history.push({
          from_dhobi_id: prevDhobiId,
          to_dhobi_id: null,
          reason: 'timeout_5min',
          distance_km: null,
          notes: `5-minute timeout expired for ${prevDhobiName}. No other active dhobi partners available in service zone.`,
          timestamp: new Date()
        });
        await order.save();
        console.log(`⚠️ [Timeout Alert] Order #${order.order_number} timed out; no alternative dhobi found.`);
      }
    }
  } catch (err) {
    console.error('Error processing expired assignments:', err.message);
  }
};

/**
 * Get all orders (Admin) with full reassignment history & distance info
 */
export const getOrders = async (req, res) => {
  try {
    // Process any expired assignments on demand first
    await processExpiredPendingAssignments();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(150)
      .populate('user_id', 'name email phone address')
      .populate('dhobi_id', 'name email phone dhobiProfile')
      .populate('reassignment_history.from_dhobi_id', 'name email')
      .populate('reassignment_history.to_dhobi_id', 'name email')
      .lean();

    const formatted = orders.map(o => {
      const pickupCoords = getOrderPickupCoords(o);
      let dhobiDistanceKm = null;
      if (o.dhobi_id) {
        const dhobiCoords = getDhobiCoords(o.dhobi_id);
        dhobiDistanceKm = calculateDistanceKm(pickupCoords.lat, pickupCoords.lng, dhobiCoords.lat, dhobiCoords.lng);
      }

      // Check timeout countdown
      let remainingSeconds = 0;
      if (o.assignment_status === 'pending_acceptance' && o.acceptance_deadline) {
        remainingSeconds = Math.max(0, Math.floor((new Date(o.acceptance_deadline) - new Date()) / 1000));
      }

      return {
        ...o,
        _id: String(o._id),
        id: String(o._id),
        customer_name: o.user_id?.name || null,
        customer_email: o.user_id?.email || null,
        customer_phone: o.user_id?.phone || null,
        dhobi_name: o.dhobi_id?.name || null,
        dhobi_phone: o.dhobi_id?.phone || null,
        dhobi_distance_km: dhobiDistanceKm,
        created_at: o.createdAt,
        reassignment_count: (o.reassignment_history || []).length,
        remaining_acceptance_seconds: remainingSeconds,
        is_acceptance_expired: o.assignment_status === 'pending_acceptance' && remainingSeconds === 0
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req, res) => {
  try {
    await processExpiredPendingAssignments();

    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('dhobi_id', 'name phone')
      .lean();

    res.json({
      success: true,
      data: orders.map(o => ({
        ...o,
        id: o._id,
        dhobi_name: o.dhobi_id?.name || null,
        created_at: o.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your orders', error: error.message });
  }
};

/**
 * Get dhobi's assigned orders (with 5-min timer and cancellation capabilities)
 */
export const getDhobiOrders = async (req, res) => {
  try {
    await processExpiredPendingAssignments();

    const orders = await Order.find({ dhobi_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user_id', 'name phone address')
      .populate('reassignment_history.from_dhobi_id', 'name')
      .lean();

    const formatted = orders.map(o => {
      const pickupCoords = getOrderPickupCoords(o);
      const dhobiCoords = resolveCoordinates(req.user.address || req.user.dhobiProfile?.service_area || '');
      const distanceKm = calculateDistanceKm(pickupCoords.lat, pickupCoords.lng, dhobiCoords.lat, dhobiCoords.lng);

      let remainingSeconds = 0;
      if (o.assignment_status === 'pending_acceptance' && o.acceptance_deadline) {
        remainingSeconds = Math.max(0, Math.floor((new Date(o.acceptance_deadline) - new Date()) / 1000));
      }

      return {
        ...o,
        id: o._id,
        _id: String(o._id),
        customer_name: o.user_id?.name || null,
        customer_phone: o.user_id?.phone || null,
        customer_address: o.user_id?.address || o.pickup_address,
        distance_km: distanceKm,
        created_at: o.createdAt,
        remaining_acceptance_seconds: remainingSeconds,
        is_acceptance_expired: o.assignment_status === 'pending_acceptance' && remainingSeconds === 0
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get dhobi orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned orders', error: error.message });
  }
};

/**
 * Get active Dhobis sorted by shortest distance to a specific order
 */
export const getDhobisWithDistance = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderCoords = getOrderPickupCoords(order);
    const dhobis = await User.find({ role: 'dhobi', status: 'active' }).lean();

    const declinedSet = new Set((order.declined_dhobis || []).map(d => String(d)));

    const result = dhobis.map(d => {
      const coords = getDhobiCoords(d);
      const distanceKm = calculateDistanceKm(orderCoords.lat, orderCoords.lng, coords.lat, coords.lng);
      return {
        id: String(d._id),
        _id: String(d._id),
        name: d.name,
        email: d.email,
        phone: d.phone,
        service_area: d.dhobiProfile?.service_area || 'Standard Zone',
        rating: d.dhobiProfile?.rating || 4.5,
        availability_status: d.dhobiProfile?.availability_status || 'available',
        distance_km: distanceKm,
        is_current: String(order.dhobi_id) === String(d._id),
        is_declined: declinedSet.has(String(d._id))
      };
    });

    // Sort by shortest distance
    result.sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      data: {
        order_number: order.order_number,
        pickup_address: order.pickup_address,
        pickup_coordinates: orderCoords,
        dhobis: result
      }
    });
  } catch (error) {
    console.error('Get dhobis with distance error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate dhobi distances', error: error.message });
  }
};

/**
 * Real-Time Admin Analytics & KPI Metrics
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    await processExpiredPendingAssignments();

    const [
      totalUsers,
      totalDhobis,
      allOrders,
      dhobiUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'dhobi' }),
      Order.find()
        .populate('user_id', 'name')
        .populate('dhobi_id', 'name')
        .populate('reassignment_history.from_dhobi_id', 'name')
        .populate('reassignment_history.to_dhobi_id', 'name')
        .lean(),
      User.find({ role: 'dhobi' }).lean()
    ]);

    const totalOrders = allOrders.length;
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingPaymentRevenue = 0;
    let activeOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const statusCounts = {};
    const serviceCounts = { wash: 0, 'dry-clean': 0, iron: 0, 'wash-iron': 0 };

    let totalReassignments = 0;
    let timeoutShiftsCount = 0;
    let dhobiCancellationsCount = 0;
    let adminManualCount = 0;
    let totalReassignmentDistance = 0;
    let distanceEntriesCount = 0;

    let totalAcceptanceTimeMs = 0;
    let acceptedOrdersCount = 0;

    const liveReassignmentLog = [];

    allOrders.forEach(o => {
      const amt = Number(o.total_amount || 0);
      totalRevenue += amt;
      if (o.payment_status === 'paid') paidRevenue += amt;
      else pendingPaymentRevenue += amt;

      const st = o.status || 'pending';
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      if (['pending', 'confirmed', 'picked-up', 'processing', 'ready'].includes(st)) {
        activeOrders++;
      } else if (st === 'delivered') {
        deliveredOrders++;
      } else if (st === 'cancelled') {
        cancelledOrders++;
      }

      if (o.service_type && serviceCounts[o.service_type] !== undefined) {
        serviceCounts[o.service_type]++;
      }

      // Check acceptance duration
      if (o.assigned_at && o.accepted_at) {
        const diff = new Date(o.accepted_at) - new Date(o.assigned_at);
        if (diff > 0 && diff < 86400000) { // within 24h
          totalAcceptanceTimeMs += diff;
          acceptedOrdersCount++;
        }
      }

      // Aggregate reassignments
      const history = o.reassignment_history || [];
      totalReassignments += history.length;

      history.forEach(h => {
        if (h.reason === 'timeout_5min') timeoutShiftsCount++;
        else if (h.reason === 'dhobi_cancelled') dhobiCancellationsCount++;
        else adminManualCount++;

        if (h.distance_km != null) {
          totalReassignmentDistance += h.distance_km;
          distanceEntriesCount++;
        }

        liveReassignmentLog.push({
          order_id: String(o._id),
          order_number: o.order_number,
          customer_name: o.user_id?.name || 'Customer',
          from_dhobi: h.from_dhobi_id?.name || 'Previous Partner',
          to_dhobi: h.to_dhobi_id?.name || (h.to_dhobi_id ? 'Partner' : 'Unassigned Pool'),
          reason: h.reason,
          distance_km: h.distance_km,
          notes: h.notes,
          timestamp: h.timestamp || o.updatedAt
        });
      });
    });

    // Sort live log descending by timestamp
    liveReassignmentLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const avgAcceptanceTimeMinutes = acceptedOrdersCount > 0
      ? Math.round((totalAcceptanceTimeMs / acceptedOrdersCount / 60000) * 10) / 10
      : 2.1;

    const avgReassignmentDistanceKm = distanceEntriesCount > 0
      ? Math.round((totalReassignmentDistance / distanceEntriesCount) * 10) / 10
      : 2.8;

    const timeoutRatePct = totalOrders > 0
      ? Math.round((timeoutShiftsCount / Math.max(1, totalOrders)) * 100)
      : 0;

    // Dhobi Performance Matrix
    const dhobiPerformance = dhobiUsers.map(d => {
      const assigned = allOrders.filter(o => String(o.dhobi_id?._id || o.dhobi_id) === String(d._id));
      const delivered = assigned.filter(o => o.status === 'delivered').length;
      const timeouts = allOrders.filter(o =>
        (o.reassignment_history || []).some(h => String(h.from_dhobi_id?._id || h.from_dhobi_id) === String(d._id) && h.reason === 'timeout_5min')
      ).length;
      const cancels = allOrders.filter(o =>
        (o.reassignment_history || []).some(h => String(h.from_dhobi_id?._id || h.from_dhobi_id) === String(d._id) && h.reason === 'dhobi_cancelled')
      ).length;

      const totalHandled = assigned.length + timeouts + cancels;
      const reliability = totalHandled > 0
        ? Math.round(((totalHandled - timeouts - cancels) / totalHandled) * 100)
        : 100;

      return {
        dhobi_id: String(d._id),
        name: d.name,
        email: d.email,
        phone: d.phone,
        service_area: d.dhobiProfile?.service_area || 'Zone 1',
        rating: d.dhobiProfile?.rating || 4.8,
        availability: d.dhobiProfile?.availability_status || 'available',
        current_assigned: assigned.length,
        delivered_count: delivered,
        timeout_count: timeouts,
        cancelled_count: cancels,
        reliability_pct: reliability
      };
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalDhobis,
          totalOrders,
          activeOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          paidRevenue,
          pendingPaymentRevenue,
          totalReassignments,
          timeoutShiftsCount,
          dhobiCancellationsCount,
          adminManualCount,
          avgAcceptanceTimeMinutes,
          avgReassignmentDistanceKm,
          timeoutRatePct
        },
        statusCounts,
        serviceCounts,
        dhobiPerformance,
        recentReassignments: liveReassignmentLog.slice(0, 30)
      }
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate analytics', error: error.message });
  }
};

/**
 * Filterable Admin Reports Engine with Aggregate Metrics
 */
export const getAdminReports = async (req, res) => {
  try {
    await processExpiredPendingAssignments();

    const {
      date_preset = 'all',
      date_from,
      date_to,
      status = 'all',
      service_type = 'all',
      dhobi_id = 'all',
      payment_status = 'all',
      reassigned_only = 'false'
    } = req.query;

    const filter = {};

    // Date filtering
    const now = new Date();
    if (date_preset === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      filter.createdAt = { $gte: startOfDay };
    } else if (date_preset === 'last7') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: sevenDaysAgo };
    } else if (date_preset === 'last30') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: thirtyDaysAgo };
    } else if (date_preset === 'custom' && (date_from || date_to)) {
      filter.createdAt = {};
      if (date_from) filter.createdAt.$gte = new Date(date_from);
      if (date_to) filter.createdAt.$lte = new Date(new Date(date_to).setHours(23, 59, 59, 999));
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (service_type && service_type !== 'all') {
      filter.service_type = service_type;
    }

    if (dhobi_id && dhobi_id !== 'all') {
      filter.dhobi_id = dhobi_id;
    }

    if (payment_status && payment_status !== 'all') {
      filter.payment_status = payment_status;
    }

    let orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user_id', 'name email phone address')
      .populate('dhobi_id', 'name email phone dhobiProfile')
      .populate('reassignment_history.from_dhobi_id', 'name')
      .populate('reassignment_history.to_dhobi_id', 'name')
      .lean();

    if (reassigned_only === 'true') {
      orders = orders.filter(o => (o.reassignment_history || []).length > 0);
    }

    let totalAmount = 0;
    let totalItems = 0;
    let totalReassignments = 0;
    let totalTimeouts = 0;
    let totalDhobiCancels = 0;

    const formattedOrders = orders.map(o => {
      totalAmount += Number(o.total_amount || 0);
      totalItems += Number(o.total_items || 0);
      const reassignments = o.reassignment_history || [];
      totalReassignments += reassignments.length;

      reassignments.forEach(h => {
        if (h.reason === 'timeout_5min') totalTimeouts++;
        if (h.reason === 'dhobi_cancelled') totalDhobiCancels++;
      });

      return {
        _id: String(o._id),
        order_number: o.order_number,
        created_at: o.createdAt,
        customer_name: o.user_id?.name || 'Customer',
        customer_phone: o.user_id?.phone || '',
        customer_email: o.user_id?.email || '',
        pickup_address: o.pickup_address,
        delivery_address: o.delivery_address,
        service_type: o.service_type,
        total_items: o.total_items || 0,
        total_amount: o.total_amount || 0,
        status: o.status,
        payment_status: o.payment_status,
        payment_method: o.payment_method || 'Unspecified',
        dhobi_name: o.dhobi_id?.name || 'Unassigned',
        dhobi_phone: o.dhobi_id?.phone || '',
        assignment_status: o.assignment_status || 'unassigned',
        reassignment_count: reassignments.length,
        reassignment_reasons: reassignments.map(r => r.reason).join(', ') || 'None',
        latest_reassignment_notes: reassignments[reassignments.length - 1]?.notes || ''
      };
    });

    res.json({
      success: true,
      summary: {
        total_matched_orders: formattedOrders.length,
        total_amount: totalAmount,
        total_items: totalItems,
        total_reassignments: totalReassignments,
        total_timeouts: totalTimeouts,
        total_dhobi_cancels: totalDhobiCancels
      },
      data: formattedOrders
    });
  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to compile report', error: error.message });
  }
};

/**
 * Create order
 */
export const createOrder = async (req, res) => {
  try {
    const { service_type, pickup_address, delivery_address, pickup_date, total_items, notes } = req.body;

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
    const pickup_coordinates = resolveCoordinates(pickup_address);

    const order = await Order.create({
      user_id: req.user.id,
      order_number,
      service_type,
      pickup_address,
      delivery_address,
      pickup_coordinates,
      pickup_date,
      total_items,
      total_amount: calculatedAmount,
      notes: notes || '',
      status: 'pending',
      assignment_status: 'unassigned'
    });

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

/**
 * Admin: Assign Dhobi to Order (manual or auto-nearest)
 * Starts the 5-minute acceptance timer
 */
export const assignDhobi = async (req, res) => {
  try {
    const { id } = req.params;
    let { dhobi_id, auto_nearest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let targetDhobi = null;
    let distanceKm = null;

    if (auto_nearest) {
      // Find nearest dhobi automatically by shortest distance
      const nearest = await findNearestAvailableDhobi(order, order.declined_dhobis || []);
      if (!nearest) {
        return res.status(400).json({ success: false, message: 'No available Dhobi partner found in range.' });
      }
      targetDhobi = nearest;
      distanceKm = nearest.distanceKm;
      dhobi_id = nearest._id;
    } else {
      if (!dhobi_id || !mongoose.Types.ObjectId.isValid(dhobi_id)) {
        return res.status(400).json({ success: false, message: 'Valid dhobi_id is required' });
      }

      targetDhobi = await User.findOne({ _id: dhobi_id, role: 'dhobi' }).lean();
      if (!targetDhobi) {
        return res.status(400).json({ success: false, message: 'Selected user is not a valid Dhobi partner.' });
      }

      const orderCoords = getOrderPickupCoords(order);
      const dhobiCoords = getDhobiCoords(targetDhobi);
      distanceKm = calculateDistanceKm(orderCoords.lat, orderCoords.lng, dhobiCoords.lat, dhobiCoords.lng);
    }

    const prevDhobiId = order.dhobi_id;
    const now = new Date();
    const deadline = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes timer

    order.dhobi_id = targetDhobi._id;
    order.assigned_at = now;
    order.acceptance_deadline = deadline;
    order.assignment_status = 'pending_acceptance';
    order.status = 'confirmed';

    order.reassignment_history.push({
      from_dhobi_id: prevDhobiId,
      to_dhobi_id: targetDhobi._id,
      reason: auto_nearest ? 'auto_dispatch' : 'admin_manual',
      distance_km: distanceKm,
      notes: `Order assigned by Admin to ${targetDhobi.name} (${distanceKm} km away). 5-minute acceptance timer initiated.`,
      timestamp: now
    });

    await order.save();

    res.json({
      success: true,
      message: `Order dispatched to ${targetDhobi.name} (${distanceKm} km away). 5-minute timer started.`,
      data: {
        order_id: id,
        dhobi_id: targetDhobi._id,
        dhobi_name: targetDhobi.name,
        distance_km: distanceKm,
        acceptance_deadline: deadline
      }
    });
  } catch (error) {
    console.error('Assign dhobi error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign dhobi', error: error.message });
  }
};

/**
 * Dhobi: Accept order (stops 5-min timer)
 */
export const dhobiAcceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: id, dhobi_id: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    }

    // Check if 5-minute deadline expired already
    if (order.acceptance_deadline && new Date() > new Date(order.acceptance_deadline)) {
      await processExpiredPendingAssignments();
      return res.status(400).json({
        success: false,
        message: 'The 5-minute acceptance window expired. Order has been automatically shifted to another partner.'
      });
    }

    order.assignment_status = 'accepted';
    order.accepted_at = new Date();
    order.status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: 'Order accepted successfully! You are confirmed for garment pickup.',
      data: order
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept order', error: error.message });
  }
};

/**
 * Dhobi: Cancel order
 * Immediately shifts the order to the next closest available dhobi by shortest distance
 */
export const dhobiCancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Dhobi unavailable / cancelled' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: id, dhobi_id: req.user.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not currently assigned to you' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}` });
    }

    const currentDhobiId = req.user.id;
    const currentDhobiUser = await User.findById(currentDhobiId).lean();
    const currentDhobiName = currentDhobiUser?.name || 'Dhobi';

    // Add current dhobi to declined list
    const declined = (order.declined_dhobis || []).map(d => String(d));
    if (!declined.includes(String(currentDhobiId))) {
      declined.push(String(currentDhobiId));
    }
    order.declined_dhobis = declined;
    order.cancellation_reason = reason;

    // Shift to next nearest available dhobi by shortest distance
    const nextDhobi = await findNearestAvailableDhobi(order, declined);
    const now = new Date();

    if (nextDhobi) {
      const distanceKm = nextDhobi.distanceKm;
      const newDeadline = new Date(now.getTime() + 5 * 60 * 1000);

      order.reassignment_history.push({
        from_dhobi_id: currentDhobiId,
        to_dhobi_id: nextDhobi._id,
        reason: 'dhobi_cancelled',
        distance_km: distanceKm,
        notes: `Cancelled by ${currentDhobiName}: "${reason}". Transferred to nearest partner ${nextDhobi.name} (${distanceKm} km).`,
        timestamp: now
      });

      order.dhobi_id = nextDhobi._id;
      order.assigned_at = now;
      order.acceptance_deadline = newDeadline;
      order.assignment_status = 'pending_acceptance';
      order.status = 'confirmed';

      await order.save();

      res.json({
        success: true,
        message: `Order successfully cancelled and automatically reassigned to closest partner: ${nextDhobi.name} (${distanceKm} km away).`,
        shifted_to: nextDhobi.name,
        distance_km: distanceKm
      });
    } else {
      // No other dhobi available
      order.reassignment_history.push({
        from_dhobi_id: currentDhobiId,
        to_dhobi_id: null,
        reason: 'dhobi_cancelled',
        distance_km: null,
        notes: `Cancelled by ${currentDhobiName}: "${reason}". No additional nearby dhobi available; returned to unassigned pool.`,
        timestamp: now
      });

      order.dhobi_id = null;
      order.assignment_status = 'unassigned';
      order.status = 'pending';
      order.acceptance_deadline = null;

      await order.save();

      res.json({
        success: true,
        message: 'Order cancelled. No other nearby partners currently available; order returned to unassigned dispatch queue.'
      });
    }
  } catch (error) {
    console.error('Dhobi cancel order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel and shift order', error: error.message });
  }
};

/**
 * Dhobi: Confirm assigned order (legacy alias for accept & mark picked-up)
 */
export const confirmOrder = async (req, res) => {
  return dhobiAcceptOrder(req, res);
};

/**
 * Update order status (Dhobi workflow progression)
 */
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

    const order = await Order.findOneAndUpdate(
      { _id: id, dhobi_id: req.user.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
    }

    // Auto mark accepted if moving beyond pending
    if (order.assignment_status === 'pending_acceptance') {
      order.assignment_status = 'accepted';
      order.accepted_at = new Date();
      await order.save();
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

/**
 * Get basic order statistics (User)
 */
export const getOrderStats = async (req, res) => {
  try {
    const activeStatuses = ['pending', 'confirmed', 'picked-up', 'processing', 'ready'];

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

/**
 * Admin: Update Order details
 */
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

    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
  }
};

/**
 * Admin: Delete Order
 */
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

/**
 * Get basic admin stats (legacy compatibility)
 */
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
