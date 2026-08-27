import type { MachineStatus, MachineType, PredictionResult, SensorReading } from './types';

// Thresholds per machine type. Tuned for an explainable rule-based engine.
// Each entry defines nominal, warning, and critical limits for every parameter.
interface ThresholdSet {
  temperature: { warn: number; crit: number };
  vibration: { warn: number; crit: number };
  pressure: { warn: number; crit: number };
  motorCurrent: { warn: number; crit: number };
  rpm: { nominal: number; warnDev: number; critDev: number };
}

const THRESHOLDS: Record<MachineType, ThresholdSet> = {
  'CNC Machine': {
    temperature: { warn: 65, crit: 80 },
    vibration: { warn: 4.5, crit: 7.5 },
    pressure: { warn: 6, crit: 7.5 },
    motorCurrent: { warn: 14, crit: 18 },
    rpm: { nominal: 8000, warnDev: 600, critDev: 1200 },
  },
  'Industrial Motor': {
    temperature: { warn: 70, crit: 90 },
    vibration: { warn: 3.5, crit: 6 },
    pressure: { warn: 4, crit: 5.5 },
    motorCurrent: { warn: 22, crit: 28 },
    rpm: { nominal: 1750, warnDev: 150, critDev: 300 },
  },
  'Water Pump': {
    temperature: { warn: 60, crit: 75 },
    vibration: { warn: 5, crit: 8 },
    pressure: { warn: 3, crit: 2 }, // low pressure = problem
    motorCurrent: { warn: 10, crit: 13 },
    rpm: { nominal: 3500, warnDev: 250, critDev: 500 },
  },
  'Compressor': {
    temperature: { warn: 75, crit: 95 },
    vibration: { warn: 4, crit: 6.5 },
    pressure: { warn: 9, crit: 11 },
    motorCurrent: { warn: 16, crit: 21 },
    rpm: { nominal: 2950, warnDev: 200, critDev: 400 },
  },
};

// Fault-type rules. Each rule fires when its predicate matches and contributes
// to the status, fault label, and recommended action.
interface FaultRule {
  id: string;
  faultType: string;
  action: string;
  severity: MachineStatus;
  test: (s: SensorReading, t: ThresholdSet) => boolean;
  describe: (s: SensorReading, t: ThresholdSet) => string;
}

