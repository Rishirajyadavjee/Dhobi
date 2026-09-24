import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertCircle, Check, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DhobiPaymentSummary {
  wallet_balance: number;
  total_earnings: number;
  payments_this_month: number;
  remaining_payments_this_month: number;
  monthly_limit: number;
  last_payment_date: string;
  lifetime_payments_received: number;
  lifetime_earnings: number;
}

interface PaymentRecord {
  _id: string;
  payment_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_number_in_month: number;
  description: string;
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

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch payment summary
      const summaryRes = await axios.get(`${API_URL}/payments/dhobi/payment-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(summaryRes.data.data);

      // Fetch payment history
      const historyRes = await axios.get(`${API_URL}/payments/dhobi/payment-history?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentHistory(historyRes.data.data);
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const canReceivePayment = summary && summary.remaining_payments_this_month > 0;
  const limitPercentage = summary
    ? ((summary.payments_this_month / summary.monthly_limit) * 100)
    : 0;

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
            ₹{summary?.wallet_balance.toFixed(2) || '0.00'}
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
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Total Earnings</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            ₹{summary?.total_earnings.toFixed(2) || '0.00'}
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
            <TrendingUp size={24} />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Lifetime Payments</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {summary?.lifetime_payments_received || 0}
          </p>
        </div>
      </div>

      {/* Monthly Payment Limit Tracker */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
          Monthly Payment Limit
        </h3>

        <div style={{
          background: canReceivePayment ? '#d1fae5' : '#fee2e2',
          border: `2px solid ${canReceivePayment ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {canReceivePayment ? (
            <>
              <Check size={24} style={{ color: '#10b981' }} />
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#065f46' }}>
                  You can receive {summary?.remaining_payments_this_month} more payment(s) this month
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={24} style={{ color: '#ef4444' }} />
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#7f1d1d' }}>
                  You have reached your monthly payment limit ({summary?.monthly_limit} payments)
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#991b1b' }}>
                  You can receive payments again next month
                </p>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px'
          }}>
            <span style={{ fontWeight: '500' }}>Payments This Month</span>
            <span style={{ color: '#64748b' }}>
              {summary?.payments_this_month} / {summary?.monthly_limit}
            </span>
          </div>
          <div style={{
            background: '#e2e8f0',
            borderRadius: '8px',
            height: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: canReceivePayment ? '#10b981' : '#f97316',
              height: '100%',
              width: `${limitPercentage}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {summary?.last_payment_date && (
          <p style={{
            margin: '12px 0 0 0',
            fontSize: '13px',
            color: '#64748b'
          }}>
            Last payment received: {new Date(summary.last_payment_date).toLocaleDateString()}
          </p>
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
                    Amount
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                    Payment #
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
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: '500',
                        fontSize: '12px'
                      }}>
                        {payment.payment_number_in_month}/{summary?.monthly_limit}
                      </span>
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
            No payment history yet. You will see payment records here when the admin processes payments.
          </div>
        )}
      </div>

      {/* Bank Account Information Notice */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px',
        fontSize: '13px',
        color: '#1e40af'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>💡 Update Bank Details</p>
        <p style={{ margin: 0 }}>
          Make sure to update your bank account details in your profile to receive payments directly to your account.
        </p>
      </div>
    </div>
  );
}
