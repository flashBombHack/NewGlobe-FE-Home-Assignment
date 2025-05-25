<template>
  <div
    class="min-h-screen min-w-fit bg-radial bg-darkBg font-sora p-6 text-white transition-colors duration-500"
  >
    <header
      class="flex justify-between items-center mb-8 px-6 py-4 rounded-xl bg-white/5 dark:bg-glassWhite/5 shadow-md backdrop-blur-lg border border-white/10"
    >
      <div class="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.8"
          stroke="currentColor"
          class="w-7 h-7 text-green-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <h1 class="text-3xl font-bold tracking-wide text-white drop-shadow-sm">Battery Monitor</h1>
      </div>
    </header>

    <p v-if="loading" class="text-glassWhite/70">Fetching Battery data...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>

    <SchoolList v-if="!loading && !error" :reports="reports" :all-entries="transformedEntries" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, computed } from 'vue';
import SchoolList from '@/components/SchoolList.vue';
import { useBatteryAnalysis } from '@/composables/useBatteryAnalysis';
import type { BatteryDataPoint } from '@/types/battery';

const { reports, allEntries, loading, error } = useBatteryAnalysis();

const darkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};

watchEffect(() => {
  const root = window.document.documentElement;
  if (darkMode.value) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
});

const transformedEntries = computed<BatteryDataPoint[]>(() =>
  allEntries.value.map(({ serialNumber, timestamp, powerLevel, school, employeeId }) => ({
    serialNumber,
    timestamp,
    powerLevel,
    batteryLevel: powerLevel,
    school,
    employeeId
  }))
);
</script>
