import { useMemo } from 'react';
import {
  ArrowLeft,
  Cpu,
  Thermometer,
  Activity,
  Gauge as GaugeIcon,
  Zap,
  RotateCw,
  Clock,
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Heart,
  TrendingDown,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import { Card, CardHeader, Gauge } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { SensorChart } from '@/components/SensorChart';
import { AIAssistant } from '@/components/AIAssistant';
import type { MachineStatus } from '@/services/types';

export function MachineDetails({
  machineId,
  onBack,
}: {
  machineId: string;
  onBack: () => void;
}) {
  const {
    machines,
    maintenance,
    simulation,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulation,
    history,
  } = useStore();

  const machine = machines.find((m) => m.id === machineId);
  const records = maintenance.filter((r) => r.machineId === machineId);
  const machineHistory = history[machineId] ?? [];

  const isSimulating = simulation.active && simulation.machineId === machineId;

  const progressLabel = useMemo(() => {
    const p = simulation.machineId === machineId ? simulation.progress : 0;
    if (p < 0.25) return 'Nominal';
    if (p < 0.5) return 'Elevated';
    if (p < 0.75) return 'Warning';
    return 'Critical';
  }, [simulation, machineId]);

  if (!machine) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Machine not found.</p>
        <button onClick={onBack} className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm">
          Back to machines
        </button>
      </div>
    );
  }

  const s = machine.sensors;
  const healthColor =
    machine.healthScore >= 70 ? 'emerald' : machine.healthScore >= 45 ? 'amber' : 'red';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Machines
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/40 text-slate-200">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{machine.name}</h1>
            <p className="text-sm text-slate-400">{machine.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={machine.status} />
          <div className="text-right">
            <div className="text-xs text-slate-500">Last Maintenance</div>
            <div className="text-sm text-slate-300">{machine.lastMaintenance}</div>
          </div>
        </div>
      </div>

      {/* Simulation control panel */}
      <Card>
        <CardHeader
          title="Simulation Mode"
          subtitle="Drive this machine from Healthy to Critical and watch predictions update live"
          icon={<Play className="h-4.5 w-4.5" />}
          action={
            <div className="flex items-center gap-2">
              {!isSimulating ? (
                <button
                  onClick={() => startSimulation(machineId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Start
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
              )}
              <button
                onClick={() => resetSimulation(machineId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/40 text-slate-300 border border-slate-600/40 hover:bg-slate-700/60 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          }
        />
        <div className="px-5 py-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">Degradation Progress</span>
              <span className="text-sm font-semibold text-slate-100">
                {Math.round((simulation.machineId === machineId ? simulation.progress : 0) * 100)}% · {progressLabel}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-slate-700/60 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-300"
                style={{
                  width: `${(simulation.machineId === machineId ? simulation.progress : 0) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 shrink-0">Speed</span>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={simulation.machineId === machineId ? simulation.speed : 1}
              onChange={(e) =>
                setSimulation({ machineId, speed: parseFloat(e.target.value) })
              }
              className="flex-1 accent-cyan-400"
            />
            <span className="text-xs text-slate-300 tabular-nums w-8">
              {simulation.machineId === machineId ? simulation.speed : 1}x
            </span>
          </div>
        </div>
      </Card>

      {/* Health summary + fault info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-medium text-slate-300">Health Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-100 tabular-nums">
              {machine.healthScore}
            </span>
            <span className="text-lg text-slate-500 mb-1">/100</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-700/60 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                healthColor === 'emerald'
                  ? 'from-emerald-500 to-teal-500'
                  : healthColor === 'amber'
                  ? 'from-amber-500 to-orange-500'
                  : 'from-red-500 to-rose-600'
              } transition-all duration-500`}
              style={{ width: `${machine.healthScore}%` }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-300">Failure Probability</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-100 tabular-nums">
              {machine.failureProbability}
            </span>
            <span className="text-lg text-slate-500 mb-1">%</span>
          </div>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Estimated from the number and severity of triggered rules.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">Fault & Recommendation</span>
          </div>
          {machine.faultType ? (
            <>
              <div className="text-sm font-semibold text-slate-100">{machine.faultType}</div>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {machine.recommendedAction}
              </p>
            </>
          ) : (
            <div className="text-sm text-emerald-300">No faults detected. All parameters nominal.</div>
          )}
        </Card>
      </div>

      {/* Sensor gauges + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Current Sensors" icon={<Activity className="h-4.5 w-4.5" />} />
          <div className="px-5 py-5 space-y-4">
            <GaugeRow icon={Thermometer} label="Temperature" value={s.temperature} max={120} unit="°C" color={s.temperature > 80 ? 'red' : s.temperature > 60 ? 'amber' : 'cyan'} />
            <GaugeRow icon={Activity} label="Vibration" value={s.vibration} max={12} unit="mm/s" color={s.vibration > 7 ? 'red' : s.vibration > 4 ? 'amber' : 'cyan'} />
            <GaugeRow icon={GaugeIcon} label="Pressure" value={s.pressure} max={14} unit="bar" color={s.pressure > 10 ? 'red' : s.pressure > 8 ? 'amber' : 'cyan'} />
            <GaugeRow icon={Zap} label="Motor Current" value={s.motorCurrent} max={32} unit="A" color={s.motorCurrent > 20 ? 'red' : s.motorCurrent > 16 ? 'amber' : 'cyan'} />
            <GaugeRow icon={RotateCw} label="RPM" value={s.rpm} max={9000} unit="rpm" color="cyan" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" /> Operating Hours
              </div>
              <span className="text-sm font-semibold text-slate-200 tabular-nums">
                {s.operatingHours.toFixed(0)} h
              </span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Sensor History"
            subtitle="Last readings — updates live during simulation"
            icon={<RotateCw className="h-4.5 w-4.5" />}
          />
          <div className="px-3 py-4">
            <SensorChart data={machineHistory} />
          </div>
        </Card>
      </div>

      {/* AI Assistant + Maintenance history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[28rem]">
          <CardHeader
            title="AI Maintenance Assistant"
            subtitle="Ask about this machine's condition"
            icon={<Lightbulb className="h-4.5 w-4.5" />}
          />
          <AIAssistant machine={machine} />
        </Card>

        <Card>
          <CardHeader
            title="Maintenance History"
            subtitle={`${records.length} records`}
            icon={<Wrench className="h-4.5 w-4.5" />}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-700/50">
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Fault Found</th>
                  <th className="px-3 py-2.5 font-medium">Action Taken</th>
                  <th className="px-3 py-2.5 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {records.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-3 text-slate-200">{r.faultFound}</td>
                    <td className="px-3 py-3 text-slate-300">{r.actionTaken}</td>
                    <td className="px-3 py-3 text-slate-400 text-xs">{r.technicianNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Fix Gauge usage: the ui Gauge doesn't take an icon prop. Add a small wrapper.
function GaugeRow(props: { icon: typeof Thermometer } & Parameters<typeof Gauge>[0]) {
  return (
    <div className="flex items-center gap-3">
      <props.icon className="h-4 w-4 text-slate-500 shrink-0" />
      <div className="flex-1">
        <Gauge {...props} />
      </div>
    </div>
  );
}
