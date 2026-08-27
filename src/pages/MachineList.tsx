import { useMemo, useState } from 'react';
import { Cpu, Search, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import type { Machine, MachineStatus } from '@/services/types';

export function MachineList({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const { machines } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | MachineStatus>('all');

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (query && !m.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [machines, query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Machines</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor sensor readings and health status across all equipment.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search machines..."
            className="w-full bg-slate-800/40 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Healthy', 'Warning', 'Critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                filter === f
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'text-slate-400 border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid (mobile + tablet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:hidden">
        {filtered.map((m) => (
          <MachineCard key={m.id} machine={m} onSelect={onSelect} />
        ))}
      </div>

      {/* Table (desktop) */}
      <Card className="hidden lg:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-700/50">
                <th className="px-5 py-3 font-medium">Machine</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Temp °C</th>
                <th className="px-3 py-3 font-medium text-right">Vib mm/s</th>
                <th className="px-3 py-3 font-medium text-right">Press bar</th>
                <th className="px-3 py-3 font-medium text-right">Current A</th>
                <th className="px-3 py-3 font-medium text-right">RPM</th>
                <th className="px-3 py-3 font-medium text-right">Hours</th>
                <th className="px-3 py-3 font-medium">Last Maint.</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className="cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-200">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.type}</div>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={m.status} size="sm" /></td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.temperature.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.vibration.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.pressure.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.motorCurrent.toFixed(1)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.rpm.toFixed(0)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-300">{m.sensors.operatingHours.toFixed(0)}</td>
                  <td className="px-3 py-3 text-slate-400">{m.lastMaintenance}</td>
                  <td className="px-3 py-3 text-right">
                    <ArrowRight className="h-4 w-4 text-slate-500 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">No machines match.</div>
        )}
      </Card>

      {filtered.length === 0 && (
        <div className="lg:hidden text-center text-sm text-slate-500 py-8">No machines match.</div>
      )}
    </div>
  );
}

function MachineCard({
  machine,
  onSelect,
}: {
  machine: Machine;
  onSelect: (id: string) => void;
}) {
  const s = machine.sensors;
  return (
    <Card
      className="p-4 cursor-pointer hover:border-slate-600 transition-colors"
      // @ts-expect-error onClick on a styled div
      onClick={() => onSelect(machine.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/40 text-slate-300">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{machine.name}</div>
            <div className="text-xs text-slate-500">{machine.type}</div>
          </div>
        </div>
        <StatusBadge status={machine.status} size="sm" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Temp" value={`${s.temperature.toFixed(0)}°C`} />
        <Metric label="Vibration" value={`${s.vibration.toFixed(1)}`} />
        <Metric label="Pressure" value={`${s.pressure.toFixed(1)}b`} />
        <Metric label="Current" value={`${s.motorCurrent.toFixed(1)}A`} />
        <Metric label="RPM" value={`${s.rpm.toFixed(0)}`} />
        <Metric label="Hours" value={`${s.operatingHours.toFixed(0)}`} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/40 rounded-lg px-2.5 py-2">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-200 font-medium tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
