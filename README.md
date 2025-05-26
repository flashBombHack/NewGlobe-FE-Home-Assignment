# Battery Report Frontend Assessment Submission

This repository contains my completed submission for the frontend technical assessment. The task was to implement a Vue 3 + TypeScript interface for visualizing battery performance data across devices in schools.

The solution analyzes battery usage trends and identifies devices that may require replacement based on their power consumption patterns. The application is structured to prioritize clarity, maintainability, and user-focused visual feedback while staying within the 3-hour time constraint.

## Features Implemented

- **Data Analysis and Aggregation**  
  Implemented a composable (`useBatteryAnalysis`) that loads raw battery data and processes it into a school-level report. Each report aggregates devices and determines their health status (`Healthy`, `Replace`, `Unknown`) based on weighted average battery drain per day.

- **School Summary Cards**  
  A UI component that displays a high-level overview of each school's battery status:

  - School name
  - Device health breakdown (healthy vs. replace)
  - Average battery drain
  - Priority level indicator (based on number of unhealthy devices)
  - Button to drill down into individual device data

- **Detailed Device View**  
  Modal component that shows all devices for a given school, along with:

  - Serial number
  - Calculated average daily battery drain
  - Status indicator
  - Visual chart of battery history (optional)

- **Chart.js Integration**  
  Integrated battery usage charts to visualize power level over time, with formatting for percentage-based y-axis values.

- **Testing**  
  Included unit tests for the `fetchBatteryData` service and the `useBatteryAnalysis` composable to verify:
  - Proper data transformation
  - Correct classification of device statuses

## Technical Stack

- Vue 3 + `<script setup>`
- TypeScript
- Vite
- TailwindCSS
- Chart.js (via vue-chartjs)
- Vitest

## Time Management

This solution was implemented within the 3 - 4 hour time constraint. Focus was placed on correctness, clean architecture, and user-friendly visual presentation.

## Scope Reduced (and Strategy to Continue)

To meet the time limit while maintaining code quality and clarity, the following features were deprioritized:

1. **Pagination or Filtering of Schools**  
   _Next Step:_ Add pagination or a searchable list for schools with large device counts.

2. **Detailed Usage Trends Per Device (Historical View)**  
   _Next Step:_ Integrate a timeline view per device using sparkline or full chart to show daily usage trends.

3. **Export or Download Reports**  
   _Next Step:_ Add CSV or PDF export functionality to allow school admins to download device health reports.

4. **Authentication / Role-based Access**  
   _Next Step:_ Wrap frontend with basic auth or connect to a backend auth service for multi-user support.

## Recommended Node Version

```bash
# Node Version
v20.9.+
```

## Running the Project

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Run tests
npm run test
```
