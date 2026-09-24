import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment identification
  payment_id: { type: String, required: true, unique: true },
  transaction_id: { type: String },
  
  // Who is involved
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dhobi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  
  // Payment details
  amount: { type: Number, required: true, min: 0 },
  payment_type: {
    type: String,
    enum: ['order_payment', 'dhobi_payment', 'refund'],
    required: true
  },
  payment_method: {
    type: String,
    enum: ['cash', 'online', 'card', 'upi', 'bank_transfer'],
    default: 'cash'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Dhobi payment specific fields
  payment_month: { type: Date, default: null }, // For dhobi monthly payments (store first day of month)
  payment_number_in_month: { type: Number, default: 0 }, // Track 1st, 2nd, or 3rd payment in month
  
  // Description and notes
  description: { type: String, default: '' },
  notes: { type: String, default: '' },
  
  // Processing details
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processed_at: { type: Date, default: null },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Indexes for fast queries
paymentSchema.index({ user_id: 1, createdAt: -1 });
paymentSchema.index({ dhobi_id: 1, createdAt: -1 });
paymentSchema.index({ order_id: 1 });
paymentSchema.index({ payment_status: 1 });
paymentSchema.index({ payment_type: 1 });
paymentSchema.index({ dhobi_id: 1, payment_month: 1 }); // For monthly limit tracking

export default mongoose.model('Payment', paymentSchema);
