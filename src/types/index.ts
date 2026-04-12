export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface BloodPressureRecord {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  timestamp: number;
  period: 'morning' | 'evening';
  systolic: number;
  diastolic: number;
  pulse: number;
  notes?: string;
}

export type BPStatus = 'normal' | 'high' | 'very-high';

export const getBPStatus = (systolic: number, diastolic: number): BPStatus => {
  if (systolic >= 140 || diastolic >= 90) return 'very-high';
  if (systolic >= 130 || diastolic >= 85) return 'high';
  return 'normal';
};

// Independently evaluate each value
export const getSysStatus = (systolic: number): BPStatus => {
  if (systolic >= 140) return 'very-high';
  if (systolic >= 130) return 'high';
  return 'normal';
};

export const getDiaStatus = (diastolic: number): BPStatus => {
  if (diastolic >= 90) return 'very-high';
  if (diastolic >= 85) return 'high';
  return 'normal';
};

export const bpStatusColor = (status: BPStatus): string => {
  if (status === 'very-high') return 'var(--color-very-high)';
  if (status === 'high') return 'var(--color-high)';
  return 'var(--color-normal)';
};
