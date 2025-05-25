import { render, screen } from '@testing-library/vue';
import SchoolCard from '@/components/SchoolCard.vue';
import { describe, it, expect } from 'vitest';
import type { SchoolBatteryReport } from '@/types/battery';
import '@testing-library/jest-dom';

const mockSchoolReport: SchoolBatteryReport = {
  school: 'Test Academy',
  devices: [
    {
      serialNumber: '123',
      status: 'Healthy',
      avgDailyDrain: 1.2,
      school: 'Test Academy',
      needsReplacement: false
    },
    {
      serialNumber: '456',
      status: 'Replace',
      avgDailyDrain: 2.3,
      school: 'Test Academy',
      needsReplacement: true
    }
  ],
  unhealthyCount: 1
};

describe('SchoolCard', () => {
  it('renders school name and device status', () => {
    render(SchoolCard, {
      props: {
        schoolReport: mockSchoolReport,
        allEntries: [],
        onOpenModal: () => {}
      }
    });

    expect(screen.getByText('Test Academy')).toBeInTheDocument();
    expect(screen.getByText('1 device need replacement')).toBeInTheDocument();
    expect(screen.getByText('Avg Drain: 1.75%/day')).toBeInTheDocument();
  });
});
