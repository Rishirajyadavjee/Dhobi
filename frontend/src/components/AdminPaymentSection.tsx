import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, AlertCircle, Send, RefreshCw } from 'lucide-react';
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
  const [paymentFilter, setPaymentFilter] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    dhobiId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    description: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');

      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/payments/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data.data);

      // Fetch all payments
      const paymentsRes = await axios.get(`${API_URL}/payments/admin/all-payments?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(paymentsRes.data.data);

      // Fetch dhobis
      const dhobisRes = await axios.get(`${API_URL}/users/dhobis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDhobis(dhobisRes.data.data || []);
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentForm.dhobiId || !paymentForm.amount) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessingPayment(true);

    try {
      const selectedDhobi = dhobis.find(d => d._id === paymentForm.dhobiId);

      // Check if dhobi has reached monthly limit
      if (selectedDhobi && selectedDhobi.dhobiProfile?.payments_this_month >= 3) {
        setError(`Dhobi ${selectedDhobi.name} has reached the monthly payment limit (3 payments)`);
        setProcessingPayment(false);
        return;
      }

      await axios.post(
        `${API_URL}/payments/admin/dhobi-payment`,
        {
          dhobiId: paymentForm.dhobiId,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setPaymentForm({
        dhobiId: '',
        amount: '',
        paymentMethod: 'bank_transfer',
        description: ''
      });
      setShowPaymentForm(false);
      setError('');

      // Refresh data
      await fetchPaymentData();
      alert('Payment processed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const selectedDhobi = dhobis.find(d => d._id === paymentForm.dhobiId);
  const canPayDhobi = !selectedDhobi || (selectedDhobi.dhobiProfile?.payments_this_month || 0) < 3;

  const filteredPayments = paymentFilter
    ? payments.filter(p => p.payment_type === paymentFilter)
    : payments;

  return (
    <div style={{ marginTop: '32px' }}>
      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#c33'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <TrendingUp size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>User Revenue</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{stats?.user_payments.total_revenue.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>
            {stats?.user_payments.total_transactions || 0} transactions
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CreditCard size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Dhobi Payments</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{stats?.dhobi_payments.total_paid.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>
            {stats?.dhobi_payments.total_transactions || 0} payments processed
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <AlertCircle size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Pending</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{stats?.pending_payments.total.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>
            {stats?.pending_payments.count || 0} payments
          </p>
        </div>
      </div>

      {/* Process Dhobi Payment Section */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Process Dhobi Payment</h3>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {showPaymentForm ? 'Cancel' : '+ New Payment'}
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handlePaymentSubmit} style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Select Dhobi
              </label>
              <select
                value={paymentForm.dhobiId}
                onChange={(e) => setPaymentForm({ ...paymentForm, dhobiId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose a dhobi</option>
                {dhobis.map((dhobi) => {
                  const paymentCount = dhobi.dhobiProfile?.payments_this_month || 0;
                  const canPay = paymentCount < 3;
                  return (
                    <option key={dhobi._id} value={dhobi._id} disabled={!canPay}>
                      {dhobi.name} ({paymentCount}/3) {!canPay ? '- LIMIT REACHED' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedDhobi && (
              <div style={{
                background: canPayDhobi ? '#d1fae5' : '#fee2e2',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                color: canPayDhobi ? '#065f46' : '#7f1d1d',
                fontWeight: '500'
              }}>
                {canPayDhobi
                  ? `✓ ${selectedDhobi.name} can receive ${3 - (selectedDhobi.dhobiProfile?.payments_this_month || 0)} more payment(s) this month`
                  : `✗ ${selectedDhobi.name} has reached the monthly payment limit (3/3)`}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
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
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Payment Method
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px'
                }}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Description
              </label>
              <input
                type="text"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                placeholder="Add payment description"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={processingPayment || !canPayDhobi}
              style={{
                background: '#48bb78',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: processingPayment || !canPayDhobi ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: processingPayment || !canPayDhobi ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Send size={16} />
              {processingPayment ? 'Processing...' : 'Process Payment'}
            </button>
          </form>
        )}
      </div>

      {/* Payment Records */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Payment Records</h3>
          <button
            onClick={() => fetchPaymentData()}
            disabled={refreshing}
            style={{
              background: 'transparent',
              border: '1px solid #cbd5e0',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setPaymentFilter('')}
            style={{
              background: paymentFilter === '' ? '#667eea' : '#e2e8f0',
              color: paymentFilter === '' ? 'white' : '#1f2937',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            All
          </button>
          <button
            onClick={() => setPaymentFilter('order_payment')}
            style={{
              background: paymentFilter === 'order_payment' ? '#667eea' : '#e2e8f0',
              color: paymentFilter === 'order_payment' ? 'white' : '#1f2937',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            User Payments
          </button>
          <button
            onClick={() => setPaymentFilter('dhobi_payment')}
            style={{
              background: paymentFilter === 'dhobi_payment' ? '#667eea' : '#e2e8f0',
              color: paymentFilter === 'dhobi_payment' ? 'white' : '#1f2937',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Dhobi Payments
          </button>
        </div>

        {filteredPayments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Payment ID
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Party
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Amount
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Method
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>
                      {payment.payment_id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: payment.payment_type === 'order_payment' ? '#dbeafe' : '#dcfce7',
                        color: payment.payment_type === 'order_payment' ? '#1e40af' : '#166534',
                        fontWeight: '500',
                        fontSize: '12px'
                      }}>
                        {payment.payment_type === 'order_payment' ? 'User' : 'Dhobi'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {payment.payment_type === 'order_payment'
                        ? payment.user_id?.name || 'Unknown'
                        : payment.dhobi_id?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'capitalize' }}>
                      {payment.payment_method.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: payment.payment_status === 'completed' ? '#d1fae5' : '#fef3c7',
                        color: payment.payment_status === 'completed' ? '#065f46' : '#92400e',
                        fontWeight: '500',
                        fontSize: '12px'
                      }}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#718096'
          }}>
            No payments found
          </div>
        )}
      </div>
    </div>
  );
}
