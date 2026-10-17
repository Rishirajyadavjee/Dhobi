import { useState, useEffect } from 'react';
import {
  CreditCard,
  AlertCircle,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Search,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface PaymentStats {
  user_payments: {
    total_revenue: number;
    total_transactions: number;
  };
  dhobi_payments: {
    total_paid: number;
    total_transactions: number;
  };
  monthly_dhobi_payments: Array<{
    _id: string;
    amount: number;
    count: number;
  }>;
  pending_payments: {
    total: number;
    count: number;
  };
  month: {
    start: string;
    end: string;
  };
}

interface Payment {
  _id: string;
  payment_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_status: string;
  description: string;
  user_id?: { name: string; email: string };
  dhobi_id?: { name: string; email: string };
  order_id?: { order_number: string };
  createdAt: string;
}

interface Dhobi {
  _id: string;
  name: string;
  email: string;
  dhobiProfile?: {
    payments_this_month: number;
  };
}

export default function AdminPaymentSection() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dhobis, setDhobis] = useState<Dhobi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    dhobiId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    description: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const fetchPaymentData = async () => {
    try {
      setRefreshing(true);
      setError('');
      const token = localStorage.getItem('token');

      const [statsRes, paymentsRes, dhobisRes] = await Promise.all([
        axios.get(`${API_URL}/payments/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/payments/admin/all-payments?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/users/dhobis`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data.data);
      setPayments(paymentsRes.data.data || []);
      setDhobis(dhobisRes.data.data || []);
    } catch (err: any) {
      console.error('Error fetching admin payment data:', err);
      setError('Failed to synchronize financial settlements and records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paymentForm.dhobiId || !paymentForm.amount) {
      setError('Please choose a Dhobi partner and enter the settlement amount.');
      return;
    }

    setProcessingPayment(true);

    try {
      const selectedDhobi = dhobis.find((d) => d._id === paymentForm.dhobiId);

      // Check if dhobi has reached monthly limit
      if (selectedDhobi && (selectedDhobi.dhobiProfile?.payments_this_month ?? 0) >= 3) {
        setError(`Cannot process payment: ${selectedDhobi.name} has already reached the maximum 3 monthly disbursements.`);
        setProcessingPayment(false);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/payments/admin/dhobi-payment`,
        {
          dhobiId: paymentForm.dhobiId,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowPaymentModal(false);
      setPaymentForm({
        dhobiId: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        description: ''
      });
      showNotification('Partner disbursement voucher processed successfully!');
      fetchPaymentData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Synchronizing Financial Balances...</p>
      </div>
    );
  }

  const selectedDhobi = dhobis.find((d) => d._id === paymentForm.dhobiId);
  const canPayDhobi = !selectedDhobi || (selectedDhobi.dhobiProfile?.payments_this_month || 0) < 3;

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter && p.payment_type !== paymentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = p.payment_id?.toLowerCase().includes(q);
      const matchUser = p.user_id?.name?.toLowerCase().includes(q);
      const matchDhobi = p.dhobi_id?.name?.toLowerCase().includes(q);
      const matchOrder = p.order_id?.order_number?.toLowerCase().includes(q);
      return matchId || matchUser || matchDhobi || matchOrder;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Disburse Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-stone-600" />
            Financial Governance & Partner Disbursements
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Platform Ledger & Cash Settlement
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Reconcile client revenue, review pending payouts, and issue bank disbursals to Dhobi partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPaymentData()}
            disabled={refreshing}
            className="p-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-600 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setShowPaymentModal(true);
              setError('');
            }}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Disburse Partner Payout</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-medium text-xs sm:text-sm">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-medium text-xs sm:text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* User Revenue */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Gross Client Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">
              ₹{(stats.user_payments.total_revenue || 0).toFixed(2)}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Collected from {stats.user_payments.total_transactions || 0} order receipts
            </p>
          </div>

          {/* Dhobi Disbursements */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Dhobi Disbursements</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">
              ₹{(stats.dhobi_payments.total_paid || 0).toFixed(2)}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Settled across {stats.dhobi_payments.total_transactions || 0} payout vouchers
            </p>
          </div>

          {/* Pending Settlements */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Pending Settlements</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-slate-900">
              ₹{(stats.pending_payments.total || 0).toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {stats.pending_payments.count || 0} unfinalized transactions
            </p>
          </div>

        </div>
      )}

      {/* Ledger Filter & Search Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by payment ID, user, dhobi, or order #..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-stone-50"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="inline-flex p-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold gap-1">
            {[
              { id: '', label: 'All Transactions' },
              { id: 'order_payment', label: 'Client Inflow' },
              { id: 'dhobi_payment', label: 'Partner Payouts' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPaymentFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  paymentFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6 font-bold">Transaction Reference</th>
                <th className="py-4 px-6 font-bold">Type</th>
                <th className="py-4 px-6 font-bold">Party / Account</th>
                <th className="py-4 px-6 font-bold">Amount</th>
                <th className="py-4 px-6 font-bold">Method</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold">Date</th>
                <th className="py-4 px-6 font-bold text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isClient = payment.payment_type === 'order_payment';
                  const partyName = isClient
                    ? payment.user_id?.name || 'Customer'
                    : payment.dhobi_id?.name || 'Dhobi Partner';

                  return (
                    <tr key={payment._id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {payment.payment_id}
                        {payment.order_id?.order_number && (
                          <span className="block text-[10px] text-stone-400 font-mono font-normal mt-0.5">
                            Order #{payment.order_id.order_number}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isClient
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {isClient ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-blue-600" />
                              <span>Client Pay</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-amber-600" />
                              <span>Dhobi Payout</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {partyName}
                      </td>
                      <td className={`py-4 px-6 font-serif font-bold text-sm ${
                        isClient ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {isClient ? '+' : '-'}₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 capitalize text-stone-600">
                        {payment.payment_method?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          payment.payment_status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            payment.payment_status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <span className="capitalize">{payment.payment_status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-400 text-[11px]">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedReceipt(payment)}
                          className="text-xs font-semibold text-slate-900 hover:text-stone-600 inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: DISBURSE PARTNER PAYOUT */}
      {/* ---------------------------------------------------- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Administrative Disbursal
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900">Process Partner Settlement</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              {/* Dhobi Partner Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Select Dhobi Partner *
                </label>
                <select
                  value={paymentForm.dhobiId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, dhobiId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white font-medium"
                >
                  <option value="">Select an active artisan...</option>
                  {dhobis.map((dhobi) => {
                    const paymentCount = dhobi.dhobiProfile?.payments_this_month || 0;
                    const canPay = paymentCount < 3;
                    return (
                      <option key={dhobi._id} value={dhobi._id} disabled={!canPay}>
                        {dhobi.name} ({paymentCount}/3 payouts this month) {!canPay ? '— LIMIT REACHED' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Limit Status Feedback Box */}
              {selectedDhobi && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  canPayDhobi
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {canPayDhobi ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>{selectedDhobi.name}</strong> can receive <strong>{3 - (selectedDhobi.dhobiProfile?.payments_this_month || 0)}</strong> more disbursement(s) this billing month.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        <strong>{selectedDhobi.name}</strong> has reached the monthly 3-disbursement threshold.
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Settlement Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Settlement Amount (₹) *
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="e.g. 2400"
                  step="0.01"
                  min="1"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-serif font-bold"
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Disbursal Mode
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white font-medium"
                >
                  <option value="bank_transfer">Direct Bank NEFT / RTGS</option>
                  <option value="upi">Instant UPI Transfer</option>
                  <option value="cash">Petty Cash Handover</option>
                  <option value="cheque">Commercial Cheque</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Internal Settlement Memo
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="e.g. Weekly wash batch clearance for Zone 2"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment || !canPayDhobi}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wide bg-slate-900 hover:bg-slate-800 text-white shadow-soft transition disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>{processingPayment ? 'Authorizing Payout...' : 'Authorize Disbursement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: TRANSACTION VOUCHER AUDIT */}
      {/* ---------------------------------------------------- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-sm overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Platform Ledger</span>
                <h4 className="font-serif text-xl font-bold text-slate-900">Transaction Audit</h4>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center py-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Settled Amount</span>
                <p className="font-serif text-3xl font-bold text-slate-900 mt-1">
                  ₹{selectedReceipt.amount.toFixed(2)}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {selectedReceipt.payment_status}
                </span>
              </div>

              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.payment_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Account Party:</span>
                  <span className="font-bold text-slate-900">
                    {selectedReceipt.payment_type === 'order_payment'
                      ? selectedReceipt.user_id?.name || 'Customer'
                      : selectedReceipt.dhobi_id?.name || 'Dhobi Partner'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Method:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {selectedReceipt.payment_method?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Timestamp:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(selectedReceipt.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedReceipt.description && (
                  <div className="pt-1">
                    <span className="text-stone-400 block mb-1">Administrative Note:</span>
                    <p className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 italic">
                      "{selectedReceipt.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 text-right">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
