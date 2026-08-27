export type MachineType =
  | 'CNC Machine'
  | 'Industrial Motor'
  | 'Water Pump'
  | 'Compressor';

export type MachineStatus = 'Healthy' | 'Warning' | 'Critical';

export interface SensorReading {
  temperature: number; // °C
  vibration: number; // mm/s
  pressure: number; // bar
  motorCurrent: number; // A
  rpm: number; // rev/min
  operatingHours: number; // total hours
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  sensors: SensorReading;
  lastMaintenance: string; // ISO date
  healthScore: number; // 0-100
  failureProbability: number; // 0-100
  faultType: string | null;
  recommendedAction: string | null;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  date: string;
  faultFound: string;
  actionTaken: string;
  technicianNotes: string;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: MachineStatus;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HistoricalReading {
  timestamp: string;
  temperature: number;
  vibration: number;
  pressure: number;
  motorCurrent: number;
  rpm: number;
}

export interface PredictionResult {
  status: MachineStatus;
  healthScore: number;
  failureProbability: number;
  faultType: string | null;
  recommendedAction: string | null;
  reasons: string[];
}
