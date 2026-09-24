import { useState, useEffect } from 'react';
import { CreditCard, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
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
      setError('Failed to load wallet information');
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/user/payment-history?limit=10`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPaymentHistory(response.data.data);
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

    if (!paymentForm.orderId || !paymentForm.amount) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessingPayment(true);

    try {
      await axios.post(
        `${API_URL}/payments/user/order-payment`,
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

      setPaymentForm({
        orderId: '',
        amount: '',
        paymentMethod: 'cash',
        description: ''
      });
      setShowPaymentForm(false);
      setError('');

      // Refresh data
      fetchWalletData();
      fetchPaymentHistory();
      fetchOrders();

      alert('Payment processed successfully!');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to process payment'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const selectedOrder = orders.find(o => o._id === paymentForm.orderId);

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Payment Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            <Wallet size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Wallet Balance</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{wallet?.wallet_balance.toFixed(2) || '0.00'}
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
            <TrendingUp size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Total Spent</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{wallet?.total_spent.toFixed(2) || '0.00'}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CreditCard size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Transactions</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {wallet?.payment_count || 0}
          </p>
        </div>
      </div>

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

      {/* Make Payment Section */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Make Payment</h3>
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
                Select Order
              </label>
              <select
                value={paymentForm.orderId}
                onChange={(e) => setPaymentForm({ ...paymentForm, orderId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose an unpaid order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.order_number} - ₹{order.total_amount} ({order.service_type})
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <div style={{
                background: '#e6f3ff',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Order Amount:</strong> ₹{selectedOrder.total_amount}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Service Type:</strong> {selectedOrder.service_type}
                </p>
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
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Notes (Optional)
              </label>
              <textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                placeholder="Add any notes about this payment"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={processingPayment}
              style={{
                background: '#48bb78',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: processingPayment ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: processingPayment ? 0.6 : 1
              }}
            >
              {processingPayment ? 'Processing...' : 'Complete Payment'}
            </button>
          </form>
        )}
      </div>

      {/* Payment History */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Payment History</h3>
        </div>

        {paymentHistory.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Payment ID
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Order
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
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>
                      {payment.payment_id}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      {payment.order_id?.order_number || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', textTransform: 'capitalize' }}>
                      {payment.payment_method}
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
            No payment history yet
          </div>
        )}
      </div>
    </div>
  );
}
