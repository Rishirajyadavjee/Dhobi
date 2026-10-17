import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Truck,
  Sparkles,
  Search,
  Phone,
  RefreshCw,
  LogOut,
  ChevronRight,
  Star,
  Check,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import DhobiPaymentSection from '../components/DhobiPaymentSection';

const API_URL = 'http://localhost:5000/api';

const SERVICE_RATES: Record<string, { label: string; rate: number; unit: string; desc: string }> = {
  'wash': { label: 'Daily Wash & Fold', rate: 50, unit: 'per item', desc: 'Cold plant-enzyme wash, sorted by fabric color' },
  'dry-clean': { label: 'Artisan Dry Cleaning', rate: 80, unit: 'per piece', desc: 'Hydrocarbon solvent cleaning with contour steam finishing' },
  'iron': { label: 'Executive Steam Press', rate: 30, unit: 'per piece', desc: 'High-volume dry steam with Teflon-shoe plates' },
  'wash-iron': { label: 'Wash, Steam & Hanger', rate: 100, unit: 'per piece', desc: 'Complete bespoke washing and precision hand pressing' }
};

interface Order {
  id: string | number;
  _id?: string;
  order_number: string;
  service_type: string;
  status: string;
  total_items?: number;
  total_amount?: number;
  pickup_date?: string;
  pickup_address?: string;
  delivery_address?: string;
  notes?: string;
  customer_name?: string;
  customer_phone?: string;
  created_at?: string;
}

