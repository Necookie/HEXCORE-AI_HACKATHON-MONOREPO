import type { ScheduleConfig } from '../types/project.types';

export const projectService = {
  async uploadPDF(file: File): Promise<string> {
    // Simulated upload
    await new Promise(r => setTimeout(r, 800));
    return 'https://placeholder.example.com/doc.pdf';
  },

  async triggerN8N(payload: { pdfUrl: string; schedule: ScheduleConfig }): Promise<void> {
    // TODO: fetch(import.meta.env.PUBLIC_N8N_WEBHOOK_URL, { method:'POST', body: JSON.stringify(payload) })
    await new Promise(r => setTimeout(r, 5000));
  }
};
