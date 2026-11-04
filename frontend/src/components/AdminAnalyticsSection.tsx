import { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  AlertTriangle,
  Zap,
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalDhobis: number;
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    paidRevenue: number;
    pendingPaymentRevenue: number;
    totalReassignments: number;
    timeoutShiftsCount: number;
    dhobiCancellationsCount: number;
    adminManualCount: number;
    avgAcceptanceTimeMinutes: number;
    avgReassignmentDistanceKm: number;
    timeoutRatePct: number;
  };
  statusCounts: Record<string, number>;
  serviceCounts: Record<string, number>;
  dhobiPerformance: Array<{
    dhobi_id: string;
    name: string;
    email: string;
    phone?: string;
    service_area: string;
    rating: number;
    availability: string;
    current_assigned: number;
    delivered_count: number;
    timeout_count: number;
    cancelled_count: number;
    reliability_pct: number;
  }>;
  recentReassignments: Array<{
    order_id: string;
    order_number: string;
    customer_name: string;
    from_dhobi: string;
    to_dhobi: string;
    reason: string;
    distance_km: number;
    notes: string;
    timestamp: string;
  }>;
}

export default function AdminAnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reassignFilter, setReassignFilter] = useState<'all' | 'timeout_5min' | 'dhobi_cancelled'>('all');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh analytics every 20 seconds for real-time visibility
    const interval = setInterval(fetchAnalytics, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/orders/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError('Unable to fetch real-time analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">
          Aggregating Real-Time Operational Analytics...
        </p>
      </div>
    );
  }

  const s = data?.summary || {
    totalUsers: 0,
    totalDhobis: 0,
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingPaymentRevenue: 0,
    totalReassignments: 0,
    timeoutShiftsCount: 0,
    dhobiCancellationsCount: 0,
    adminManualCount: 0,
    avgAcceptanceTimeMinutes: 2.1,
    avgReassignmentDistanceKm: 2.8,
    timeoutRatePct: 0
  };

  const filteredLogs = (data?.recentReassignments || []).filter(item => {
    if (reassignFilter !== 'all' && item.reason !== reassignFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase().trim();
      return (
        item.order_number?.toLowerCase().includes(q) ||
        item.customer_name?.toLowerCase().includes(q) ||
        item.from_dhobi?.toLowerCase().includes(q) ||
        item.to_dhobi?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Engine Synchronized (Every 20s)
          </div>
          <h2 className="font-serif text-2xl text-slate-900">
            Real-Time Operations & Auto-Handoff Analytics
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Real-time tracking of 5-minute timeout shifts, Dhobi cancellations, shortest-distance routings, and fleet reliability.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-soft transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Total Hampers</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-slate-900">{s.totalOrders}</p>
          <p className="text-[11px] text-stone-500 mt-1">
            <strong>{s.activeOrders}</strong> active • <strong>{s.deliveredOrders}</strong> delivered
          </p>
        </div>

        {/* 5-Min Timeouts Auto-Shifted */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">5-Min Auto-Shifts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-900">{s.timeoutShiftsCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {s.timeoutRatePct}% timeout rate across fleet
          </p>
        </div>

        {/* Dhobi Cancellations Reassigned */}
        <div className="bg-white p-5 rounded-3xl border border-rose-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">Partner Cancellations</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-rose-900">{s.dhobiCancellationsCount}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            Reassigned to nearest partner
          </p>
        </div>

        {/* Shortest Distance Efficiency */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Avg Handoff Gap</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="font-serif text-3xl font-bold text-slate-900">{s.avgReassignmentDistanceKm}</p>
            <span className="text-xs text-stone-500 font-bold">km</span>
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">
            Shortest distance routing accuracy
          </p>
        </div>

      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Gross Revenue</span>
            <p className="font-serif text-lg font-bold text-slate-900">₹{s.totalRevenue}</p>
            <span className="text-[10px] text-emerald-600">₹{s.paidRevenue} settled • ₹{s.pendingPaymentRevenue} pending</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Avg Partner Acceptance Time</span>
            <p className="font-serif text-lg font-bold text-slate-900">{s.avgAcceptanceTimeMinutes} mins</p>
            <span className="text-[10px] text-stone-500">From dispatch to acceptance</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Shift Events</span>
            <p className="font-serif text-lg font-bold text-slate-900">{s.totalReassignments}</p>
            <span className="text-[10px] text-amber-700">Combined automatic and manual shifts</span>
          </div>
        </div>
      </div>

      {/* Real-Time Live Feed of Order Auto-Shifts & Reassignments */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Live Reassignment & Auto-Shift Audit Feed
              </h3>
            </div>
            <p className="text-stone-500 text-xs mt-0.5">
              Instant log of all 5-minute timeout transfers and Dhobi partner cancellations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setReassignFilter('all')}
              className={`px-3 py-1.5 rounded-full transition ${
                reassignFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Events ({data?.recentReassignments?.length || 0})
            </button>
            <button
              onClick={() => setReassignFilter('timeout_5min')}
              className={`px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                reassignFilter === 'timeout_5min'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>5-Min Timeouts</span>
            </button>
            <button
              onClick={() => setReassignFilter('dhobi_cancelled')}
              className={`px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                reassignFilter === 'dhobi_cancelled'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Dhobi Cancellations</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search feed by order #, customer, partner, or reason..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Live Event Cards */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-stone-400 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-stone-600">No shift events matching this filter.</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Orders are currently being fulfilled by assigned partners.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredLogs.map((log, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-stone-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">#{log.order_number}</span>
                    <span className="text-stone-400">•</span>
                    <span className="font-medium text-stone-700">{log.customer_name}</span>
                    {log.reason === 'timeout_5min' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" /> 5-Min Timeout Exceeded
                      </span>
                    ) : log.reason === 'dhobi_cancelled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Partner Cancelled & Shifted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700">
                        Admin Dispatch
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-600 flex items-center gap-2">
                    <span className="line-through text-stone-400">{log.from_dhobi}</span>
                    <span className="text-stone-400">➔</span>
                    <span className="font-bold text-emerald-700">{log.to_dhobi}</span>
                    {log.distance_km != null && (
                      <span className="font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                        {log.distance_km} km away
                      </span>
                    )}
                  </div>

                  {log.notes && (
                    <p className="text-[10px] text-stone-500 italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-stone-400 font-mono block">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dhobi Fleet Reliability & Performance Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-soft space-y-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Dhobi Fleet Reliability & Performance Matrix
          </h3>
          <p className="text-stone-500 text-xs mt-0.5">
            Evaluates acceptance rates, 5-minute timeout frequency, and handoff reliability per partner.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Zone / Area</th>
                <th className="py-3 px-4">Currently Assigned</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">5-Min Timeouts</th>
                <th className="py-3 px-4">Cancellations</th>
                <th className="py-3 px-4 text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(data?.dhobiPerformance || []).map((dhobi) => {
                const rel = dhobi.reliability_pct || 100;
                return (
                  <tr key={dhobi.dhobi_id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{dhobi.name}</div>
                      <div className="text-[10px] text-stone-400">{dhobi.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      {dhobi.service_area}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {dhobi.current_assigned}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {dhobi.delivered_count}
                    </td>
                    <td className="py-3.5 px-4">
                      {dhobi.timeout_count > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {dhobi.timeout_count}
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {dhobi.cancelled_count > 0 ? (
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {dhobi.cancelled_count}
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          rel >= 90
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : rel >= 70
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {rel}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

