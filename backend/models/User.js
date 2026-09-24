import mongoose from 'mongoose';

const dhobiProfileSchema = new mongoose.Schema({
  service_area: { type: String },
  experience_years: { type: Number },
  rating: { type: Number, default: 0.0, min: 0, max: 5 },
  total_orders: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  availability_status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  services_offered: { type: String },
  rate_per_item: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  // Payment tracking
  wallet_balance: { type: Number, default: 0.0 },
  total_earnings: { type: Number, default: 0.0 },
  payments_this_month: { type: Number, default: 0 }, // Count of payments received this month
  last_payment_date: { type: Date, default: null },
  payment_account: {
    account_holder: { type: String, default: '' },
    account_number: { type: String, default: '' },
    ifsc_code: { type: String, default: '' },
    upi_id: { type: String, default: '' }
  }
}, { _id: false, timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['admin', 'user', 'dhobi'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profile_image: { type: String },
  address: { type: String },
  // Payment related fields for regular users
  wallet_balance: { type: Number, default: 0.0 },
  total_spent: { type: Number, default: 0.0 },
  // Embedded dhobi profile — only populated when role === 'dhobi'
  dhobiProfile: { type: dhobiProfileSchema, default: null }
}, { timestamps: true });

// Index for fast lookup
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
