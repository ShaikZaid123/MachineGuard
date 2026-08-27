import { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Bell, Trash2 } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import type { Page } from '@/components/Sidebar';

export function AlertsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { alerts, acknowledgeAlert, clearAlerts } = useStore();
  const [filter, setFilter] = useState<'all' | 'unack'>('all');

  const shown = filter === 'unack' ? alerts.filter((a) => !a.acknowledged) : alerts;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Auto-generated when a machine crosses into Warning or Critical state.
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'unack'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === f
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'text-slate-400 border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {f === 'all' ? 'All' : 'Unacknowledged'}
            </button>
          ))}
          <button
            onClick={clearAlerts}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-400 hover:bg-slate-800/40 hover:text-red-300 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <Card>
        {shown.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-400/60 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No alerts to show. All systems nominal.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {shown.map((a) => (
              <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    a.severity === 'Critical'
                      ? 'bg-red-500/15 text-red-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {a.severity === 'Critical' ? (
                    <ShieldAlert className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={a.severity} size="sm" />
                    <span className="text-xs text-slate-500">
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                    {a.acknowledged && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Acknowledged
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-200 leading-relaxed">{a.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('machines')}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    View
                  </button>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <Bell className="h-3 w-3" /> Ack
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
