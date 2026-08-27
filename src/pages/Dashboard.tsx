import { useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Gauge as GaugeIcon,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import type { Page } from '@/components/Sidebar';

export function Dashboard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { machines, alerts, acknowledgeAlert } = useStore();

  const counts = useMemo(() => {
    return machines.reduce(
      (acc, m) => {
        acc[m.status]++;
        return acc;
      },
      { Healthy: 0, Warning: 0, Critical: 0 } as Record<string, number>
    );
  }, [machines]);

  const avgHealth = Math.round(
    machines.reduce((s, m) => s + m.healthScore, 0) / machines.length
  );

  const recentAlerts = alerts.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time machine health overview across the plant floor.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Machines"
          value={machines.length}
          icon={<Cpu className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          label="Healthy"
          value={counts.Healthy}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Warning"
          value={counts.Warning}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Critical"
          value={counts.Critical}
          icon={<ShieldAlert className="h-4 w-4" />}
          accent="red"
        />
        <StatCard
          label="Avg Health"
          value={`${avgHealth}%`}
          icon={<GaugeIcon className="h-4 w-4" />}
          accent={avgHealth >= 70 ? 'emerald' : avgHealth >= 45 ? 'amber' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Machine Fleet Status"
            subtitle="Current health of all monitored machines"
            icon={<Activity className="h-4.5 w-4.5" />}
          />
          <div className="divide-y divide-slate-700/40">
            {machines.map((m) => (
              <button
                key={m.id}
                onClick={() => onNavigate('machines')}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/40 text-slate-300 shrink-0">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {m.healthScore}%
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent Alerts"
            subtitle={`${alerts.length} total`}
            icon={<AlertTriangle className="h-4.5 w-4.5" />}
          />
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-700/40">
            {recentAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No alerts. All machines nominal.
              </div>
            ) : (
              recentAlerts.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={a.severity} size="sm" />
                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(a.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{a.message}</p>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
