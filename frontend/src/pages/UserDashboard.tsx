import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, Plus, LogOut, X } from 'lucide-react';
import axios from 'axios';
import UserPaymentSection from '../components/UserPaymentSection';
import '../styles/dashboard.css';

const API_URL = 'http://localhost:5000/api';

// Service pricing configuration (must match backend)
const SERVICE_PRICING: { [key: string]: number } = {
  'wash': 50,          // ₹50 per item
  'dry-clean': 80,     // ₹80 per item
  'iron': 30,          // ₹30 per item
  'wash-iron': 100     // ₹100 per item
};

interface OrderStats {
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

interface NewOrder {
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  pickup_date: string;
  total_items: number;
  notes: string;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<OrderStats>({ activeOrders: 0, completedOrders: 0, totalSpent: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<NewOrder>({
    service_type: 'wash',
    pickup_address: '',
    delivery_address: '',
    pickup_date: '',
    total_items: 1,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await axios.get(`${API_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data.data);

      // Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersRes.data.data || []);
    } catch (err: any) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);

    try {
      // Validate pickup date is in future
      const pickupDateTime = new Date(newOrder.pickup_date).getTime();
      if (pickupDateTime <= Date.now()) {
        alert('Pickup date must be in the future');
        setCreatingOrder(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/orders`, newOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowNewOrderModal(false);
        setNewOrder({
          service_type: 'wash',
          pickup_address: '',
          delivery_address: '',
          pickup_date: '',
          total_items: 1,
          notes: ''
        });
        // Refresh orders
        await fetchData();
        alert('Order created successfully!');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      alert('Failed to create order: ' + errorMsg);
      console.error(err);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Calculate current total amount
  const calculateTotal = () => {
    const pricePerItem = SERVICE_PRICING[newOrder.service_type] || 0;
    return pricePerItem * newOrder.total_items;
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'badge-pending',
      'confirmed': 'badge-processing',
      'picked-up': 'badge-processing',
      'processing': 'badge-processing',
      'ready': 'badge-success',
      'delivered': 'badge-success',
      'cancelled': 'badge-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'badge-pending';
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-icon">
              <Package size={24} />
            </div>
            <h1 className="navbar-title">My Dashboard</h1>
          </div>
          <div className="navbar-right">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Customer</p>
            </div>
            <button onClick={logout} className="logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header page-header-with-button">
          <div>
            <h2 className="page-title">Welcome, {user?.name}!</h2>
            <p className="page-subtitle">Manage your laundry orders easily</p>
          </div>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => setShowNewOrderModal(true)}
          >
            <Plus size={20} />
            New Order
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}

        {!loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-left">
                    <p className="stat-label">Active Orders</p>
                    <p className="stat-value">{stats.activeOrders}</p>
                  </div>
                  <div className="stat-icon blue">
                    <Clock size={28} />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-left">
                    <p className="stat-label">Completed</p>
                    <p className="stat-value">{stats.completedOrders}</p>
                  </div>
                  <div className="stat-icon green">
                    <CheckCircle size={28} />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-card-left">
                    <p className="stat-label">Total Spent</p>
                    <p className="stat-value">₹{stats.totalSpent || 0}</p>
                  </div>
                  <div className="stat-icon purple">
                    <Package size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">Your Orders</h2>
              </div>
              {orders.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Service</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.order_number}</strong></td>
                        <td>{order.service_type}</td>
                        <td>{order.total_items || 0}</td>
                        <td><strong>₹{order.total_amount || 0}</strong></td>
                        <td>
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                  No orders yet. <button 
                    className="btn btn-primary" 
                    style={{ marginLeft: '10px' }}
                    onClick={() => setShowNewOrderModal(true)}
                  ><Plus size={18} /> Create one</button>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <UserPaymentSection />
          </>
        )}

        {/* New Order Modal */}
        {showNewOrderModal && (
          <div className="modal-overlay" onClick={() => setShowNewOrderModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Order</h2>
                <button 
                  className="modal-close" 
                  onClick={() => setShowNewOrderModal(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateOrder}>
                <div className="form-group">
                  <label>Service Type</label>
                  <select 
                    value={newOrder.service_type}
                    onChange={(e) => setNewOrder({...newOrder, service_type: e.target.value})}
                    required
                  >
                    <option value="wash">Washing (₹50/item)</option>
                    <option value="dry-clean">Dry Cleaning (₹80/item)</option>
                    <option value="iron">Ironing (₹30/item)</option>
                    <option value="wash-iron">Wash & Iron (₹100/item)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pickup Address</label>
                  <textarea 
                    value={newOrder.pickup_address}
                    onChange={(e) => setNewOrder({...newOrder, pickup_address: e.target.value})}
                    placeholder="Enter your pickup address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <textarea 
                    value={newOrder.delivery_address}
                    onChange={(e) => setNewOrder({...newOrder, delivery_address: e.target.value})}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pickup Date & Time</label>
                  <input 
                    type="datetime-local"
                    value={newOrder.pickup_date}
                    onChange={(e) => setNewOrder({...newOrder, pickup_date: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Items</label>
                    <input 
                      type="number"
                      min="1"
                      value={newOrder.total_items}
                      onChange={(e) => setNewOrder({...newOrder, total_items: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Amount (₹)</label>
                    <input 
                      type="text"
                      value={calculateTotal().toFixed(2)}
                      disabled
                      style={{ backgroundColor: '#f0f0f0' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes/Special Instructions</label>
                  <textarea 
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    placeholder="Add any special instructions or details"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowNewOrderModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={creatingOrder}
                  >
                    {creatingOrder ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
