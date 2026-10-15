import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Clock,
  CheckCircle2,
  Plus,
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Truck,
  Sparkles,
  ShoppingBag,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import UserPaymentSection from '../components/UserPaymentSection';

const API_URL = 'http://localhost:5000/api';

const SERVICE_RATES: Record<string, { label: string; rate: number; unit: string; desc: string }> = {
  'wash': { label: 'Daily Wash & Fold', rate: 50, unit: 'per item', desc: 'Cold plant-enzyme wash, sorted by fabric color' },
  'dry-clean': { label: 'Artisan Dry Cleaning', rate: 80, unit: 'per piece', desc: 'Hydrocarbon solvent cleaning with contour steam finishing' },
  'iron': { label: 'Executive Steam Press', rate: 30, unit: 'per piece', desc: 'High-volume dry steam with Teflon-shoe plates' },
  'wash-iron': { label: 'Wash, Steam & Hanger', rate: 100, unit: 'per piece', desc: 'Complete bespoke washing and precision hand pressing' }
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
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStats>({ activeOrders: 0, completedOrders: 0, totalSpent: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  const [newOrder, setNewOrder] = useState<NewOrder>({
    service_type: 'wash',
    pickup_address: user?.address || '',
    delivery_address: user?.address || '',
    pickup_date: '',
    total_items: 2,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/orders/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data.data || { activeOrders: 0, completedOrders: 0, totalSpent: 0 });
      setOrders(ordersRes.data.data || []);
    } catch (err: any) {
      console.error('UserDashboard fetch error:', err);
      setError('Unable to retrieve orders and account stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newOrder.pickup_address.trim()) {
      setError('Pickup address is required.');
      return;
    }

    if (!newOrder.pickup_date) {
      setError('Please choose a preferred pickup date and time.');
      return;
    }

    const pickupDateTime = new Date(newOrder.pickup_date).getTime();
    if (pickupDateTime <= Date.now()) {
      setError('Pickup time must be scheduled for a future time slot.');
      return;
    }

    setCreatingOrder(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/orders`, newOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowNewOrderModal(false);
        setOrderSuccessMessage(`Hamper order #${response.data.data?.order_number || ''} scheduled successfully!`);
        setTimeout(() => setOrderSuccessMessage(''), 6000);
        setNewOrder({
          service_type: 'wash',
          pickup_address: user?.address || '',
          delivery_address: user?.address || '',
          pickup_date: '',
          total_items: 2,
          notes: ''
        });
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please review your details.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this hamper collection?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['pending', 'confirmed', 'picked-up', 'processing', 'ready'].includes(order.status?.toLowerCase());
    }
    if (statusFilter === 'completed') return order.status?.toLowerCase() === 'delivered';
    if (statusFilter === 'cancelled') return order.status?.toLowerCase() === 'cancelled';
    return true;
  });

  const estimatedOrderCost = (SERVICE_RATES[newOrder.service_type]?.rate || 50) * newOrder.total_items;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 pt-24 pb-20 selection:bg-slate-900 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Customer Atelier Space
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Wardrobe Care Overview
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Welcome back, <strong className="text-slate-900 font-semibold">{user?.name}</strong>. Monitor your active garments, tracking, and atelier history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Schedule New Hamper</span>
            </button>
          </div>
        </div>

        {/* Global Notifications / Alerts */}
        {orderSuccessMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="font-medium">{orderSuccessMessage}</p>
            </div>
            <button onClick={() => setOrderSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500">In Atelier Care</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">{stats.activeOrders}</p>
            <p className="text-xs text-stone-500 mt-1">Hampers currently being treated or in transit</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500">Delivered Fresh</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">{stats.completedOrders}</p>
            <p className="text-xs text-stone-500 mt-1">Returned in reusable canvas hampers</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500">Care Investment</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-3">₹{stats.totalSpent || 0}</p>
            <p className="text-xs text-stone-500 mt-1">Total spend on garment longevity</p>
          </div>
        </div>

        {/* Orders Section Header & Filter */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl text-slate-900">Your Laundry Orders</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-200/80 font-bold text-stone-700">
              {filteredOrders.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-full bg-stone-200/70 border border-stone-300/60 gap-1 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'Active / In Care' },
              { id: 'completed', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Synchronizing Orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft my-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-slate-900">No Orders in this category</h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
              Schedule your first doorstep laundry or dry-cleaning load and our courier will deliver your personalized canvas hamper.
            </p>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-soft hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Book First Pickup</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {filteredOrders.map((order) => {
              const status = order.status?.toLowerCase() || 'pending';
              const serviceInfo = SERVICE_RATES[order.service_type] || { label: order.service_type, rate: 0, unit: '', desc: '' };

              const getStatusBadge = (st: string) => {
                switch (st) {
                  case 'delivered':
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Delivered</span>;
                  case 'processing':
                  case 'in-care':
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Atelier Wash</span>;
                  case 'picked-up':
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"><Truck className="w-3 h-3" /> Collected</span>;
                  case 'ready':
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Ready for Dispatch</span>;
                  case 'cancelled':
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
                  default:
                    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">Scheduled</span>;
                }
              };

              return (
                <div
                  key={order._id || order.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-stone-400 font-bold tracking-wider">
                          #{order.order_number}
                        </span>
                        <h4 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                          {serviceInfo.label}
                        </h4>
                      </div>
                      {getStatusBadge(status)}
                    </div>

                    {/* Service & Items */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">Garments / Items</span>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-stone-500" />
                          {order.total_items} items
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">Order Total</span>
                        <p className="font-serif text-base font-bold text-slate-900">
                          ₹{order.total_amount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Timeline & Addresses */}
                    <div className="space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Pickup Slot: <strong>{new Date(order.pickup_date).toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{order.pickup_address}</span>
                      </div>
                      {order.dhobi_name && (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Assigned Master Care: <strong>{order.dhobi_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-5 border-t border-stone-100 mt-5 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="text-xs font-bold text-slate-900 hover:text-stone-600 inline-flex items-center gap-1 transition"
                    >
                      <span>View Care Ticket</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {['pending', 'confirmed'].includes(status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id || order.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                      >
                        Cancel Pickup
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* User Payment & Wallet Management */}
        <div className="mt-14">
          <UserPaymentSection />
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: Schedule New Hamper Pickup */}
      {/* ---------------------------------------------------- */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-lg overflow-hidden border border-stone-200 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Doorstep Collection</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900">Schedule Hamper Pickup</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Select Garment Care Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(SERVICE_RATES).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewOrder({ ...newOrder, service_type: key })}
                      className={`p-3.5 rounded-2xl text-left border transition-all text-xs ${
                        newOrder.service_type === key
                          ? 'border-slate-900 bg-slate-900 text-white shadow-soft font-semibold'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <p className="font-bold">{val.label}</p>
                      <p className={`text-[11px] mt-1 ${newOrder.service_type === key ? 'text-stone-300' : 'text-stone-500'}`}>
                        ₹{val.rate} {val.unit}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Items / Hampers */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Estimated Garment Count
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOrder.total_items}
                    onChange={(e) => setNewOrder({ ...newOrder, total_items: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-24 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-bold text-center"
                  />
                  <div className="text-xs text-stone-500">
                    <span>Estimated total: </span>
                    <strong className="text-slate-900 font-serif text-base font-bold">₹{estimatedOrderCost}</strong>
                    <span className="block text-[11px] text-emerald-600">✓ Free pickup on orders above ₹200</span>
                  </div>
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Pickup Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newOrder.pickup_address}
                  onChange={(e) => setNewOrder({ ...newOrder, pickup_address: e.target.value })}
                  placeholder="Apartment, building, street, landmark"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Delivery Address (Leave same for round-trip return)
                </label>
                <textarea
                  rows={2}
                  value={newOrder.delivery_address}
                  onChange={(e) => setNewOrder({ ...newOrder, delivery_address: e.target.value })}
                  placeholder="Same as pickup address if blank"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              {/* Preferred Date & Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Preferred Pickup Time Slot *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newOrder.pickup_date}
                  onChange={(e) => setNewOrder({ ...newOrder, pickup_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              {/* Special Laundry Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Care Instructions & Stain Notices (Optional)
                </label>
                <input
                  type="text"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="e.g. coffee stain on linen shirt, hang dry wool"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="px-6 py-2.5 rounded-full text-xs font-bold tracking-wide bg-slate-900 hover:bg-slate-800 text-white shadow-soft transition disabled:bg-stone-300"
                >
                  {creatingOrder ? 'Registering Pickup...' : 'Confirm Pickup Request'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: Care Ticket Details */}
      {/* ---------------------------------------------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-md overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Order Audit</span>
                <h3 className="font-serif text-xl font-bold text-slate-900">Ticket #{selectedOrderDetails.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Service Type</span>
                <p className="font-bold text-slate-900 text-sm">
                  {SERVICE_RATES[selectedOrderDetails.service_type]?.label || selectedOrderDetails.service_type}
                </p>
                <p className="text-stone-500 text-[11px]">
                  {SERVICE_RATES[selectedOrderDetails.service_type]?.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50">
                  <span className="text-stone-400 block mb-0.5">Quantity</span>
                  <p className="font-bold text-slate-900">{selectedOrderDetails.total_items} pieces</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50">
                  <span className="text-stone-400 block mb-0.5">Amount</span>
                  <p className="font-bold text-slate-900 font-serif text-base">₹{selectedOrderDetails.total_amount}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Collection Address</span>
                <p className="text-stone-700 font-medium">{selectedOrderDetails.pickup_address}</p>
              </div>

              {selectedOrderDetails.notes && (
                <div className="space-y-1 pt-2">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Special Fabric Notes</span>
                  <p className="text-stone-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 font-medium">
                    "{selectedOrderDetails.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 text-right">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
