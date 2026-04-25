// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// Landing is a static site — no SSR adapter needed.
// Auth modals use client-side Supabase JS SDK.
// Cloudflare Pages serves static files natively.
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});