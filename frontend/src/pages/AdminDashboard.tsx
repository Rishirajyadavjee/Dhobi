import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  LogOut,
  Trash2,
  Edit2,
  Check,
  Briefcase,
  Plus,
  Search,
  ShieldCheck,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  UserX
} from 'lucide-react';
import axios from 'axios';
import AdminPaymentSection from '../components/AdminPaymentSection';

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
  pickup_date?: string;
  pickup_address?: string;
}

interface Dhobi {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  service_area?: string;
  rating?: number;
  total_orders?: number;
}

interface ManagedUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'dhobi' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  address?: string;
  created_at?: string;
  dhobiProfile?: {
    service_area?: string;
    experience_years?: number;
    rating?: number;
    total_orders?: number;
    rate_per_item?: number;
    services_offered?: string;
  };
}

export default function AdminDashboard() {
  const { user: authUser, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'dhobis' | 'finance'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [dhobis, setDhobis] = useState<Dhobi[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [assigningDhobi, setAssigningDhobi] = useState<Order | null>(null);
  const [selectedDhobiId, setSelectedDhobiId] = useState('');

  // User Management (Full CRUD) State
  const [userList, setUserList] = useState<ManagedUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modal: Add New User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'user' | 'dhobi' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'inactive',
    address: '',
    service_area: '',
    experience_years: 0,
    services_offered: 'Wash & Fold, Dry Cleaning',
    rate_per_item: 50
  });

  // Modal: Edit User
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'dhobi' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'inactive',
    password: '',
    address: '',
    service_area: '',
    experience_years: 0,
    services_offered: '',
    rate_per_item: 0
  });

  // Modal: Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);

  useEffect(() => {
    fetchStats();
    fetchAllOrders();
    fetchAllDhobis();
    fetchUsers();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Stats error:', err);
      setError(err.response?.data?.message || 'Failed to load platform stats.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('Orders error:', err);
    }
  };

  const fetchAllDhobis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/dhobis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDhobis(response.data.data || []);
    } catch (err: any) {
      console.error('Dhobis error:', err);
    }
  };

  // Fetch Users with Search & Filters
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.append('status', userStatusFilter);
      if (userSearch.trim()) params.append('search', userSearch.trim());

      const response = await axios.get(`${API_URL}/users/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserList(response.data.data || []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
    } finally {
      setUserLoading(false);
    }
  };

  // Re-fetch users on filter changes
  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter, userStatusFilter]);

  // ----------------------------------------------------
  // USER CRUD HANDLERS
  // ----------------------------------------------------
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');

    const cleanPhone = newUser.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || cleanPhone.startsWith('0')) {
      setUserFormError('Phone number must be exactly 10 digits and cannot start with 0.');
      return;
    }

    if (newUser.password.length < 6) {
      setUserFormError('Password must be at least 6 characters.');
      return;
    }

    setSavingUser(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newUser,
        phone: cleanPhone
      };

      const res = await axios.post(`${API_URL}/users/admin/create`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setShowAddUserModal(false);
        showNotification(`User "${newUser.name}" created successfully!`);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'user',
          status: 'active',
          address: '',
          service_area: '',
          experience_years: 0,
          services_offered: 'Wash & Fold, Dry Cleaning',
          rate_per_item: 50
        });
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      setUserFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleOpenEditUser = (u: ManagedUser) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'user',
      status: u.status || 'active',
      password: '',
      address: u.address || '',
      service_area: u.dhobiProfile?.service_area || '',
      experience_years: u.dhobiProfile?.experience_years || 0,
      services_offered: u.dhobiProfile?.services_offered || '',
      rate_per_item: u.dhobiProfile?.rate_per_item || 0
    });
    setUserFormError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserFormError('');

    const cleanPhone = editUserForm.phone.replace(/\D/g, '');
    if (cleanPhone && (cleanPhone.length !== 10 || cleanPhone.startsWith('0'))) {
      setUserFormError('Phone must be 10 digits and not begin with 0.');
      return;
    }

    setSavingUser(true);
    try {
      const token = localStorage.getItem('token');
      const userId = editingUser._id || editingUser.id;
      const res = await axios.put(`${API_URL}/users/admin/${userId}`, editUserForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setEditingUser(null);
        showNotification(`User "${editUserForm.name}" updated successfully.`);
        fetchUsers();
      }
    } catch (err: any) {
      setUserFormError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const userId = userToDelete._id || userToDelete.id;
      const res = await axios.delete(`${API_URL}/users/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showNotification(`Account for "${userToDelete.name}" deleted.`);
        setUserToDelete(null);
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleToggleUserStatus = async (userObj: ManagedUser) => {
    const newStatusVal = userObj.status === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('token');
      const userId = userObj._id || userObj.id;
      await axios.patch(
        `${API_URL}/users/admin/${userId}/status`,
        { status: newStatusVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(`User status changed to ${newStatusVal}.`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  // ----------------------------------------------------
  // ORDER MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const handleAssignDhobi = async (orderId: string) => {
    if (!selectedDhobiId) {
      alert('Please select a Dhobi partner');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/admin/${orderId}/assign-dhobi`,
        { dhobi_id: selectedDhobiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssigningDhobi(null);
      setSelectedDhobiId('');
      showNotification('Dhobi partner assigned to order.');
      fetchAllOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign dhobi.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string) => {
    if (!newStatus) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingOrder(null);
      setNewStatus('');
      showNotification(`Order status updated to ${newStatus}.`);
      fetchAllOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Order removed.');
      fetchAllOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete order.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status?.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="font-serif text-stone-600 text-sm tracking-wide">Initializing Administrative Atelier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 pt-24 pb-20 selection:bg-slate-900 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Platform Administration Atelier
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Logged in as <strong className="text-slate-900">{authUser?.name}</strong> • Live system coordination & customer database
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAddUserModal(true); setUserFormError(''); }}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add New User / Dhobi</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-full border border-stone-200 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600" />
              <p className="font-medium">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Top Operational Metrics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-8">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">Total Orders</span>
              <p className="font-serif text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
              <p className="text-[11px] text-stone-500 mt-1">Processed across platform</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">Customers</span>
              <p className="font-serif text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
              <p className="text-[11px] text-stone-500 mt-1">Registered clients</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">Dhobi Partners</span>
              <p className="font-serif text-3xl font-bold text-slate-900">{stats.totalDhobis}</p>
              <p className="text-[11px] text-stone-500 mt-1">Active garment artisans</p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">Total Revenue</span>
              <p className="font-serif text-3xl font-bold text-slate-900">₹{stats.totalRevenue || 0}</p>
              <p className="text-[11px] text-emerald-600 mt-1">Settled atelier turnover</p>
            </div>
          </div>
        )}

        {/* Main Administrative Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-px mb-8 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-soft font-bold'
                : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
            }`}
          >
            Orders & Assignments ({orders.length})
          </button>

          <button
            onClick={() => { setActiveTab('users'); fetchUsers(); }}
            className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-soft font-bold'
                : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
            }`}
          >
            User Management (CRUD) ({userList.length})
          </button>

          <button
            onClick={() => setActiveTab('dhobis')}
            className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'dhobis'
                ? 'bg-slate-900 text-white shadow-soft font-bold'
                : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
            }`}
          >
            Dhobi Fleet ({dhobis.length})
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2.5 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'finance'
                ? 'bg-slate-900 text-white shadow-soft font-bold'
                : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
            }`}
          >
            Financial Settlement
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: ORDERS & ASSIGNMENT */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-slate-900">Active Order Dispatch</h2>

              {/* Order Status Filter */}
              <div className="inline-flex p-1 rounded-full bg-stone-200/70 text-xs font-semibold gap-1">
                {['all', 'pending', 'confirmed', 'picked-up', 'processing', 'ready', 'delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded-full transition capitalize ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Service</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Current Status</th>
                      <th className="py-4 px-6">Assigned Dhobi</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400">
                          No orders match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const orderId = order._id || String(order.id);
                        return (
                          <tr key={orderId} className="hover:bg-stone-50/60 transition">
                            <td className="py-4 px-6 font-mono font-bold text-slate-900">
                              #{order.order_number}
                            </td>
                            <td className="py-4 px-6 font-medium text-stone-800">
                              {order.customer_name || 'Guest'}
                            </td>
                            <td className="py-4 px-6 capitalize text-stone-600">
                              {order.service_type}
                            </td>
                            <td className="py-4 px-6 font-serif font-bold text-slate-900 text-sm">
                              ₹{order.total_amount || 0}
                            </td>
                            <td className="py-4 px-6">
                              {editingOrder && (editingOrder._id === order._id || editingOrder.id === order.id) ? (
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white"
                                  >
                                    <option value="">Status...</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="picked-up">Picked Up</option>
                                    <option value="processing">Processing</option>
                                    <option value="ready">Ready</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(orderId)}
                                    className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 capitalize">
                                  {order.status}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {assigningDhobi && (assigningDhobi._id === order._id || assigningDhobi.id === order.id) ? (
                                <div className="flex items-center gap-1.5">
                                  <select
                                    value={selectedDhobiId}
                                    onChange={(e) => setSelectedDhobiId(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white max-w-[150px]"
                                  >
                                    <option value="">Select Dhobi...</option>
                                    {dhobis.map((d) => (
                                      <option key={d._id || d.id} value={d._id || d.id}>
                                        {d.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignDhobi(orderId)}
                                    className="p-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {order.dhobi_name ? (
                                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                                      <Briefcase className="w-3.5 h-3.5" />
                                      {order.dhobi_name}
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 font-semibold text-[11px]">Unassigned</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingOrder(order);
                                    setNewStatus(order.status);
                                  }}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition"
                                  title="Change Status"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setAssigningDhobi(order);
                                    setSelectedDhobiId(order.dhobi_id || '');
                                  }}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-purple-700 hover:bg-purple-50 transition"
                                  title="Assign Dhobi"
                                >
                                  <Briefcase className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(orderId)}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: USER MANAGEMENT (FULL CRUD!) */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    placeholder="Search by name, email, or 10-digit phone..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-stone-50"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Role Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Customers</option>
                      <option value="dhobi">Dhobi Partners</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-stone-400 font-bold uppercase text-[10px]">Status:</span>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <button
                    onClick={() => { setShowAddUserModal(true); setUserFormError(''); }}
                    className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create User</span>
                  </button>
                </div>
              </div>
            </div>

            {/* User Directory Table */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">User & Role</th>
                      <th className="py-4 px-6">Contact (Email & Phone)</th>
                      <th className="py-4 px-6">Service Zone / Address</th>
                      <th className="py-4 px-6">Account Status</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {userLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <span>Searching directory...</span>
                        </td>
                      </tr>
                    ) : userList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          No users found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      userList.map((usr) => {
                        const userId = usr._id || usr.id;
                        return (
                          <tr key={userId} className="hover:bg-stone-50/60 transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                                  {usr.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{usr.name}</p>
                                  <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                                    usr.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : usr.role === 'dhobi'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {usr.role === 'dhobi' ? 'Dhobi Partner' : usr.role}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6 space-y-0.5 text-stone-600">
                              <p className="flex items-center gap-1.5 font-medium">
                                <Mail className="w-3 h-3 text-stone-400" />
                                {usr.email}
                              </p>
                              {usr.phone && (
                                <p className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
                                  <Phone className="w-3 h-3 text-stone-400" />
                                  {usr.phone}
                                </p>
                              )}
                            </td>

                            <td className="py-4 px-6 text-stone-600 max-w-[200px]">
                              {usr.role === 'dhobi' && usr.dhobiProfile?.service_area ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-1 rounded-lg text-[11px] font-medium">
                                  <Briefcase className="w-3 h-3 text-amber-600" />
                                  {usr.dhobiProfile.service_area}
                                </span>
                              ) : usr.address ? (
                                <span className="line-clamp-1">{usr.address}</span>
                              ) : (
                                <span className="text-stone-400 italic">No address saved</span>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleUserStatus(usr)}
                                title="Click to toggle status"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition hover:opacity-80 ${
                                  usr.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className="capitalize">{usr.status}</span>
                              </button>
                            </td>

                            <td className="py-4 px-6 text-stone-400 text-[11px]">
                              {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : 'N/A'}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(usr)}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition"
                                  title="Edit User Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                
                                {usr.status === 'active' ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(usr)}
                                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition"
                                    title="Suspend User"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserStatus(usr)}
                                    className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                    title="Activate User"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => setUserToDelete(usr)}
                                  className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: DHOBI FLEET */}
        {/* ==================================================== */}
        {activeTab === 'dhobis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-slate-900">Garment Artisan Fleet</h2>
              <button
                onClick={() => {
                  setNewUser({ ...newUser, role: 'dhobi' });
                  setShowAddUserModal(true);
                }}
                className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Onboard New Dhobi Partner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dhobis.map((d) => (
                <div key={d._id || d.id} className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-serif font-bold text-base flex items-center justify-center">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{d.name}</h4>
                        <span className="text-[10px] text-stone-400 font-mono">{d.email}</span>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="py-2 border-y border-stone-100 text-xs space-y-1.5 text-stone-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>Zone: <strong>{d.service_area || 'Unassigned'}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      <span>Completed Hampers: <strong>{d.total_orders || 0}</strong></span>
                    </p>
                    {d.phone && (
                      <p className="flex items-center gap-2 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{d.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: FINANCIAL SETTLEMENT */}
        {/* ==================================================== */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <AdminPaymentSection />
          </div>
        )}

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD NEW USER / DHOBI */}
      {/* ---------------------------------------------------- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Directory Provisioning</span>
                <h3 className="font-serif text-xl font-bold text-slate-900">Create New Account</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userFormError && (
              <div className="m-6 mb-0 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Account Role *
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'user', label: 'Customer' },
                    { id: 'dhobi', label: 'Dhobi Partner' },
                    { id: 'admin', label: 'Admin' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setNewUser({ ...newUser, role: r.id as any })}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        newUser.role === r.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. eleanor@example.com"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {newUser.phone && (
                  <p className={`text-[11px] mt-1 ${
                    /^\d{10}$/.test(newUser.phone) && newUser.phone[0] !== '0' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {/^\d{10}$/.test(newUser.phone) && newUser.phone[0] !== '0'
                      ? '✓ Valid 10-digit number'
                      : '✗ Must be 10 digits and not begin with 0'}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="•••••••• (min 6 characters)"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="Street / Area"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Dhobi Extra Fields if role is dhobi */}
              {newUser.role === 'dhobi' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Dhobi Partner Settings
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Service Area Zone</label>
                    <input
                      type="text"
                      value={newUser.service_area}
                      onChange={(e) => setNewUser({ ...newUser, service_area: e.target.value })}
                      placeholder="e.g. West London, Camden"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Experience (Yrs)</label>
                      <input
                        type="number"
                        min="0"
                        value={newUser.experience_years}
                        onChange={(e) => setNewUser({ ...newUser, experience_years: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Rate / Item (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newUser.rate_per_item}
                        onChange={(e) => setNewUser({ ...newUser, rate_per_item: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-stone-300"
                >
                  {savingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: EDIT USER */}
      {/* ---------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Account Editing</span>
                <h3 className="font-serif text-xl font-bold text-slate-900">Edit User: {editingUser.name}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userFormError && (
              <div className="m-6 mb-0 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="user">Customer</option>
                    <option value="dhobi">Dhobi Partner</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="New password (optional)"
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editUserForm.address}
                  onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {editUserForm.role === 'dhobi' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Dhobi Details
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Service Area Zone</label>
                    <input
                      type="text"
                      value={editUserForm.service_area}
                      onChange={(e) => setEditUserForm({ ...editUserForm, service_area: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Experience (Yrs)</label>
                      <input
                        type="number"
                        min="0"
                        value={editUserForm.experience_years}
                        onChange={(e) => setEditUserForm({ ...editUserForm, experience_years: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Rate / Item (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editUserForm.rate_per_item}
                        onChange={(e) => setEditUserForm({ ...editUserForm, rate_per_item: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-6 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-stone-300"
                >
                  {savingUser ? 'Updating...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: DELETE CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-md p-6 border border-stone-200 space-y-4">
            <h3 className="font-serif text-xl font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-slate-900">{userToDelete.name}</strong> ({userToDelete.email})? 
              All associated orders and records will be deleted. This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-full"
              >
                Confirm Delete User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
