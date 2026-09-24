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
  notes: { type: String, default: '' }
}, { timestamps: true });

orderSchema.index({ order_number: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ user_id: 1 });
orderSchema.index({ dhobi_id: 1 });

export default mongoose.model('Order', orderSchema);
