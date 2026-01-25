export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export enum SubjectType {
  THEORY = 'Theory',
  LAB = 'Lab',
}

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  totalClasses: number;
  attendedClasses: number;
  targetPercentage: number; // e.g., 75
  credits?: number;
  lecturer?: string;
  // Bulk Import Data
  pastAttendedClasses?: number; 
  pastAbsentClasses?: number; 
}

export interface ClassSession {
  id: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // "10:00"
  endTime: string; // "11:00"
}

export interface ExtraClass {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  sessionId: string;
  status: 'Present' | 'Absent' | 'Cancelled';
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  minAttendanceCriteria: number;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:mm format
  lastNotifiedDate: string | null; // YYYY-MM-DD
}

export interface AppState {
  user: { name: string; type: 'College' | 'School' } | null;
  term: Term | null;
  subjects: Subject[];
  schedule: ClassSession[];
  extraClasses: ExtraClass[];
  attendanceLogs: AttendanceRecord[];
  isOnboarded: boolean;
  notificationSettings: NotificationSettings;
}