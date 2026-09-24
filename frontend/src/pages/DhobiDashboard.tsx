import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Star, TrendingUp, LogOut } from 'lucide-react';
import axios from 'axios';
import DhobiPaymentSection from '../components/DhobiPaymentSection';
import '../styles/dashboard.css';

const API_URL = 'http://localhost:5000/api';

export default function DhobiDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/dhobi`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Package, label: 'Assigned Orders', value: orders.length, color: 'blue' },
    { icon: TrendingUp, label: 'Completed', value: orders.filter(o => o.status === 'delivered').length, color: 'green' },
    { icon: Star, label: 'Rating', value: '4.8', color: 'orange' },
  ];

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Refresh orders
      fetchOrders();
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-icon">
              <Package size={24} />
            </div>
            <h1 className="navbar-title">Dhobi Dashboard</h1>
          </div>
          <div className="navbar-right">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Service Provider</p>
            </div>
            <button onClick={logout} className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Today's Schedule</h2>
          <p className="page-subtitle">Manage your assigned orders</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}

        {!loading && (
          <>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-card-content">
                    <div className="stat-card-left">
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                    <div className={`stat-icon ${stat.color}`}>
                      <stat.icon size={28} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">Assigned Orders</h2>
              </div>
              {orders.length > 0 ? (
                <div style={{ padding: '24px' }}>
                  <div className="dhobi-schedule">
                    {orders.map((order) => (
                      <div key={order.id} className="schedule-item">
                        <div className="list-item-header">
                          <div>
                            <p className="list-item-title">{order.order_number}</p>
                            <p className="list-item-subtitle">Customer: {order.customer_name}</p>
                          </div>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '20px',
                              border: 'none',
                              background: '#667eea',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="picked-up">Picked Up</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                        <div className="list-item-meta">
                          <span>{order.service_type} • {order.total_items || 0} items</span>
                          <span className="schedule-time">Amount: ₹{order.total_amount || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                  No orders assigned yet
                </div>
              )}
            </div>

            {/* Payment Section */}
            <DhobiPaymentSection />
          </>
        )}
      </main>
    </div>
  );
}
