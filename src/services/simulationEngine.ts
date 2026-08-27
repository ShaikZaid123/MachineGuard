import type { MachineType, SensorReading } from './types';

// Simulation engine: produces a smooth progression of sensor readings from
// Healthy -> Warning -> Critical for a given machine type, driven by a single
// progress value t in [0, 1]. t=0 is nominal/healthy, t=1 is critical.

interface SimProfile {
  temperature: [number, number, number]; // nominal, warn, crit
  vibration: [number, number, number];
  pressure: [number, number, number];
  motorCurrent: [number, number, number];
  rpm: [number, number, number];
  operatingHours: number;
}

const PROFILES: Record<MachineType, SimProfile> = {
  'CNC Machine': {
    temperature: [50, 66, 82],
    vibration: [2.5, 5, 8.5],
    pressure: [4.5, 6.2, 7.8],
    motorCurrent: [10, 14.5, 19],
    rpm: [8000, 7400, 6700],
    operatingHours: 8420,
  },
  'Industrial Motor': {
    temperature: [55, 72, 92],
    vibration: [2, 4, 6.5],
    pressure: [3.2, 4.3, 5.8],
    motorCurrent: [18, 23, 29],
    rpm: [1750, 1620, 1480],
    operatingHours: 12600,
  },
  'Water Pump': {
    temperature: [45, 62, 78],
    vibration: [2.5, 5.5, 9],
    pressure: [4, 2.8, 1.6],
    motorCurrent: [8, 10.5, 13.5],
    rpm: [3500, 3300, 3050],
    operatingHours: 5600,
  },
  'Compressor': {
    temperature: [60, 78, 98],
    vibration: [2, 4.5, 7],
    pressure: [7.5, 9.5, 11.5],
    motorCurrent: [13, 17, 22],
    rpm: [2950, 2800, 2620],
    operatingHours: 9800,
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Three-segment interpolation: nominal -> warn at t=0.5, warn -> crit at t=1.
function seg(nominal: number, warn: number, crit: number, t: number): number {
  if (t <= 0.5) return lerp(nominal, warn, t / 0.5);
  return lerp(warn, crit, (t - 0.5) / 0.5);
}

export function simulateSensors(
  type: MachineType,
  progress: number,
  operatingHours: number
): SensorReading {
  const p = PROFILES[type];
  const t = Math.max(0, Math.min(1, progress));
  return {
    temperature: seg(...p.temperature, t),
    vibration: seg(...p.vibration, t),
    pressure: seg(...p.pressure, t),
    motorCurrent: seg(...p.motorCurrent, t),
    rpm: seg(...p.rpm, t),
    operatingHours: operatingHours + t * 20,
  };
}

export function defaultProgressFor(type: MachineType): number {
  // Start each machine at a slightly elevated baseline so the demo isn't all-green.
  const baselines: Record<MachineType, number> = {
    'CNC Machine': 0.1,
    'Industrial Motor': 0.35,
    'Water Pump': 0.45,
    'Compressor': 0.55,
  };
  return baselines[type];
}
