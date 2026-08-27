import type {
  Machine,
  MaintenanceRecord,
  HistoricalReading,
  MachineType,
} from './types';
import { predict } from './predictionEngine';

function buildMachine(
  id: string,
  name: string,
  type: MachineType,
  sensors: Machine['sensors'],
  lastMaintenance: string
): Machine {
  const p = predict(type, sensors);
  return {
    id,
    name,
    type,
    sensors,
    lastMaintenance,
    status: p.status,
    healthScore: p.healthScore,
    failureProbability: p.failureProbability,
    faultType: p.faultType,
    recommendedAction: p.recommendedAction,
  };
}

export const SEED_MACHINES: Machine[] = [
  buildMachine(
    'cnc-01',
    'CNC Machine 01',
    'CNC Machine',
    {
      temperature: 58,
      vibration: 3.2,
      pressure: 5.0,
      motorCurrent: 11.5,
      rpm: 7950,
      operatingHours: 8420,
    },
    '2026-07-15'
  ),
  buildMachine(
    'motor-01',
    'Industrial Motor 01',
    'Industrial Motor',
    {
      temperature: 74,
      vibration: 4.1,
      pressure: 4.2,
      motorCurrent: 23.5,
      rpm: 1720,
      operatingHours: 12600,
    },
    '2026-06-02'
  ),
  buildMachine(
    'pump-01',
    'Water Pump 01',
    'Water Pump',
    {
      temperature: 62,
      vibration: 5.6,
      pressure: 2.4,
      motorCurrent: 10.8,
      rpm: 3380,
      operatingHours: 5600,
    },
    '2026-08-05'
  ),
  buildMachine(
    'comp-01',
    'Compressor 01',
    'Compressor',
    {
      temperature: 82,
      vibration: 5.2,
      pressure: 9.4,
      motorCurrent: 17.2,
      rpm: 2920,
      operatingHours: 9800,
    },
    '2026-05-20'
  ),
];

export const SEED_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'm1',
    machineId: 'cnc-01',
    date: '2026-07-15',
    faultFound: 'Worn spindle bearings',
    actionTaken: 'Replaced spindle bearings, recalibrated alignment',
    technicianNotes: 'Vibration reduced after replacement. Monitor for 30 days.',
  },
  {
    id: 'm2',
    machineId: 'cnc-01',
    date: '2026-04-02',
    faultFound: 'Coolant leak',
    actionTaken: 'Replaced coolant hose and clamp',
    technicianNotes: 'Routine. No further issues.',
  },
  {
    id: 'm3',
    machineId: 'motor-01',
    date: '2026-06-02',
    faultFound: 'Overheating under load',
    actionTaken: 'Cleaned cooling fins, replaced fan',
    technicianNotes: 'Temperature normalized. Bearing noise still slight.',
  },
  {
    id: 'm4',
    machineId: 'motor-01',
    date: '2026-02-18',
    faultFound: 'Vibration above threshold',
    actionTaken: 'Rebalanced rotor, tightened coupling',
    technicianNotes: 'Vibration within limits after service.',
  },
  {
    id: 'm5',
    machineId: 'pump-01',
    date: '2026-08-05',
    faultFound: 'Cavitation noise',
    actionTaken: 'Adjusted inlet valve, replaced impeller',
    technicianNotes: 'Pressure restored. Watch vibration trend.',
  },
  {
    id: 'm6',
    machineId: 'pump-01',
    date: '2026-05-10',
    faultFound: 'Seal wear',
    actionTaken: 'Replaced mechanical seal',
    technicianNotes: 'Minor weep resolved.',
  },
  {
    id: 'm7',
    machineId: 'comp-01',
    date: '2026-05-20',
    faultFound: 'High discharge pressure',
    actionTaken: 'Cleaned intercooler, serviced relief valve',
    technicianNotes: 'Pressure back to nominal. Recommend cooler inspection quarterly.',
  },
  {
    id: 'm8',
    machineId: 'comp-01',
    date: '2026-03-01',
    faultFound: 'Oil degradation',
    actionTaken: 'Changed compressor oil and filter',
    technicianNotes: 'Routine scheduled service.',
  },
];

// Generate a short synthetic history per machine ending at the seed reading.
export function generateHistory(
  machine: Machine,
  points = 24
): HistoricalReading[] {
  const history: HistoricalReading[] = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const ts = new Date(now - i * 30 * 60 * 1000).toISOString();
    // Blend a gentle drift toward the current reading with small noise.
    const f = (points - i) / points; // 0..1
    const noise = () => (Math.random() - 0.5) * 0.5;
    const base = (cur: number, lo: number) => lo + (cur - lo) * f + noise();
    history.push({
      timestamp: ts,
      temperature: Math.max(20, base(machine.sensors.temperature, 45)),
      vibration: Math.max(0.5, base(machine.sensors.vibration, 2)),
      pressure: Math.max(0.5, base(machine.sensors.pressure, machine.sensors.pressure * 0.85)),
      motorCurrent: Math.max(1, base(machine.sensors.motorCurrent, machine.sensors.motorCurrent * 0.85)),
      rpm: Math.round(base(machine.sensors.rpm, machine.sensors.rpm * 0.97)),
    });
  }
  return history;
}
