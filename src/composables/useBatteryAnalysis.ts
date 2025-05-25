import { ref, onMounted } from 'vue';
import type { BatteryDataPoint, DeviceAnalysis, SchoolBatteryReport } from '@/types/battery';
import { fetchBatteryData } from '../services/batteryService';

export function useBatteryAnalysis() {
  const reports = ref<SchoolBatteryReport[]>([]);
  const allEntries = ref<BatteryDataPoint[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchBatteryData();
      allEntries.value = data;
      reports.value = analyzeBatteryData(data);
    } catch (err) {
      error.value = 'Failed to load battery data';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  if (typeof window !== 'undefined') {
    onMounted(loadData);
  }

  return {
    reports,
    allEntries,
    loading,
    error,
    loadData
  };
}

// So here i Choose to go with Intervals weighted by duration (usage per hour extrapolated to daily average)

function analyzeBatteryData(data: BatteryDataPoint[]): SchoolBatteryReport[] {
  const groupedByDevice = new Map<string, BatteryDataPoint[]>();
  const DRAIN_THRESHOLD = parseFloat(import.meta.env.VITE_DRAIN_THRESHOLD);

  data.forEach((point) => {
    if (!groupedByDevice.has(point.serialNumber)) {
      groupedByDevice.set(point.serialNumber, []);
    }
    groupedByDevice.get(point.serialNumber)!.push(point);
  });

  const schoolMap = new Map<string, DeviceAnalysis[]>();

  for (const [serialNumber, points] of groupedByDevice.entries()) {
    const sorted = [...points].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let totalUsage = 0;
    let totalHours = 0;
    const schoolSet = new Set(points.map((p) => p.school));
    const school = schoolSet.size === 1 ? [...schoolSet][0] : 'Unknown';

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      const prevTime = new Date(prev.timestamp).getTime();
      const currTime = new Date(curr.timestamp).getTime();

      const hours = (currTime - prevTime) / (1000 * 60 * 60);

      // Here I am calculating the power difference and only considering positive drains
      // (i.e., when the battery level decreases)
      const powerDiff = prev.powerLevel - curr.powerLevel;

      if (powerDiff > 0 && hours > 0) {
        totalUsage += powerDiff;
        totalHours += hours;
      }
    }

    let avgDailyDrain: number | undefined = undefined;
    if (totalHours > 0) {
      const avgPerHour = totalUsage / totalHours;
      avgDailyDrain = avgPerHour * 24;
    }

    // so here I am defining the status based on the average daily drain, more than 30% is considered unhealthy

    const status: 'Healthy' | 'Replace' | 'Unknown' =
      avgDailyDrain === undefined
        ? 'Unknown'
        : avgDailyDrain > DRAIN_THRESHOLD
          ? 'Replace'
          : 'Healthy';

    const device: DeviceAnalysis = {
      serialNumber,
      avgDailyDrain,
      status,
      school,
      needsReplacement: status === 'Replace'
    };

    if (!schoolMap.has(school)) {
      schoolMap.set(school, []);
    }
    schoolMap.get(school)!.push(device);
  }

  const reports: SchoolBatteryReport[] = [];

  for (const [school, devices] of schoolMap.entries()) {
    const unhealthyCount = devices.filter((d) => d.status === 'Replace').length;
    reports.push({
      school,
      devices,
      unhealthyCount
    });
  }

  reports.sort((a, b) => b.unhealthyCount - a.unhealthyCount);
  return reports;
}
