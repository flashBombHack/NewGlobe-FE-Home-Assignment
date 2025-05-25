<template>
  <div
    class="relative group bg-glassWhite border border-white/10 rounded-xl backdrop-blur-glass transition-all overflow-hidden"
  >
    <div :class="['absolute top-0 left-0 w-full h-1', isHealthy ? 'bg-green-400' : 'bg-red-500']" />

    <div class="p-4 space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-base md:text-lg font-semibold text-white">
            {{ schoolReport.school }}
          </h2>
          <p class="text-xs text-glassWhite/60 mt-1 flex items-center gap-1">
            <component
              :is="isHealthy ? CheckCircle : BatteryWarning"
              class="w-3.5 h-3.5"
              :class="isHealthy ? 'text-green-400' : 'text-red-400'"
            />
            <span v-if="isHealthy">All devices healthy</span>
            <span v-else
              >{{ unhealthyDevices.length }} device{{
                unhealthyDevices.length !== 1 ? 's' : ''
              }}
              need replacement</span
            >
          </p>
        </div>

        <span class="text-xs font-medium mt-1">
          Priority:
          <span class="px-2 py-0.5 rounded-full ml-1" :class="priorityLevel.color">{{
            priorityLevel.label
          }}</span>
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm text-white/80">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-blue-400" />
          <span>Total: {{ totalDevices }}</span>
        </div>
        <div class="flex items-center gap-2">
          <BatteryFull class="w-4 h-4 text-green-400" />
          <span>Healthy: {{ healthyDevices }}</span>
        </div>
        <div class="flex items-center gap-2">
          <BatteryLow class="w-4 h-4 text-red-400" />
          <span>Unhealthy: {{ unhealthyDevices.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <TrendingDown class="w-4 h-4 text-yellow-400" />
          <span>Avg Drain: {{ avgDrain }}%/day</span>
        </div>
      </div>

      <!-- Uncomment the following block to enable sparkline chart on the card -->
      <!-- i just added this feature for future uses if ever needed -->

      <!-- <div v-if="sparklineData.length > 0" class="mt-2 h-24 px-1">
        <Line :data="chartData" :options="chartOptions" />
      </div> -->

      <button
        @click="onOpenModal(schoolReport)"
        class="flex items-center gap-2 mt-2 text-sm px-4 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
      >
        <Eye class="w-4 h-4" />
        View Devices
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SchoolBatteryReport, BatteryEntry } from '@/types/battery';
import type { ChartOptions } from 'chart.js';
import {
  BatteryWarning,
  CheckCircle,
  BatteryFull,
  BatteryLow,
  Users,
  TrendingDown,
  Eye
} from 'lucide-vue-next';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const props = defineProps<{
  schoolReport: SchoolBatteryReport;
  allEntries: BatteryEntry[];
  onOpenModal: (schoolReport: SchoolBatteryReport) => void;
}>();

const totalDevices = computed(() => props.schoolReport.devices.length);
const unhealthyDevices = computed(() =>
  props.schoolReport.devices.filter((d) => d.status === 'Replace')
);
const healthyDevices = computed(() => totalDevices.value - unhealthyDevices.value.length);
const isHealthy = computed(() => unhealthyDevices.value.length === 0);

const priorityLevel = computed(() => {
  const ratio = unhealthyDevices.value.length / totalDevices.value;
  if (ratio > 0.5) return { label: 'High', color: 'bg-red-500 text-red-100' };
  if (ratio > 0.2) return { label: 'Medium', color: 'bg-yellow-400 text-yellow-900' };
  return { label: 'Low', color: 'bg-green-500 text-green-100' };
});

const avgDrain = computed(() => {
  const totalDrain = props.schoolReport.devices.reduce((sum, d) => sum + (d.avgDailyDrain || 0), 0);
  return (totalDrain / totalDevices.value).toFixed(2);
});

const sparklineData = computed(() =>
  props.schoolReport.devices.map((device) => parseFloat(device.avgDailyDrain?.toFixed(2) || '0'))
);

// Chart.js-compatible for the Line chart
const chartData = computed(() => ({
  labels: sparklineData.value.map((_, i) => `#${i + 1}`),
  datasets: [
    {
      data: sparklineData.value,
      borderColor: '#4ade80',
      backgroundColor: 'rgba(74, 222, 128, 0.2)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointRadius: 0
    }
  ]
}));

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        callback: (tickValue: string | number) => {
          const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
          return `${value.toFixed(0)}%`;
        },
        color: '#999',
        font: {
          size: 10
        }
      }
    },
    x: {
      display: false
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => `Drain: ${context.parsed.y.toFixed(2)}%`
      },
      backgroundColor: '#1f1f1f',
      titleColor: '#fff',
      bodyColor: '#4ade80',
      padding: 8,
      cornerRadius: 6
    },
    legend: {
      display: false
    }
  }
};
</script>
