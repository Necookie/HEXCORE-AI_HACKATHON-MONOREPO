export type StudyDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ScheduleConfig {
  subjectName: string;
  targetDate:  string;
  hoursPerDay: number;
  studyDays:   StudyDay[];
}

export type UploadPhase = 'idle' | 'pending' | 'done' | 'failed';

export const ALL_DAYS: StudyDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — mirrors server
export const MAX_FILE_MB    = 25;

export const PROC_STEPS = [
  'Uploading PDF',
  'Parsing content',
  'Building study modules',
  'Scheduling sessions',
] as const;
