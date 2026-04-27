import type { ScheduleConfig } from '../types/project.types';

export const projectService = {
  /**
   * Uploads the PDF and schedule config to the server.
   * Throws with a user-facing message on failure.
   */
  async uploadPDF(file: File, schedule: ScheduleConfig): Promise<void> {
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
  },
};