export default function DhobiDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | number | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/dhobi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load dhobi orders:', err);
      setError('Unable to load assigned schedule. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string | number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(`Order status successfully updated to "${newStatus.replace('-', ' ')}".`);
      fetchOrders();
      if (selectedOrderDetails && (selectedOrderDetails.id === orderId || selectedOrderDetails._id === orderId)) {
        setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmOrder = async (orderId: string | number) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${orderId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Order confirmed! Ready for pickup schedule.');
      fetchOrders();
    } catch (err: any) {
      console.error('Failed to confirm order:', err);
      setError(err.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Quick sequential progress step
  const getNextStatusAction = (currentStatus: string): { nextStatus: string; label: string; icon: any } | null => {
    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return { nextStatus: 'confirmed', label: 'Accept & Confirm', icon: Check };
      case 'confirmed':
        return { nextStatus: 'picked-up', label: 'Mark Picked Up', icon: Truck };
      case 'picked-up':
        return { nextStatus: 'processing', label: 'Start Atelier Care', icon: Sparkles };
      case 'processing':
      case 'in-care':
        return { nextStatus: 'ready', label: 'Mark Ready for Dispatch', icon: CheckCircle2 };
      case 'ready':
        return { nextStatus: 'delivered', label: 'Mark Delivered', icon: CheckCircle2 };
      default:
        return null;
    }
  };

  // Stats calculation
  const totalAssigned = orders.length;
  const inCareCount = orders.filter((o) =>
    ['pending', 'confirmed', 'picked-up', 'processing', 'ready'].includes(o.status?.toLowerCase())
  ).length;
  const deliveredCount = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
  const totalEarningsEstimated = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Filter & Search logic
  const filteredOrders = orders.filter((order) => {
    const status = order.status?.toLowerCase() || '';
    if (statusFilter === 'active') {
      if (!['pending', 'confirmed', 'picked-up', 'processing', 'ready'].includes(status)) return false;
    } else if (statusFilter === 'confirmation') {
      if (!['pending', 'confirmed'].includes(status)) return false;
    } else if (statusFilter === 'processing') {
      if (!['picked-up', 'processing'].includes(status)) return false;
    } else if (statusFilter === 'ready') {
      if (status !== 'ready') return false;
    } else if (statusFilter === 'delivered') {
      if (status !== 'delivered') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = order.order_number?.toLowerCase().includes(q);
      const matchCustName = order.customer_name?.toLowerCase().includes(q);
      const matchPhone = order.customer_phone?.toLowerCase().includes(q);
      const matchService = order.service_type?.toLowerCase().includes(q);
      const matchAddress = order.pickup_address?.toLowerCase().includes(q);
      return matchOrderNum || matchCustName || matchPhone || matchService || matchAddress;
    }

    return true;
  });

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3" /> Delivered
          </span>
        );
      case 'processing':
      case 'in-care':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> In Atelier Wash
          </span>
        );
      case 'picked-up':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" /> Collected
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Ready for Dispatch
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed Pickup
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 pt-24 pb-20 selection:bg-slate-900 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Garment Care Artisan Portal
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Artisan Care Schedule & Workspace
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Welcome back, <strong className="text-slate-900 font-semibold">{user?.name}</strong>. Monitor customer hampers, progress garment washing, and track settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Duty Active & Available
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              title="Refresh Schedule"
              className="p-2.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2.5 rounded-full border border-stone-200 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
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
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="font-medium text-xs sm:text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-8">
          
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-stone-500">Assigned Hampers</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{totalAssigned}</p>
            <p className="text-[11px] text-stone-500 mt-1">₹{totalEarningsEstimated} cumulative hamper value</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-stone-500">In Atelier Care</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{inCareCount}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Being collected or cleaned</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-stone-500">Delivered Fresh</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">{deliveredCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Returned to clientele</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-stone-500">Artisan Trust</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Star className="w-4 h-4 fill-purple-600 text-purple-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">4.9</p>
              <span className="text-stone-400 text-xs font-semibold">/ 5.0</span>
            </div>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Master artisan rating</p>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl text-slate-900">Assigned Garment Loads</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-200/80 font-bold text-stone-700">
              {filteredOrders.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # or customer..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white shadow-soft"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-px mb-8 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'confirmation', label: 'Awaiting Action' },
            { id: 'processing', label: 'In Atelier Treatment' },
            { id: 'ready', label: 'Ready for Dispatch' },
            { id: 'delivered', label: 'Delivered' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-soft font-bold'
                  : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Synchronizing Assigned Laundry Hampers...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-soft my-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-slate-900">No Orders in this filter</h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
              No garments currently require action in this category. New customer hampers assigned by platform administration will automatically appear here.
            </p>
            <button
              onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-semibold px-4 py-2 rounded-full transition"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {filteredOrders.map((order) => {
              const orderId = order.id || order._id || '';
              const status = order.status?.toLowerCase() || 'pending';
              const serviceInfo = SERVICE_RATES[order.service_type] || {
                label: order.service_type,
                rate: 0,
                unit: '',
                desc: ''
              };
              const nextAction = getNextStatusAction(status);
              const isUpdating = updatingOrderId === orderId;

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Top: Order Number & Status Badge */}
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

                    {/* Customer Details Pill */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                          Clientele
                        </span>
                        <p className="font-bold text-slate-900 text-sm">
                          {order.customer_name || 'Valued Customer'}
                        </p>
                      </div>
                      {order.customer_phone && (
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-slate-900 font-mono text-xs font-semibold shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{order.customer_phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Quantity & Order Value */}
                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">Garments / Items</span>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-stone-500" />
                          {order.total_items || 0} pieces
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-400 block mb-0.5 font-medium">Order Value</span>
                        <p className="font-serif text-base font-bold text-slate-900">
                          ₹{order.total_amount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Timestamps & Addresses */}
                    <div className="space-y-2 text-xs text-stone-600">
                      {order.pickup_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            Pickup Slot: <strong>{new Date(order.pickup_date).toLocaleString()}</strong>
                          </span>
                        </div>
                      )}
                      {order.pickup_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.pickup_address}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs font-medium">
                          <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">
                            Special Garment Notice:
                          </span>
                          "{order.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Workflow Control */}
                  <div className="pt-5 border-t border-stone-100 mt-5 space-y-3">
                    
                    {/* Primary Workflow Progress Button */}
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      
                      {status === 'confirmed' && (
                        <button
                          onClick={() => handleConfirmOrder(orderId)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Assignment</span>
                        </button>
                      )}

                      {nextAction && status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(orderId, nextAction.nextStatus)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-soft transition"
                        >
                          <nextAction.icon className="w-3.5 h-3.5 text-amber-300" />
                          <span>{nextAction.label}</span>
                          <ArrowRight className="w-3 h-3 text-stone-400" />
                        </button>
                      )}

                      {/* Manual Status Override Selector */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusUpdate(orderId, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="picked-up">Picked Up</option>
                          <option value="processing">Processing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    {/* Bottom Ticket Link */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-xs font-bold text-stone-700 hover:text-slate-950 inline-flex items-center gap-1 transition"
                      >
                        <span>View Inspection Ticket</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {order.created_at && (
                        <span className="text-[11px] text-stone-400">
                          Assigned: {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dhobi Payment & Financial Ledger Section */}
        <div className="mt-14">
          <DhobiPaymentSection />
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: Inspection Ticket Details */}
      {/* ---------------------------------------------------- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-floating w-full max-w-md overflow-hidden border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Artisan Inspection</span>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Hamper #{selectedOrderDetails.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition"
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
                  <span className="text-stone-400 block mb-0.5">Garment Load</span>
                  <p className="font-bold text-slate-900">{selectedOrderDetails.total_items || 0} pieces</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50">
                  <span className="text-stone-400 block mb-0.5">Order Total</span>
                  <p className="font-bold text-slate-900 font-serif text-base">₹{selectedOrderDetails.total_amount || 0}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 space-y-1">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Customer Contact</span>
                <p className="font-bold text-slate-900">{selectedOrderDetails.customer_name || 'Customer'}</p>
                {selectedOrderDetails.customer_phone && (
                  <a
                    href={`tel:${selectedOrderDetails.customer_phone}`}
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-mono font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrderDetails.customer_phone}</span>
                  </a>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Pickup Location</span>
                <p className="text-stone-700 font-medium">{selectedOrderDetails.pickup_address || 'Address on file'}</p>
              </div>

              {selectedOrderDetails.delivery_address && (
                <div className="space-y-1 pt-1">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Delivery Location</span>
                  <p className="text-stone-700 font-medium">{selectedOrderDetails.delivery_address}</p>
                </div>
              )}

              {selectedOrderDetails.notes && (
                <div className="space-y-1 pt-1">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block">Garment & Stain Notes</span>
                  <p className="text-stone-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 font-medium">
                    "{selectedOrderDetails.notes}"
                  </p>
                </div>
              )}

              {/* Status Update from modal */}
              <div className="pt-2">
                <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Set Current Status
                </span>
                <div className="flex gap-2">
                  <select
                    value={selectedOrderDetails.status}
                    onChange={(e) => handleStatusUpdate(selectedOrderDetails.id || selectedOrderDetails._id || '', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="picked-up">Picked Up</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

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
