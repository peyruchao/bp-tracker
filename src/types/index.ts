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
