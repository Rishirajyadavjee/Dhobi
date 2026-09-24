import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Package, TrendingUp, Settings, LogOut, Trash2, Edit2, Check, Briefcase } from 'lucide-react';
import axios from 'axios';
import AdminPaymentSection from '../components/AdminPaymentSection';
import '../styles/dashboard.css';

const API_URL = 'http://localhost:5000/api';

interface AdminStats {
  totalUsers: number;
  totalDhobis: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  activeDhobis: any[];
}

interface Order {
  id: number;
  _id?: string;
  order_number: string;
  customer_name: string;
  status: string;
  total_amount: number;
  service_type: string;
  dhobi_id?: string;
  dhobi_name?: string;
}

interface Dhobi {
  _id: string;
  id: string;
  name: string;
  email: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dhobis, setDhobis] = useState<Dhobi[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [assigningDhobi, setAssigningDhobi] = useState<Order | null>(null);
  const [selectedDhobi, setSelectedDhobi] = useState('');

  useEffect(() => {
    fetchStats();
    fetchAllOrders();
    fetchAllDhobis();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Stats response:', response.data);
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Stats error:', err);
      setError('Failed to load statistics: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDhobis = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/dhobis`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Dhobis response:', response.data);
      setDhobis(response.data.data || []);
    } catch (err: any) {
      console.error('Dhobis error:', err);
    }
  };

  const handleAssignDhobi = async (orderId: string) => {
    if (!selectedDhobi) {
      alert('Please select a dhobi');
      return;
    }
    
    console.log('Assigning dhobi:', { orderId, selectedDhobi });
    
    try {
      const response = await axios.put(
        `${API_URL}/orders/admin/${orderId}/assign-dhobi`,
        { dhobi_id: selectedDhobi },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      console.log('Assignment response:', response.data);
      
      // Update the order in local state
      const updatedOrders = orders.map(o => {
        if (o._id === orderId) {
          const selectedDhobiObj = dhobis.find(d => d._id === selectedDhobi);
          console.log('Updating order:', { order: o, selectedDhobiObj });
          return { 
            ...o, 
            dhobi_id: selectedDhobi,
            dhobi_name: selectedDhobiObj?.name
          };
        }
        return o;
      });
      setOrders(updatedOrders);
      setAssigningDhobi(null);
      setSelectedDhobi('');
      alert('Dhobi assigned successfully');
      await fetchStats();
    } catch (err: any) {
      console.error('Assignment error:', err);
      alert('Failed to assign dhobi: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Orders response:', response.data);
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('Orders error:', err);
    }
  };

  const handleDeleteOrder = async (orderId: any) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${API_URL}/orders/admin/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setOrders(orders.filter(o => (o._id || o.id) !== orderId));
        alert('Order deleted successfully');
      } catch (err: any) {
        alert('Failed to delete order: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleUpdateStatus = async (orderId: any) => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    try {
      await axios.put(
        `${API_URL}/orders/admin/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setOrders(orders.map(o => (o._id || o.id) === orderId ? { ...o, status: newStatus } : o));
      setEditingOrder(null);
      setNewStatus('');
      alert('Order updated successfully');
      await fetchStats();
    } catch (err: any) {
      alert('Failed to update order: ' + (err.response?.data?.message || err.message));
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'blue' },
    { icon: Package, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'green' },
    { icon: Users, label: 'Active Dhobis', value: stats?.totalDhobis || 0, color: 'purple' },
    { icon: TrendingUp, label: 'Revenue', value: `₹${stats?.totalRevenue || 0}`, color: 'orange' },
  ];

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-icon">
              <Settings size={24} />
            </div>
            <h1 className="navbar-title">Admin Panel</h1>
          </div>
          <div className="navbar-right">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
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
          <h2 className="page-title">Dashboard Overview</h2>
          <p className="page-subtitle">Welcome back, manage your platform efficiently</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}

        {!loading && stats && (
          <>
            <div className="stats-grid">
              {statCards.map((stat, index) => (
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

            <div className="two-column-grid">
              <div className="grid-card">
                <h3>Recent Orders</h3>
                <div className="list-container">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order: any) => (
                      <div key={order.id} className="list-item">
                        <div className="list-item-header">
                          <div>
                            <p className="list-item-title">{order.order_number}</p>
                            <p className="list-item-subtitle">Customer: {order.customer_name}</p>
                          </div>
                          <span className={`badge badge-${order.status?.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#718096' }}>No orders yet</p>
                  )}
                </div>
              </div>

              <div className="grid-card">
                <h3>Active Dhobis</h3>
                <div className="list-container">
                  {stats.activeDhobis && stats.activeDhobis.length > 0 ? (
                    stats.activeDhobis.map((dhobi: any) => (
                      <div key={dhobi.id} className="list-item">
                        <div className="list-item-header">
                          <div className="profile-info">
                            <div className="profile-avatar">{dhobi.name?.charAt(0)}</div>
                            <div className="profile-details">
                              <h4>{dhobi.name}</h4>
                              <p>{dhobi.completed_orders || 0} orders completed</p>
                            </div>
                          </div>
                          <span style={{ width: '12px', height: '12px', background: '#48bb78', borderRadius: '50%' }}></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#718096' }}>No dhobis yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">All Orders - Manage & Assign to Dhobis</h2>
              </div>
              {orders.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Assigned Dhobi</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id || order.id}>
                          <td><strong>{order.order_number}</strong></td>
                          <td>{order.customer_name || 'Unknown'}</td>
                          <td>{order.service_type}</td>
                          <td><strong>₹{order.total_amount || 0}</strong></td>
                          <td>
                            {editingOrder?._id === order._id || editingOrder?.id === order.id ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select 
                                  value={newStatus} 
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  style={{ padding: '6px', borderRadius: '4px', flex: 1 }}
                                >
                                  <option value="">Select Status</option>
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="picked-up">Picked Up</option>
                                  <option value="processing">Processing</option>
                                  <option value="ready">Ready</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button 
                                  onClick={() => handleUpdateStatus(order._id || order.id)}
                                  style={{ background: '#48bb78', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className={`badge badge-${order.status?.toLowerCase()}`}>
                                {order.status}
                              </span>
                            )}
                          </td>
                          <td>
                            {assigningDhobi?._id === order._id || assigningDhobi?.order_number === order.order_number ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select 
                                  value={selectedDhobi} 
                                  onChange={(e) => setSelectedDhobi(e.target.value)}
                                  style={{ padding: '6px', borderRadius: '4px', flex: 1 }}
                                >
                                  <option value="">Select Dhobi</option>
                                  {dhobis.map((dhobi) => (
                                    <option key={dhobi._id} value={dhobi._id}>
                                      {dhobi.name} ({dhobi.email})
                                    </option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => handleAssignDhobi(order._id)}
                                  style={{ background: '#667eea', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: order.dhobi_id ? '#48bb78' : '#a0aec0' }}>
                                  {order.dhobi_name ? (
                                    <>
                                      <Briefcase size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                      {order.dhobi_name}
                                    </>
                                  ) : (
                                    <span style={{ color: '#e53e3e' }}>Unassigned</span>
                                  )}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => {
                                setEditingOrder(order);
                                setNewStatus(order.status);
                              }}
                              style={{ background: '#667eea', color: 'white', border: 'none', padding: '6px 12px', marginRight: '4px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => {
                                setAssigningDhobi(order);
                                setSelectedDhobi(order.dhobi_id || '');
                              }}
                              style={{ background: '#9f7aea', color: 'white', border: 'none', padding: '6px 12px', marginRight: '4px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            >
                              <Briefcase size={14} /> Assign
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order._id || order.id)}
                              style={{ background: '#f56565', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                  No orders available
                </div>
              )}
            </div>

            {/* Payment Section */}
            <AdminPaymentSection />
          </>
        )}
      </main>
    </div>
  );
}