const FAULT_RULES: FaultRule[] = [
  {
    id: 'bearing-degradation',
    faultType: 'Bearing degradation',
    action: 'Inspect and lubricate bearings; schedule vibration analysis within 48h.',
    severity: 'Warning',
    test: (s, t) => s.vibration > t.vibration.warn && s.temperature > t.temperature.warn,
    describe: (s, t) =>
      `Vibration ${s.vibration.toFixed(1)} mm/s and temperature ${s.temperature.toFixed(0)} °C both exceed warning thresholds (${t.vibration.warn} / ${t.temperature.warn}).`,
  },
  {
    id: 'bearing-critical',
    faultType: 'Bearing failure imminent',
    action: 'Stop machine immediately and replace bearings before restart.',
    severity: 'Critical',
    test: (s, t) => s.vibration > t.vibration.crit && s.temperature > t.temperature.crit,
    describe: (s, t) =>
      `Vibration ${s.vibration.toFixed(1)} mm/s and temperature ${s.temperature.toFixed(0)} °C both exceed critical thresholds (${t.vibration.crit} / ${t.temperature.crit}).`,
  },
  {
    id: 'overheating',
    faultType: 'Overheating',
    action: 'Check cooling system, coolant level, and ventilation; reduce load.',
    severity: 'Warning',
    test: (s, t) => s.temperature > t.temperature.warn && s.vibration <= t.vibration.warn,
    describe: (s, t) =>
      `Temperature ${s.temperature.toFixed(0)} °C exceeds warning threshold (${t.temperature.warn} °C) without elevated vibration.`,
  },
  {
    id: 'overheating-critical',
    faultType: 'Thermal runaway risk',
    action: 'Shut down immediately; inspect cooling and thermal sensors before restart.',
    severity: 'Critical',
    test: (s, t) => s.temperature > t.temperature.crit && s.vibration <= t.vibration.crit,
    describe: (s, t) =>
      `Temperature ${s.temperature.toFixed(0)} °C exceeds critical threshold (${t.temperature.crit} °C).`,
  },
  {
    id: 'overload',
    faultType: 'Motor overload',
    action: 'Reduce load and inspect motor windings; check for mechanical binding.',
    severity: 'Warning',
    test: (s, t) => s.motorCurrent > t.motorCurrent.warn,
    describe: (s, t) =>
      `Motor current ${s.motorCurrent.toFixed(1)} A exceeds warning threshold (${t.motorCurrent.warn} A).`,
  },
  {
    id: 'overload-critical',
    faultType: 'Severe motor overload',
    action: 'Stop machine; inspect motor and drive for damage before restarting.',
    severity: 'Critical',
    test: (s, t) => s.motorCurrent > t.motorCurrent.crit,
    describe: (s, t) =>
      `Motor current ${s.motorCurrent.toFixed(1)} A exceeds critical threshold (${t.motorCurrent.crit} A).`,
  },
  {
    id: 'pressure-high',
    faultType: 'Excessive pressure',
    action: 'Inspect valves and pressure relief system; check for blockages.',
    severity: 'Warning',
    test: (s, t) => s.pressure > t.pressure.warn,
    describe: (s, t) =>
      `Pressure ${s.pressure.toFixed(1)} bar exceeds warning threshold (${t.pressure.warn} bar).`,
  },
  {
    id: 'pressure-critical',
    faultType: 'Pressure vessel risk',
    action: 'Shut down immediately; inspect pressure relief and seals.',
    severity: 'Critical',
    test: (s, t) => s.pressure > t.pressure.crit,
    describe: (s, t) =>
      `Pressure ${s.pressure.toFixed(1)} bar exceeds critical threshold (${t.pressure.crit} bar).`,
  },
  {
    id: 'rpm-deviation',
    faultType: 'Speed instability',
    action: 'Inspect drive belt/coupling and speed controller; check for slip.',
    severity: 'Warning',
    test: (s, t) => Math.abs(s.rpm - t.rpm.nominal) > t.rpm.warnDev,
    describe: (s, t) =>
      `RPM ${s.rpm.toFixed(0)} deviates ${Math.abs(s.rpm - t.rpm.nominal).toFixed(0)} from nominal ${t.rpm.nominal}.`,
  },
  {
    id: 'rpm-critical',
    faultType: 'Speed control failure',
    action: 'Stop machine; inspect drive and controller before restart.',
    severity: 'Critical',
    test: (s, t) => Math.abs(s.rpm - t.rpm.nominal) > t.rpm.critDev,
    describe: (s, t) =>
      `RPM ${s.rpm.toFixed(0)} deviates critically from nominal ${t.rpm.nominal}.`,
  },
];

function severityRank(s: MachineStatus): number {
  return s === 'Critical' ? 3 : s === 'Warning' ? 2 : 1;
}

export function predict(
  type: MachineType,
  sensors: SensorReading
): PredictionResult {
  const t = THRESHOLDS[type];
  const fired = FAULT_RULES.filter((r) => r.test(sensors, t));

  let status: MachineStatus = 'Healthy';
  let faultType: string | null = null;
  let recommendedAction: string | null = null;
  const reasons: string[] = [];

  for (const rule of fired) {
    reasons.push(rule.describe(sensors, t));
    if (severityRank(rule.severity) > severityRank(status)) {
      status = rule.severity;
      faultType = rule.faultType;
      recommendedAction = rule.action;
    }
  }

  // Health score: start at 100, deduct per fired rule weighted by severity.
  let healthScore = 100;
  for (const rule of fired) {
    healthScore -= rule.severity === 'Critical' ? 35 : rule.severity === 'Warning' ? 18 : 5;
  }
  healthScore = Math.max(5, healthScore);

  // Failure probability: derived from health score with a non-linear curve.
  const failureProbability = Math.round((100 - healthScore) * 0.95);

  return {
    status,
    healthScore,
    failureProbability: Math.min(98, failureProbability),
    faultType: status === 'Healthy' ? null : faultType,
    recommendedAction: status === 'Healthy' ? null : recommendedAction,
    reasons,
  };
}

export { THRESHOLDS, FAULT_RULES };
