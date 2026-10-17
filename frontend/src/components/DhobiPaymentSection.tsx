import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  Banknote
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DhobiPaymentSummary {
  wallet_balance: number;
  total_earnings: number;
  payments_this_month: number;
  remaining_payments_this_month: number;
  monthly_limit: number;
  last_payment_date?: string;
  lifetime_payments_received: number;
  lifetime_earnings: number;
}

interface PaymentRecord {
  _id: string;
  payment_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_number_in_month?: number;
  description?: string;
  order_id?: {
    order_number: string;
    service_type: string;
  };
  createdAt: string;
}

export default function DhobiPaymentSection() {
  const [summary, setSummary] = useState<DhobiPaymentSummary | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const [summaryRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/payments/dhobi/payment-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/payments/dhobi/payment-history?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data.data);
      setPaymentHistory(historyRes.data.data || []);
    } catch (err: any) {
      console.error('Error fetching dhobi payment data:', err);
      setError('Unable to load payment history and earnings summary. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-7 h-7 border-2 border-stone-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Synchronizing Earnings Ledger...</p>
      </div>
    );
  }

  const monthlyUsed = summary?.payments_this_month || 0;
  const monthlyLimit = summary?.monthly_limit || 3;
  const quotaPercent = Math.min(100, Math.round((monthlyUsed / monthlyLimit) * 100));

  return (
    <div className="mt-14">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            Artisan Compensation & Ledger
          </div>
          <h2 className="font-serif text-2xl text-slate-900 tracking-tight">Earnings & Bank Disbursals</h2>
          <p className="text-stone-500 text-xs mt-1">
            Track your completed laundry payouts, monthly payout quota, and bank transfer receipts.
          </p>
        </div>

        <button
          onClick={fetchPaymentData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="font-medium text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Wallet Balance */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Available Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">
            ₹{(summary?.wallet_balance || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-400 mt-1">Ready for next administrative payout</p>
        </div>

        {/* Monthly Payout Quota */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Monthly Payout Quota</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-3xl font-bold text-slate-900">
              {monthlyUsed} <span className="text-stone-400 text-lg font-normal">/ {monthlyLimit}</span>
            </p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              monthlyUsed >= monthlyLimit ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {summary?.remaining_payments_this_month || 0} remaining
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyUsed >= monthlyLimit ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>

        {/* Total Lifetime Earnings */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Lifetime Earnings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">
            ₹{(summary?.total_earnings || summary?.lifetime_earnings || 0).toFixed(2)}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Across {summary?.lifetime_payments_received || 0} disbursed cycles
          </p>
        </div>

        {/* Last Disbursal Date */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-soft hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Last Payout</span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900 truncate">
            {summary?.last_payment_date ? new Date(summary.last_payment_date).toLocaleDateString() : 'Awaiting 1st Payout'}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Verified partner bank account</p>
        </div>

      </div>

      {/* Policy Banner */}
      <div className="mb-8 p-5 rounded-3xl bg-amber-50/70 border border-amber-200/70 text-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Artisan Payout Schedule & Regulations</h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Dhobi partner earnings are settled directly to registered bank accounts up to 3 times per calendar month. For expedited withdrawals or billing queries, contact administration atelier.
            </p>
          </div>
        </div>
      </div>

      {/* Disbursal Records Ledger */}
      <div className="bg-white border border-stone-200/90 rounded-3xl shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Disbursal History</h3>
            <p className="text-stone-400 text-xs">Recent payouts received from Atelier Platform Administration</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
            {paymentHistory.length} Records
          </span>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg text-slate-900">No Disbursals Yet</h4>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Once you complete assigned garment care orders and the platform administrator disburses payment, your settlement vouchers will display here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Voucher ID</th>
                  <th className="py-3.5 px-6 font-bold">Related Order</th>
                  <th className="py-3.5 px-6 font-bold">Disbursed Amount</th>
                  <th className="py-3.5 px-6 font-bold">Transfer Mode</th>
                  <th className="py-3.5 px-6 font-bold">Monthly Slot</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold">Date</th>
                  <th className="py-3.5 px-6 font-bold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentHistory.map((item) => {
                  const status = item.payment_status?.toLowerCase();
                  return (
                    <tr key={item._id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {item.payment_id}
                      </td>
                      <td className="py-4 px-6 text-stone-700">
                        {item.order_id?.order_number ? (
                          <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-[11px] font-bold">
                            #{item.order_id.order_number}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">Periodic Settlement</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-serif text-base font-bold text-emerald-700">
                        +₹{item.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 capitalize text-stone-600">
                        {item.payment_method?.replace(/_/g, ' ') || 'Bank Transfer'}
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        {item.payment_number_in_month ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                            Disbursal #{item.payment_number_in_month} of 3
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="capitalize">{item.payment_status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedReceipt(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-stone-600"
                        >
                          <span>View</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-sm overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Official Settlement</span>
                <h4 className="font-serif text-xl font-bold text-slate-900">Disbursal Voucher</h4>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-stone-400 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center py-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Settled Payout</span>
                <p className="font-serif text-3xl font-bold text-emerald-700 mt-1">
                  ₹{selectedReceipt.amount.toFixed(2)}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {selectedReceipt.payment_status}
                </span>
              </div>

              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Voucher Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.payment_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Disbursal Method:</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedReceipt.payment_method?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-400">Date Timestamp:</span>
                  <span className="font-medium text-slate-900">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
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
