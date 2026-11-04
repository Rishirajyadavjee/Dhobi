import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dhobi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  order_number: { type: String, required: true, unique: true },
  service_type: {
    type: String,
    enum: ['wash', 'dry-clean', 'iron', 'wash-iron'],
    required: true
  },
  pickup_address: { type: String, required: true },
  delivery_address: { type: String, required: true },
  pickup_date: { type: Date, required: true },
  delivery_date: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked-up', 'processing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  total_items: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0.0 },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online', 'card'],
    default: null
  },
  notes: { type: String, default: '' },
  pickup_coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  assigned_at: { type: Date, default: null },
  acceptance_deadline: { type: Date, default: null },
  assignment_status: {
    type: String,
    enum: ['unassigned', 'pending_acceptance', 'accepted', 'cancelled_by_dhobi', 'timeout_reassigned'],
    default: 'unassigned'
  },
  accepted_at: { type: Date, default: null },
  cancellation_reason: { type: String, default: '' },
  declined_dhobis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reassignment_history: [
    {
      from_dhobi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      to_dhobi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reason: {
        type: String,
        enum: ['timeout_5min', 'dhobi_cancelled', 'admin_manual', 'auto_dispatch', 'customer_cancelled'],
        default: 'admin_manual'
      },
      distance_km: { type: Number, default: null },
      notes: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

orderSchema.index({ order_number: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ user_id: 1 });
orderSchema.index({ dhobi_id: 1 });
orderSchema.index({ assignment_status: 1 });
orderSchema.index({ acceptance_deadline: 1 });

export default mongoose.model('Order', orderSchema);
