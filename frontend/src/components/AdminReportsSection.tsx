import { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Package,
  DollarSign,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface ReportOrder {
  _id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string;
  delivery_address: string;
  service_type: string;
  total_items: number;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  dhobi_name: string;
  dhobi_phone: string;
  assignment_status: string;
  reassignment_count: number;
  reassignment_reasons: string;
  latest_reassignment_notes: string;
}

interface ReportSummary {
  total_matched_orders: number;
  total_amount: number;
  total_items: number;
  total_reassignments: number;
  total_timeouts: number;
  total_dhobi_cancels: number;
}

export default function AdminReportsSection() {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    total_matched_orders: 0,
    total_amount: 0,
    total_items: 0,
    total_reassignments: 0,
    total_timeouts: 0,
    total_dhobi_cancels: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'last7' | 'last30' | 'custom'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [reassignedOnly, setReassignedOnly] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [datePreset, statusFilter, serviceFilter, paymentFilter, reassignedOnly]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      params.append('date_preset', datePreset);
      if (datePreset === 'custom') {
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
      }
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (serviceFilter !== 'all') params.append('service_type', serviceFilter);
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (reassignedOnly) params.append('reassigned_only', 'true');

      const res = await axios.get(`${API_URL}/orders/admin/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data.data || []);
      setSummary(res.data.summary || {
        total_matched_orders: 0,
        total_amount: 0,
        total_items: 0,
        total_reassignments: 0,
        total_timeouts: 0,
        total_dhobi_cancels: 0
      });
    } catch (err: any) {
      console.error('Failed to compile report:', err);
      setError('Unable to load reports. Please check your query parameters.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Trigger browser download for text/csv or text/json files
  const triggerBrowserDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Download Master Orders CSV Report
  const downloadOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date Created',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Pickup Address',
      'Delivery Address',
      'Service Type',
      'Garment Items',
      'Total Amount (INR)',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Assigned Dhobi Partner',
      'Dhobi Phone',
      'Assignment Status',
      'Reassignment Handoffs Count',
      'Reassignment Triggers',
      'Latest Shift Notes'
    ];

    const escapeCSV = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map(o => [
      escapeCSV(o.order_number),
      escapeCSV(new Date(o.created_at).toLocaleString()),
      escapeCSV(o.customer_name),
      escapeCSV(o.customer_phone),
      escapeCSV(o.customer_email),
      escapeCSV(o.pickup_address),
      escapeCSV(o.delivery_address),
      escapeCSV(o.service_type),
      escapeCSV(o.total_items),
      escapeCSV(o.total_amount),
      escapeCSV(o.status),
      escapeCSV(o.payment_status),
      escapeCSV(o.payment_method),
      escapeCSV(o.dhobi_name),
      escapeCSV(o.dhobi_phone),
      escapeCSV(o.assignment_status),
      escapeCSV(o.reassignment_count),
      escapeCSV(o.reassignment_reasons),
      escapeCSV(o.latest_reassignment_notes)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBrowserDownload(csvContent, `dhobi-orders-report-${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  // 2. Download Reassignments & 5-Min Timeouts CSV Log
  const downloadReassignmentsCSV = () => {
    const headers = [
      'Order Number',
      'Date Created',
      'Customer Name',
      'Customer Pickup Address',
      'Current Assigned Partner',
      'Order Status',
      'Handoff Count',
      'Trigger Reasons',
      'Reassignment Details'
    ];

    const escapeCSV = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const reassignedOrders = orders.filter(o => o.reassignment_count > 0);

    const rows = reassignedOrders.map(o => [
      escapeCSV(o.order_number),
      escapeCSV(new Date(o.created_at).toLocaleString()),
      escapeCSV(o.customer_name),
      escapeCSV(o.pickup_address),
      escapeCSV(o.dhobi_name),
      escapeCSV(o.status),
      escapeCSV(o.reassignment_count),
      escapeCSV(o.reassignment_reasons),
      escapeCSV(o.latest_reassignment_notes)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBrowserDownload(csvContent, `dhobi-reassignments-and-timeouts-log-${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  // 3. Download Financial / Turnover CSV Ledger
  const downloadFinancialCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Service',
      'Garments',
      'Order Amount (INR)',
      'Payment Status',
      'Payment Method',
      'Partner Settled'
    ];

    const escapeCSV = (str: any) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map(o => [
      escapeCSV(o.order_number),
      escapeCSV(new Date(o.created_at).toLocaleDateString()),
      escapeCSV(o.customer_name),
      escapeCSV(o.service_type),
      escapeCSV(o.total_items),
      escapeCSV(o.total_amount),
      escapeCSV(o.payment_status),
      escapeCSV(o.payment_method),
      escapeCSV(o.dhobi_name)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBrowserDownload(csvContent, `dhobi-financial-ledger-${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  // 4. Download Full JSON Backup
  const downloadJSONBackup = () => {
    const payload = {
      export_timestamp: new Date().toISOString(),
      summary,
      total_orders: orders.length,
      orders
    };
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBrowserDownload(JSON.stringify(payload, null, 2), `dhobi-full-export-${dateStr}.json`, 'application/json');
  };

  // 5. Print / Save as PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      return (
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q) ||
        o.pickup_address?.toLowerCase().includes(q) ||
        o.dhobi_name?.toLowerCase().includes(q) ||
        o.service_type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Printable Report Header (Visible when printing) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-serif font-bold text-slate-950">Dhobi Laundry Service - Executive Report</h1>
        <p className="text-sm text-stone-600 mt-1">
          Generated on: {new Date().toLocaleString()} • Filter Period: {datePreset.toUpperCase()}
        </p>
        <div className="grid grid-cols-4 gap-4 mt-4 p-4 border border-stone-300 rounded-lg text-xs">
          <div>Total Orders: <strong>{summary.total_matched_orders}</strong></div>
          <div>Total Items: <strong>{summary.total_items}</strong></div>
          <div>Gross Revenue: <strong>₹{summary.total_amount}</strong></div>
          <div>Reassignments: <strong>{summary.total_reassignments}</strong></div>
        </div>
      </div>

      {/* Screen Report Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Executive Intelligence & Export Hub
          </div>
          <h2 className="font-serif text-2xl text-slate-900">
            Comprehensive Operational Reports & Data Downloads
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Query and download tailored reports for orders, financial turnovers, 5-minute timeout shifts, and partner handoffs.
          </p>
        </div>

        {/* Action Download Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={downloadOrdersCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-soft transition disabled:opacity-50"
            title="Download Master Orders CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Orders CSV</span>
          </button>

          <button
            onClick={downloadReassignmentsCSV}
            disabled={summary.total_reassignments === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-soft transition disabled:opacity-50"
            title="Download Shift & Timeout Log CSV"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Handoffs Log CSV</span>
          </button>

          <button
            onClick={downloadFinancialCSV}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition disabled:opacity-50"
            title="Download Financial Ledger CSV"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financial CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold shadow-soft transition"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={downloadJSONBackup}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium transition"
            title="Download JSON Export"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs print:hidden">
          {error}
        </div>
      )}

      {/* Interactive Filters Panel */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4 print:hidden">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <Filter className="w-4 h-4 text-stone-500" />
          <h3 className="font-serif text-lg font-bold text-slate-900">Custom Report Query Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Date Presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Time Horizon</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="all">All Historical Time</option>
              <option value="today">Today Only</option>
              <option value="last7">Past 7 Days</option>
              <option value="last30">Past 30 Days</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked-up">Picked Up</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Service Type</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="all">All Services</option>
              <option value="wash">Daily Wash & Fold</option>
              <option value="dry-clean">Artisan Dry Cleaning</option>
              <option value="iron">Executive Steam Press</option>
              <option value="wash-iron">Wash, Steam & Hanger</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-slate-900 focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid & Settled</option>
              <option value="pending">Pending Settlement</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Reassigned Filter Checkbox */}
          <div className="flex flex-col justify-end pb-1">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={reassignedOnly}
                onChange={(e) => setReassignedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-stone-300"
              />
              <span>Only Shifted / Reassigned</span>
            </label>
          </div>

        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>
            <button
              onClick={fetchReportData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Apply Dates
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Report Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Matched Orders</span>
          <p className="font-serif text-2xl font-bold text-slate-900 mt-0.5">{summary.total_matched_orders}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Garments</span>
          <p className="font-serif text-2xl font-bold text-slate-900 mt-0.5">{summary.total_items}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Gross Value</span>
          <p className="font-serif text-2xl font-bold text-emerald-700 mt-0.5">₹{summary.total_amount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Shifts</span>
          <p className="font-serif text-2xl font-bold text-purple-700 mt-0.5">{summary.total_reassignments}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">5-Min Timeouts</span>
          <p className="font-serif text-2xl font-bold text-amber-900 mt-0.5">{summary.total_timeouts}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/40 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">Dhobi Cancels</span>
          <p className="font-serif text-2xl font-bold text-rose-900 mt-0.5">{summary.total_dhobi_cancels}</p>
        </div>
      </div>

      {/* Interactive Reports Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-soft overflow-hidden">
        
        {/* Table Search & Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-slate-900">Compiled Report Data</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 font-bold text-stone-700">
              {filteredOrders.length} records
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter table rows..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-800" />
            <p className="text-xs font-semibold">Compiling filtered operational records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-500">
            <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-bold text-sm">No orders matching your criteria.</p>
            <p className="text-xs text-stone-400 mt-1">Try resetting the filters or choosing another time horizon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Hamper / Date</th>
                  <th className="py-3.5 px-4">Clientele</th>
                  <th className="py-3.5 px-4">Service & Garments</th>
                  <th className="py-3.5 px-4">Amount & Payment</th>
                  <th className="py-3.5 px-4">Partner</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reassignment Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-50/70 transition">
                    
                    {/* Order # & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">#{ord.order_number}</div>
                      <div className="text-[10px] text-stone-400">{new Date(ord.created_at).toLocaleDateString()}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      {ord.customer_phone && (
                        <div className="text-[10px] text-stone-500 font-mono">{ord.customer_phone}</div>
                      )}
                      <div className="text-[10px] text-stone-400 truncate max-w-[160px]">{ord.pickup_address}</div>
                    </td>

                    {/* Service & Items */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 capitalize">{ord.service_type}</div>
                      <div className="text-[10px] text-stone-500">{ord.total_items} items</div>
                    </td>

                    {/* Amount & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-slate-900">₹{ord.total_amount}</div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                        ord.payment_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {ord.payment_status}
                      </span>
                    </td>

                    {/* Partner */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{ord.dhobi_name || 'Unassigned'}</div>
                      {ord.assignment_status === 'pending_acceptance' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Pending 5-Min Accept
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 capitalize">
                        {ord.status}
                      </span>
                    </td>

                    {/* Reassignment Audit */}
                    <td className="py-3.5 px-4">
                      {ord.reassignment_count > 0 ? (
                        <div>
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                            <RotateCcw className="w-2.5 h-2.5" />
                            {ord.reassignment_count}x Shifted
                          </span>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            {ord.reassignment_reasons}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Direct fulfillment</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

