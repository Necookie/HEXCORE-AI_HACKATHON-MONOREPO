// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

// CF_PAGES=1 is automatically set by Cloudflare Pages during build.
// Locally we use the Node adapter so workerd.exe is never spawned.
const isCloudflare = process.env.CF_PAGES === '1';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isCloudflare
    ? cloudflare({ inspectorPort: 9232 })
    : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
