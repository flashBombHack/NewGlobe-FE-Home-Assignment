import { describe, it, expect, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { useBatteryAnalysis } from '@/composables/useBatteryAnalysis';

vi.mock('@/services/batteryService', () => ({
  fetchBatteryData: () =>
    Promise.resolve([
      // Healthy: 20% over 24 hours
      {
        school: '123',
        powerLevel: 0.8,
        teacher: 'T001',
        serialNumber: 'SN001',
        timestamp: '2023-01-01T00:00:00Z'
      },
      {
        school: '123',
        powerLevel: 0.6,
        teacher: 'T001',
        serialNumber: 'SN001',
        timestamp: '2023-01-02T00:00:00Z'
      },

      // Replace: 50% over 24 hours
      {
        school: '123',
        powerLevel: 0.9,
        teacher: 'T002',
        serialNumber: 'SN002',
        timestamp: '2023-01-01T00:00:00Z'
      },
      {
        school: '123',
        powerLevel: 0.4,
        teacher: 'T002',
        serialNumber: 'SN002',
        timestamp: '2023-01-02T00:00:00Z'
      },

      // Unknown: only 1 data point
      {
        school: '123',
        powerLevel: 0.7,
        teacher: 'T003',
        serialNumber: 'SN003',
        timestamp: '2023-01-01T00:00:00Z'
      }
    ])
}));

describe('useBatteryAnalysis', () => {
  it('classifies devices as Healthy, Replace, or Unknown', async () => {
    const { reports, allEntries, loading, error, loadData } = useBatteryAnalysis();

    await loadData();
    await flushPromises();

    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(allEntries.value.length).toBe(5);
    expect(reports.value.length).toBe(1);

    const schoolReport = reports.value[0];
    expect(schoolReport.school).toBe('123');
    expect(schoolReport.devices.length).toBe(3);
    expect(schoolReport.unhealthyCount).toBe(1);

    const healthyDevice = schoolReport.devices.find((d) => d.serialNumber === 'SN001');
    expect(healthyDevice).toBeDefined();
    expect(healthyDevice!.avgDailyDrain).toBeCloseTo(0.2, 5);
    expect(healthyDevice!.status).toBe('Healthy');

    const replaceDevice = schoolReport.devices.find((d) => d.serialNumber === 'SN002');
    expect(replaceDevice).toBeDefined();
    expect(replaceDevice!.avgDailyDrain).toBeCloseTo(0.5, 5);
    expect(replaceDevice!.status).toBe('Replace');

    const unknownDevice = schoolReport.devices.find((d) => d.serialNumber === 'SN003');
    expect(unknownDevice).toBeDefined();
    expect(unknownDevice!.avgDailyDrain).toBeUndefined();
    expect(unknownDevice!.status).toBe('Unknown');
  });
});
