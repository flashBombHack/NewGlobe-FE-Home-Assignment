export interface BatteryDataPoint {
  timestamp: string;
  powerLevel: number;
  employeeId: string;
  serialNumber: string;
  school: string;
}

export interface DeviceAnalysis {
  serialNumber: string;
  school: string;
  averageDailyUsage?: number;
  avgDailyDrain?: number;
  needsReplacement: boolean;
  status: DeviceStatus;
}

export interface SchoolBatteryReport {
  school: string;
  devices: DeviceAnalysis[];
  unhealthyCount: number;
}

export type BatteryEntry = {
  serialNumber: string;
  timestamp: string;
  batteryLevel: number;
};

export type DeviceStatus = 'Replace' | 'Healthy' | 'Unknown';
