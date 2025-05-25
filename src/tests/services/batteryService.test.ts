import { describe, it, expect } from 'vitest';
import { fetchBatteryData } from '@/services/batteryService';
import rawBatteryData from '@/data/battery.json';

describe('fetchBatteryData', () => {
  it('transforms raw battery data correctly', async () => {
    const data = await fetchBatteryData();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    data.forEach((entry, i) => {
      const raw = rawBatteryData[i.toString() as keyof typeof rawBatteryData];
      if (typeof raw === 'object' && raw !== null && 'serialNumber' in raw) {
        expect(entry.serialNumber).toBe(raw.serialNumber);
      }
      if (typeof raw === 'object' && raw !== null && 'batteryLevel' in raw) {
        expect(entry.powerLevel).toBe(raw.batteryLevel);
      }
      if (typeof raw === 'object' && raw !== null && 'academyId' in raw) {
        expect(entry.school).toBe(String(raw.academyId));
      }
    });
  });
});
