export type StudyDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ScheduleConfig {
  subjectName:     string;
  targetDate:      string;
  hoursPerDay:     number;
  studyDays:       StudyDay[];
  startTime:       string;  // "HH:MM" in the user's local 24-hour time, e.g. "19:00"
  timezoneOffset:  number;  // new Date().getTimezoneOffset() — minutes behind UTC (negative for ahead)
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

// ─── Roadmap & session types (populated by n8n after processing) ─────────────

export type DocumentStatus = 'processing' | 'ready' | 'error';

export interface DocumentStatusResponse {
  status: DocumentStatus;
  errorMessage: string | null;
}

export interface StudySession {
  id: string;
  documentId: string;
  moduleNumber: number;
  title: string;
  summary: string | null;
  learningObjectives: string[];
  subtopics: string[];
  estimatedMinutes: number;
  startTime: string;   // ISO datetime
  endTime: string;
  calendarEventId: string | null;
  status: 'scheduled' | 'completed' | 'skipped';
}

export interface RoadmapDocument {
  id: string;
  subjectName: string | null;
  targetDate: string;
  hoursPerDay: number;
  studyDays: string[];
  status: DocumentStatus;
  errorMessage: string | null;
}

export interface RoadmapData {
  document: RoadmapDocument;
  sessions: StudySession[];
}

export interface DocumentSummary {
  id: string;
  subjectName: string | null;
  status: DocumentStatus;
  targetDate: string;
  totalSessions: number;
  completedSessions: number;
  nextSessionDate: string | null;
  nextSessionTitle: string | null;
}

export interface TodaySession {
  id: string;
  documentId: string;
  subjectName: string | null;
  title: string;
  estimatedMinutes: number;
  startTime: string;
  status: 'scheduled' | 'completed' | 'skipped';
}
