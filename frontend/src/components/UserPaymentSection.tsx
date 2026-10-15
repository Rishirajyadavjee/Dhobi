import { useState, useEffect } from 'react';
import { CreditCard, Wallet, TrendingUp, AlertCircle, Plus, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface PaymentRecord {
  _id: string;
  payment_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  description: string;
  order_id?: {
    order_number: string;
    service_type: string;
  };
  createdAt: string;
}

interface WalletSummary {
  wallet_balance: number;
  total_spent: number;
  total_payments_made: number;
  payment_count: number;
}

export default function UserPaymentSection() {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    amount: '',
    paymentMethod: 'cash',
    description: ''
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchPaymentHistory();
    fetchOrders();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/user/wallet-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWallet(response.data.data);
    } catch (err: any) {
      console.error('Error fetching wallet data:', err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/user/payment-history?limit=10`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPaymentHistory(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Filter unpaid orders
      const unpaidOrders = response.data.data?.filter(
        (order: any) => order.payment_status !== 'paid'
      ) || [];
      setOrders(unpaidOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!paymentForm.orderId || !paymentForm.amount) {
      setError('Please select an order and enter the payment amount.');
      return;
    }

    setProcessingPayment(true);

    try {
      await axios.post(
        `${API_URL}/payments/user/make-payment`,
        {
          orderId: paymentForm.orderId,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setSuccess('Payment settled successfully! Your order payment status is now updated.');
      setShowPaymentForm(false);
      setPaymentForm({
        orderId: '',
        amount: '',
        paymentMethod: 'cash',
        description: ''
      });

      // Refresh data
      fetchWalletData();
      fetchPaymentHistory();
      fetchOrders();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to process payment. Please verify details.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const selectedOrder = orders.find(o => o._id === paymentForm.orderId);

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5 text-stone-600" />
            Atelier Billing & Wallet
          </div>
          <h2 className="font-serif text-2xl text-slate-900 tracking-tight">Payment Ledger & Receipts</h2>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Wallet Balance</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl text-slate-900 font-normal">
            ₹{wallet?.wallet_balance !== undefined ? wallet.wallet_balance.toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-stone-400 mt-1">Prepaid credit available</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl text-slate-900 font-normal">
            ₹{wallet?.total_spent !== undefined ? wallet.total_spent.toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-stone-400 mt-1">Settled laundry care charges</p>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Settled Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl text-slate-900 font-normal">
            {wallet?.payment_count || 0}
          </p>
          <p className="text-xs text-stone-400 mt-1">Total receipts generated</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Make Payment Section */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif text-xl text-slate-900">Atelier Settlement & Invoices</h3>
            <p className="text-xs text-stone-500 mt-0.5">Pay outstanding laundry care invoices and generate receipts</p>
          </div>
          <button
            onClick={() => { setShowPaymentForm(!showPaymentForm); setError(''); setSuccess(''); }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              showPaymentForm
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-soft hover:-translate-y-0.5'
            }`}
          >
            {showPaymentForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-300" />}
            <span>{showPaymentForm ? 'Close Form' : '+ Settle Order Invoice'}</span>
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handlePaymentSubmit} className="bg-[#FAF9F5] p-6 rounded-2xl border border-stone-200/90 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Select Hamper Order to Settle
              </label>
              {orders.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-3 bg-white rounded-xl border border-stone-200">
                  You have no pending unpaid hamper orders. All laundry orders are settled!
                </p>
              ) : (
                <select
                  value={paymentForm.orderId}
                  onChange={(e) => {
                    const chosen = orders.find(o => o._id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      orderId: e.target.value,
                      amount: chosen ? String(chosen.total_amount) : ''
                    });
                  }}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Choose an unpaid order</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      #{order.order_number} - ₹{order.total_amount} ({order.service_type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedOrder && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
                <span>Order Total Amount: <strong>₹{selectedOrder.total_amount}</strong></span>
                <span>Service: <strong className="capitalize">{selectedOrder.service_type}</strong></span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Settlement Method
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="cash">Doorstep Handover (Cash)</option>
                  <option value="upi">Instant UPI (GPay / PhonePe / QR)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="online">Net Banking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Reference Notes (Optional)
              </label>
              <textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                placeholder="UPI transaction reference or notes"
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={processingPayment || orders.length === 0}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide disabled:opacity-50 transition"
              >
                {processingPayment ? 'Processing...' : 'Confirm Payment Settlement'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-soft">
        <div className="px-6 py-4 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-serif text-base text-slate-900">Receipt Ledger & Transaction Records</h3>
          <span className="text-xs font-medium text-stone-500">{paymentHistory.length} Recorded</span>
        </div>

        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/40 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Receipt ID</th>
                  <th className="py-3 px-6">Hamper Order</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Method</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} className="hover:bg-stone-50/50 transition">
                    <td className="py-3.5 px-6 font-mono text-xs text-stone-600">
                      {payment.payment_id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-stone-800">
                      {payment.order_id?.order_number ? `#${payment.order_id.order_number}` : 'Standard Care'}
                    </td>
                    <td className="py-3.5 px-6 font-serif font-semibold text-slate-900">
                      ₹{payment.amount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-stone-600 capitalize text-xs">
                      {payment.payment_method}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.payment_status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-stone-500">
                      {new Date(payment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-400 text-sm">
            <CreditCard className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            No transaction receipts on record yet.
          </div>
        )}
      </div>
    </div>
  );
}
