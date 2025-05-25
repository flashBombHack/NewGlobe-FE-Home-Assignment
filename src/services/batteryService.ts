import rawBatteryData from '@/data/battery.json';
import type { BatteryDataPoint } from '@/types/battery';

export async function fetchBatteryData(): Promise<BatteryDataPoint[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Convert object with numeric keys to array
      const normalizedData = Object.values(rawBatteryData).map((data: any) => ({
        ...data,
        powerLevel: data.batteryLevel,
        school: (data.academyId ?? '').toString()
      }));

      resolve(normalizedData as BatteryDataPoint[]);
    }, 300);
  });
}
