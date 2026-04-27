// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Cloudflare Pages build detection
const isCloudflare = process.env.CF_PAGES === '1';
const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'server',
  // When building for Cloudflare, use the adapter with NO extra config
  // to let it auto-detect the Pages environment correctly.
  adapter: isCloudflare
    ? cloudflare() 
    : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    envDir: resolve(rootDir, '../..'),
    plugins: [tailwindcss()],
  },
});
