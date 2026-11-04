import { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Check,
  Zap,
  Clock,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface DhobiWithDistance {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service_area: string;
  rating: number;
  availability_status: string;
  distance_km: number;
  is_current: boolean;
  is_declined: boolean;
}

interface AssignDhobiModalProps {
  order: any;
  onClose: () => void;
  onAssigned: (msg: string) => void;
}

export default function AssignDhobiModal({ order, onClose, onAssigned }: AssignDhobiModalProps) {
  const [dhobis, setDhobis] = useState<DhobiWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDhobiId, setSelectedDhobiId] = useState<string>('');

  const orderId = order._id || order.id;

  useEffect(() => {
    fetchDhobisWithDistance();
  }, [orderId]);

  const fetchDhobisWithDistance = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/orders/admin/${orderId}/dhobis-with-distance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list: DhobiWithDistance[] = res.data.data?.dhobis || [];
      setDhobis(list);

      // Auto-select the closest non-declined partner if available
      const availableClosest = list.find(d => !d.is_declined && d.availability_status !== 'offline');
      if (availableClosest) {
        setSelectedDhobiId(availableClosest.id);
      }
    } catch (err: any) {
      console.error('Failed to fetch dhobi distances:', err);
      setError('Unable to calculate shortest distances for Dhobi partners.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (autoNearest = false) => {
    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');

      const payload = autoNearest ? { auto_nearest: true } : { dhobi_id: selectedDhobiId };
      const res = await axios.put(`${API_URL}/orders/admin/${orderId}/assign-dhobi`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onAssigned(res.data.message || 'Dhobi partner assigned successfully. 5-minute timer started.');
      onClose();
    } catch (err: any) {
      console.error('Failed to assign dhobi:', err);
      setError(err.response?.data?.message || 'Failed to dispatch order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-stone-200 animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
              Shortest Distance Dispatch
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Assign Partner to #{order.order_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Order Location Context */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>Customer Pickup Address</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">{order.pickup_address || 'Address on record'}</p>
            <p className="text-[11px] text-stone-500">
              Customer: <strong>{order.customer_name || 'Customer'}</strong> • Service: <strong>{order.service_type}</strong>
            </p>
          </div>

          {/* 5-Minute Timer Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>5-Minute Acceptance Rule:</strong> Once assigned, the selected Dhobi has 5 minutes to confirm acceptance. If not accepted in 5 minutes or if cancelled by the Dhobi, the order automatically re-assigns to the next closest partner.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Auto-Assign Nearest Button */}
          <button
            onClick={() => handleAssign(true)}
            disabled={submitting || loading || dhobis.length === 0}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>⚡ Auto-Assign Nearest Partner (Shortest Distance)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-stone-400 text-[10px] uppercase font-bold tracking-wider">
              Or Choose from Sorted Distance List
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Dhobi List Sorted by Distance */}
          {loading ? (
            <div className="py-8 text-center text-stone-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-800" />
              <p>Calculating shortest distances to nearby Dhobis...</p>
            </div>
          ) : dhobis.length === 0 ? (
            <p className="text-center py-6 text-stone-500">No active Dhobi partners currently in database.</p>
          ) : (
            <div className="space-y-2.5">
              {dhobis.map((d, index) => {
                const isSelected = selectedDhobiId === d.id;
                const isClosest = index === 0 && !d.is_declined;

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      if (!d.is_declined) setSelectedDhobiId(d.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      d.is_declined
                        ? 'opacity-50 bg-stone-100 border-stone-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{d.name}</span>
                        {isClosest && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                            Shortest Distance
                          </span>
                        )}
                        {d.is_declined && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-200 text-rose-800">
                            Previously Declined/Shifted
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        Zone: <strong>{d.service_area}</strong> • Phone: {d.phone || 'N/A'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <strong className={isSelected ? 'text-white' : 'text-stone-700'}>{d.rating || 4.8}</strong>
                        </span>
                        <span className={`capitalize ${d.availability_status === 'available' ? 'text-emerald-500' : 'text-stone-400'}`}>
                          ● {d.availability_status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right pl-3 shrink-0">
                      <div className={`font-mono font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {d.distance_km} km
                      </div>
                      <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        from pickup
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAssign(false)}
            disabled={submitting || !selectedDhobiId}
            className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-soft transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Start 5-Min Timer</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

