export type StudyDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ScheduleConfig {
  subjectName: string;
  targetDate: string;
  hoursPerDay: number;
  studyDays: StudyDay[];
}

export const ALL_DAYS: StudyDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PROC_STEPS = [
  'Parsing PDF content',
  'Chunking into study modules',
  'Scheduling calendar events',
  'Building quiz questions',
];
