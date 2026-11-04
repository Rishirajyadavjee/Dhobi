import { X, Clock, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReassignmentEvent {
  from_dhobi_id?: any;
  to_dhobi_id?: any;
  reason?: string;
  distance_km?: number;
  notes?: string;
  timestamp?: string;
}

interface ReassignmentHistoryModalProps {
  order: any;
  onClose: () => void;
}

export default function ReassignmentHistoryModal({ order, onClose }: ReassignmentHistoryModalProps) {
  const history: ReassignmentEvent[] = order.reassignment_history || [];

  const getReasonBadge = (reason?: string) => {
    switch (reason) {
      case 'timeout_5min':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" /> 5-Min Timeout Auto-Shift
          </span>
        );
      case 'dhobi_cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Partner Cancellation
          </span>
        );
      case 'auto_dispatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <RotateCcw className="w-3 h-3 text-blue-600" /> Shortest Distance Auto-Dispatch
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
            Admin Assignment
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
              Audit & Handoff Trail
            </span>
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Reassignment Timeline #{order.order_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Current Active Partner</span>
              <p className="font-bold text-slate-900 text-sm">
                {order.dhobi_name || 'Unassigned / In Pool'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Handoff Count</span>
              <span className="font-bold text-slate-900 text-sm">{history.length} events</span>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-medium text-stone-600">No reassignments recorded.</p>
              <p className="text-[11px] text-stone-400 mt-1">This order was fulfilled by the initially assigned partner.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-stone-200 ml-3.5 space-y-6 my-4">
              {history.map((item, idx) => {
                const fromName = item.from_dhobi_id?.name || item.from_dhobi_id || 'Initial Pool';
                const toName = item.to_dhobi_id?.name || item.to_dhobi_id || 'Unassigned Pool';
                const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A';

                return (
                  <div key={idx} className="relative pl-6">
                    {/* Bullet dot */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center" />

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {getReasonBadge(item.reason)}
                        <span className="text-[10px] text-stone-400 font-mono">{timeStr}</span>
                      </div>

                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                        <span className="text-stone-500">{fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-emerald-700 font-bold">{toName}</span>
                        {item.distance_km != null && (
                          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                            {item.distance_km} km
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-stone-600 bg-white p-2 rounded-xl border border-stone-200/60 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Close Trail
          </button>
        </div>

      </div>
    </div>
  );
}

