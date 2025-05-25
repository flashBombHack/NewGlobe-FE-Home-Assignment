<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <!-- Search bar -->
      <div
        class="pt-10 mb-6 min-w-[40%] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by school ID..."
            v-model="searchTerm"
            class="pl-10 pr-4 py-2 w-full bg-glassWhite border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
          />
        </div>
      </div>

      <!-- Alert for critical devices -->
      <div
        v-if="totalCriticalDevices > 0 && showAlert"
        class="z-[40] max-w-md w-full bg-red-700/30 border border-red-600/50 text-red-100 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md flex justify-between items-center animate-pulse-fast"
        style="min-width: 320px"
      >
        <div class="flex items-center gap-3">
          <BatteryWarning class="w-6 h-6 text-red-400" />
          <p class="text-sm font-semibold leading-tight">
            <span class="font-bold">{{ totalCriticalDevices }}</span> device{{
              totalCriticalDevices !== 1 ? 's' : ''
            }}
            need urgent battery replacement!
          </p>
        </div>
        <button
          @click="showAlert = false"
          class="ml-6 text-lg font-bold hover:text-white transition bg-transparent rounded-full p-1 focus:outline-none"
          aria-label="Close alert"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Reopen alert -->
      <div v-else-if="totalCriticalDevices > 0" class="right-6 z-[40]">
        <button
          @click="showAlert = true"
          class="flex items-center gap-2 text-sm text-red-400 hover:text-white bg-red-700/20 border border-red-600/40 px-4 py-1 rounded-lg backdrop-blur-md shadow-md transition"
          aria-label="Show alert"
        >
          <BellRing class="w-5 h-5" />
          Show Alert
        </button>
      </div>
    </div>

    <!-- School cards -->
    <div class="flex flex-wrap gap-6">
      <div
        v-for="report in filteredReports"
        :key="report.school"
        class="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
      >
        <SchoolCard :schoolReport="report" :allEntries="allEntries" @openModal="handleOpenModal" />
      </div>
    </div>

    <!-- Stats Popover -->
    <div v-if="statsPopover" class="fixed inset-0 z-50" @click="closePopover">
      <div
        class="absolute bg-gray-900 rounded-xl p-6 shadow-lg w-80"
        :style="{
          top: `${statsPopover.position?.top}px`,
          left: `${statsPopover.position?.left}px`,
          transform: 'translate(-50%, 0)'
        }"
        @click.stop
      >
        <button
          @click="closePopover"
          class="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition bg-transparent text-white px-2"
          aria-label="Close stats popover"
        >
          ✕
        </button>
        <h3 class="text-lg font-semibold text-white mb-4">
          Battery Usage - {{ statsPopover.deviceSerial }}
        </h3>
        <div class="text-white text-center z-50">
          <Line :data="chartData" :options="chartOptions" class="h-52" />
        </div>
      </div>
    </div>

    <!-- Modal for devices in a school -->
    <div
      v-if="modalSchool"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center custom-scrollbar"
      @click="modalSchool = null"
    >
      <div
        class="bg-gray-900 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto shadow-xl relative"
        @click.stop
      >
        <button
          @click="modalSchool = null"
          class="absolute top-4 right-4 text-white hover:text-red-400 bg-transparent rounded-lg p-1 px-3 transition focus:outline-none"
        >
          ✕
        </button>
        <h2 class="text-xl font-bold text-white mb-4">Devices - {{ modalSchool.school }}</h2>

        <input
          type="text"
          placeholder="Search device..."
          v-model="searchDeviceTerm"
          class="w-full mb-4 px-3 py-2 bg-gray-800 text-white rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <div class="space-y-2">
          <DeviceRow
            v-for="device in filteredDevices"
            :key="device.serialNumber"
            :device="device"
            :allEntries="allEntries"
            @showStats="handleShowStats"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SchoolBatteryReport, BatteryEntry } from '@/types/battery';
import SchoolCard from '@/components/SchoolCard.vue';
import DeviceRow from '@/components/DeviceRow.vue';

import { BatteryWarning, BellRing, X, Search } from 'lucide-vue-next';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip as ChartTooltip,
  TimeScale
} from 'chart.js';
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, TimeScale, ChartTooltip);

interface Props {
  reports: SchoolBatteryReport[];
  allEntries: BatteryEntry[];
}
const { reports, allEntries } = defineProps<Props>();

const chartData = computed(() => ({
  labels: statsPopover.value?.usageData?.map((d) => d.date) || [],
  datasets: [
    {
      label: 'Battery Level',
      data: statsPopover.value?.usageData?.map((d) => d.batteryLevel * 100) || [],
      borderColor: '#4ade80',
      backgroundColor: 'rgba(74, 222, 128, 0.2)',
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
    x: {
      type: 'time',
      time: {
        unit: 'hour',
        tooltipFormat: 'dd MMM yyyy HH:mm'
      },
      ticks: {
        color: '#ccc',
        font: {
          size: 12
        }
      },
      grid: {
        display: false
      }
    },
    y: {
      min: 0,
      max: 100,
      ticks: {
        color: '#ccc',
        font: {
          size: 12
        },
        callback: (tickValue: string | number) => `${Number(tickValue)}%`
      },
      grid: {
        color: '#444',
        // @ts-expect-error - borderDash is valid in Chart.js but missing from TS types
        borderDash: [5, 5]
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#111',
      borderColor: '#333',
      borderWidth: 1,
      callbacks: {
        label: (context: any) => `Battery: ${context.parsed.y.toFixed(2)}%`
      }
    }
  }
};

const showAlert = ref(true);
const statsPopover = ref<{
  deviceSerial?: string;
  position?: { top: number; left: number };
  usageData?: { date: string; batteryLevel: number }[];
} | null>(null);
const modalSchool = ref<SchoolBatteryReport | null>(null);
const searchTerm = ref('');
const searchDeviceTerm = ref('');

const closePopover = () => {
  statsPopover.value = null;
};

const handleOpenModal = (schoolReport: SchoolBatteryReport) => {
  modalSchool.value = schoolReport;
};

const handleShowStats = (
  deviceSerial: string,
  position: { top: number; left: number },
  usageData?: { date: string; batteryLevel: number }[]
) => {
  const POPOVER_HEIGHT = 280;
  const VIEWPORT_HEIGHT = window.innerHeight;
  let clampedTop = position.top;
  if (position.top + POPOVER_HEIGHT > VIEWPORT_HEIGHT) {
    clampedTop = VIEWPORT_HEIGHT - POPOVER_HEIGHT - 20;
  }

  statsPopover.value = {
    deviceSerial,
    usageData,
    position: {
      top: clampedTop,
      left: position.left
    }
  };
};

watch(modalSchool, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

const totalCriticalDevices = computed(() =>
  reports.reduce(
    (acc, report: SchoolBatteryReport) =>
      acc + report.devices.filter((device: any) => device.status === 'Replace').length,
    0
  )
);

const filteredReports = computed(() =>
  reports.filter((report: SchoolBatteryReport) =>
    report.school.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const filteredDevices = computed(() =>
  modalSchool.value
    ? modalSchool.value.devices.filter((device) =>
        device.serialNumber.toLowerCase().includes(searchDeviceTerm.value.toLowerCase())
      )
    : []
);

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('default', {
    month: 'short'
  })} ${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};
</script>
