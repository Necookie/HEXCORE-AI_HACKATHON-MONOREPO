import type {
  ScheduleConfig,
  DocumentStatusResponse,
  RoadmapData,
  DocumentSummary,
  TodaySession,
  DashboardStats,
} from '../types/project.types';

export const projectService = {
  /**
   * Uploads the PDF and schedule config to the server.
   * Returns the documentId so the caller can start polling status.
   * Throws with a user-facing message on failure.
   */
  async uploadPDF(file: File, schedule: ScheduleConfig): Promise<{ documentId: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('schedule', JSON.stringify(schedule));

    let res: Response;
    try {
      res = await fetch('/api/upload/pdf', { method: 'POST', body: form });
    } catch {
      throw new Error('Network error. Check your connection and try again.');
    }

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.ok) {
      throw new Error(json.error ?? 'Upload failed. Please try again.');
    }

    return { documentId: json.documentId as string };
  },

  /**
   * Polls the processing status of a document.
   * Used to track n8n workflow progress after upload.
   */
  async pollDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
    let res: Response;
    try {
      res = await fetch(`/api/documents/${documentId}/status`);
    } catch {
      throw new Error('Network error while checking status.');
    }

    if (!res.ok) {
      throw new Error('Failed to fetch document status.');
    }

    return res.json() as Promise<DocumentStatusResponse>;
  },

  /**
   * Fetches the full roadmap (document metadata + all study sessions)
   * for a given document ID.
   */
  async fetchRoadmap(documentId: string): Promise<RoadmapData> {
    let res: Response;
    try {
      res = await fetch(`/api/documents/${documentId}/roadmap`);
    } catch {
      throw new Error('Network error while loading roadmap.');
    }

    if (!res.ok) {
      throw new Error('Failed to load roadmap.');
    }

    return res.json() as Promise<RoadmapData>;
  },

  /**
   * Returns a summary list of all the user's documents with progress counts.
   * Used by LearningDashboard for the subject card grid.
   */
  async fetchDocuments(): Promise<DocumentSummary[]> {
    let res: Response;
    try {
      res = await fetch('/api/documents');
    } catch {
      throw new Error('Network error while loading subjects.');
    }

    if (!res.ok) {
      throw new Error('Failed to load subjects.');
    }

    return res.json() as Promise<DocumentSummary[]>;
  },

  /**
   * Returns all study sessions scheduled for today across all documents.
   * Used by LearningDashboard for the "Today's Sessions" list.
   */
  async fetchTodaySessions(): Promise<TodaySession[]> {
    let res: Response;
    try {
      res = await fetch('/api/sessions/today');
    } catch {
      throw new Error('Network error while loading today\'s sessions.');
    }

    if (!res.ok) {
      throw new Error('Failed to load today\'s sessions.');
    }

    return res.json() as Promise<TodaySession[]>;
  },

  /**
   * Returns real-time dashboard stats for the current user:
   * streak (days), elo, quizzesPassed, studyHours.
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    let res: Response;
    try {
      res = await fetch('/api/dashboard/stats');
    } catch {
      throw new Error('Network error while loading stats.');
    }

    if (!res.ok) {
      throw new Error('Failed to load dashboard stats.');
    }

    return res.json() as Promise<DashboardStats>;
  },

  /**
   * Deletes a document and all associated data:
   * - Supabase Storage PDF
   * - study_sessions rows (via FK cascade)
   * - Google Calendar events (fire-and-forget via n8n)
   */
  async deleteDocument(id: string): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch {
      throw new Error('Network error while deleting subject.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? 'Failed to delete subject.');
    }
  },
};
