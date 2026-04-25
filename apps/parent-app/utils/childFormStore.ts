// Module-level store shared between add.tsx and schedule.tsx during child creation.
// Reset on submission or cancellation.

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface DaySchedule {
  day: DayOfWeek;
  label: string;
  customDropoffAddress: string;
  customPickupAddress: string;
}

const DAYS: DaySchedule[] = [
  { day: 'MONDAY',    label: 'Monday',    customDropoffAddress: '', customPickupAddress: '' },
  { day: 'TUESDAY',   label: 'Tuesday',   customDropoffAddress: '', customPickupAddress: '' },
  { day: 'WEDNESDAY', label: 'Wednesday', customDropoffAddress: '', customPickupAddress: '' },
  { day: 'THURSDAY',  label: 'Thursday',  customDropoffAddress: '', customPickupAddress: '' },
  { day: 'FRIDAY',    label: 'Friday',    customDropoffAddress: '', customPickupAddress: '' },
];

let _schedule: DaySchedule[] = DAYS.map(d => ({ ...d }));

export const childFormStore = {
  getSchedule: (): DaySchedule[] => _schedule,
  setSchedule: (s: DaySchedule[]) => { _schedule = s; },
  reset: () => { _schedule = DAYS.map(d => ({ ...d })); },
};
