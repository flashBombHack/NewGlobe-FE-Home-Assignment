<template>
  <div
    class="flex justify-between items-center px-3 py-2 rounded-md bg-white/5 backdrop-blur-sm text-sm text-white hover:bg-white/10 transition"
  >
    <div class="flex items-center gap-2">
      <Monitor class="w-4 h-4 text-white/60" />
      <div>
        <span class="font-mono">{{ device.serialNumber }}</span>
        <p v-if="device.avgDailyDrain !== undefined" class="text-xs text-white/40">
          Drain: {{ device.avgDailyDrain.toFixed(2) }}%/day
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <component :is="status.icon" :class="status.badgeClass + ' w-4 h-4'" />
        <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', status.badgeClass]">
          {{ status.label }}
        </span>
      </div>

      <button
        ref="statsBtnRef"
        @click="handleStatsClick"
        aria-label="View battery usage stats"
        title="View battery usage stats"
        class="relative p-1 rounded-md bg-white/10 hover:bg-white/30 transition cursor-pointer group"
      >
        <BarChart2 class="w-5 h-5 text-white/70 group-hover:text-white transition" />

        <span
          class="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 text-xs text-white px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
        >
          View Stats
        </span>

        <span
          class="absolute inset-0 rounded-md bg-white/30 opacity-0 animate-pulse-slow group-hover:opacity-100 pointer-events-none"
        ></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Monitor, AlertCircle, CheckCircle, HelpCircle, BarChart2 } from 'lucide-vue-next';

interface BatteryEntry {
  serialNumber: string;
  timestamp: string;
  batteryLevel: number;
}

type DeviceStatus = 'Replace' | 'Healthy' | 'Unknown' | string;

interface Device {
  serialNumber: string;
  status: DeviceStatus;
  avgDailyDrain?: number;
}

const props = defineProps<{
  device: Device;
  allEntries: BatteryEntry[];
  onShowStats: (
    serial: string,
    position: { top: number; left: number },
    usageData: { date: string; batteryLevel: number }[]
  ) => void;
}>();

const statsBtnRef = ref<HTMLElement | null>(null);

const status = computed(() => {
  switch (props.device.status) {
    case 'Replace':
      return {
        icon: AlertCircle,
        badgeClass: 'bg-red-400/20 text-red-300',
        label: 'Replace'
      };
    case 'Healthy':
      return {
        icon: CheckCircle,
        badgeClass: 'bg-green-400/20 text-green-300',
        label: 'Healthy'
      };
    case 'Unknown':
      return {
        icon: HelpCircle,
        badgeClass: 'bg-yellow-300/20 text-yellow-200',
        label: 'Unknown'
      };
    default:
      return {
        icon: null,
        badgeClass: 'bg-white/10 text-white',
        label: 'N/A'
      };
  }
});

const handleStatsClick = () => {
  if (statsBtnRef.value) {
    const rect = statsBtnRef.value.getBoundingClientRect();
    const usageData = props.allEntries
      .filter((entry) => entry.serialNumber === props.device.serialNumber)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((entry) => ({
        date: entry.timestamp,
        batteryLevel: entry.batteryLevel
      }));

    props.onShowStats(
      props.device.serialNumber,
      {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX
      },
      usageData
    );
  }
};
</script>
