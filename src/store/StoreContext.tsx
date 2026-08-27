import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Alert,
  HistoricalReading,
  Machine,
  MachineStatus,
  MaintenanceRecord,
} from '@/services/types';
import { predict } from '@/services/predictionEngine';
import {
  SEED_MACHINES,
  SEED_MAINTENANCE,
  generateHistory,
} from '@/services/seedData';
import {
  simulateSensors,
  defaultProgressFor,
} from '@/services/simulationEngine';

interface SimulationState {
  active: boolean;
  machineId: string | null;
  progress: number; // 0..1
  speed: number; // multiplier
}

interface Store {
  machines: Machine[];
  alerts: Alert[];
  maintenance: MaintenanceRecord[];
  simulation: SimulationState;
  history: Record<string, HistoricalReading[]>;
  setSimulation: (s: Partial<SimulationState>) => void;
  startSimulation: (machineId: string) => void;
  stopSimulation: () => void;
  resetSimulation: (machineId: string) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const StoreContext = createContext<Store | null>(null);

function recompute(machine: Machine): Machine {
  const p = predict(machine.type, machine.sensors);
  return { ...machine, ...p };
}

let alertId = 0;
function makeAlert(m: Machine): Alert | null {
  if (m.status === 'Healthy') return null;
  const severity = m.status;
  const msg = `${severity.toUpperCase()}: ${m.name} — ${
    m.faultType ?? 'parameters out of range'
  }. ${m.recommendedAction ?? ''}`.trim();
  return {
    id: `alert-${alertId++}`,
    machineId: m.id,
    machineName: m.name,
    severity,
    message: msg,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<Machine[]>(() =>
    SEED_MACHINES.map(recompute)
  );
  const [maintenance] = useState<MaintenanceRecord[]>(SEED_MAINTENANCE);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [simulation, setSimulationState] = useState<SimulationState>({
    active: false,
    machineId: null,
    progress: 0,
    speed: 1,
  });
  const [history, setHistory] = useState<Record<string, HistoricalReading[]>>(
    () => {
      const h: Record<string, HistoricalReading[]> = {};
      for (const m of SEED_MACHINES) h[m.id] = generateHistory(m);
      return h;
    }
  );

  // Track which machines we've already alerted for in the current status,
  // so we don't spam duplicate alerts every tick.
  const alertedRef = useRef<Record<string, MachineStatus>>({});

  const setSimulation = (s: Partial<SimulationState>) =>
    setSimulationState((prev) => ({ ...prev, ...s }));

  const startSimulation = (machineId: string) => {
    const m = SEED_MACHINES.find((x) => x.id === machineId);
    const startProgress = m ? defaultProgressFor(m.type) : 0.1;
    setSimulationState({
      active: true,
      machineId,
      progress: startProgress,
      speed: 1,
    });
  };

  const stopSimulation = () =>
    setSimulationState((prev) => ({ ...prev, active: false }));

  const resetSimulation = (machineId: string) => {
    setSimulationState((prev) => ({
      ...prev,
      machineId,
      progress: 0,
      active: false,
    }));
  };

  // Simulation loop. Advances progress for the selected machine and updates
  // its sensors + prediction. When progress reaches 1, it holds at critical.
  useEffect(() => {
    if (!simulation.active || !simulation.machineId) return;
    const interval = setInterval(() => {
      setSimulationState((prev) => {
        if (!prev.active || !prev.machineId) return prev;
        const next = Math.min(1, prev.progress + 0.01 * prev.speed);
        return { ...prev, progress: next };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [simulation.active, simulation.machineId]);

  // Apply simulation progress to the target machine's sensors.
  useEffect(() => {
    const machineId = simulation.machineId;
    if (!machineId) return;
    const seed = SEED_MACHINES.find((m) => m.id === machineId);
    if (!seed) return;
    const sensors = simulateSensors(
      seed.type,
      simulation.progress,
      seed.sensors.operatingHours
    );
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId ? recompute({ ...m, sensors }) : m
      )
    );
    // Append a history point.
    setHistory((prev) => {
      const arr = prev[machineId] ?? [];
      const point: HistoricalReading = {
        timestamp: new Date().toISOString(),
        temperature: sensors.temperature,
        vibration: sensors.vibration,
        pressure: sensors.pressure,
        motorCurrent: sensors.motorCurrent,
        rpm: sensors.rpm,
      };
      return { ...prev, [machineId]: [...arr.slice(-59), point] };
    });
  }, [simulation.progress, simulation.machineId]);

  // Generate alerts when a machine transitions into Warning/Critical.
  useEffect(() => {
    setMachines((prev) => {
      const newAlerts: Alert[] = [];
      const next = prev.map((m) => {
        const prevStatus = alertedRef.current[m.id];
        if (m.status !== prevStatus) {
          if (m.status !== 'Healthy') {
            const a = makeAlert(m);
            if (a) newAlerts.push(a);
          }
          alertedRef.current[m.id] = m.status;
        }
        return m;
      });
      if (newAlerts.length) {
        setAlerts((a) => [...newAlerts, ...a].slice(0, 50));
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines.map((m) => m.status).join('|')]);

  const acknowledgeAlert = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );

  const clearAlerts = () => setAlerts([]);

  const value = useMemo<Store>(
    () => ({
      machines,
      alerts,
      maintenance,
      simulation,
      history,
      setSimulation,
      startSimulation,
      stopSimulation,
      resetSimulation,
      acknowledgeAlert,
      clearAlerts,
    }),
    [machines, alerts, maintenance, simulation, history]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
