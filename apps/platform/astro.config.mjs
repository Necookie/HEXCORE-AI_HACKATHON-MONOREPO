// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

const isCloudflare = process.env.CF_PAGES === '1';

export default defineConfig({
  output: 'server',
  // Force the adapter into 'directory' mode for Cloudflare Pages
  // and 'standalone' for local Node development.
  adapter: isCloudflare
    ? cloudflare() 
    : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
