// fix-deploy.mjs
// Run after `astro build` to remove adapter-generated Wrangler files that
// conflict with Cloudflare Pages CI validation.
//
// @astrojs/cloudflare v13 generates:
//   .wrangler/deploy/config.json  → redirects CI to use dist/server/wrangler.json
//   dist/server/wrangler.json     → contains invalid fields (empty triggers,
//                                   SESSION KV without ID, reserved ASSETS name)
//
// Without these files, Cloudflare Pages CI uses our clean wrangler.toml,
// finds dist/_worker.js, and deploys correctly.

import { rmSync } from 'fs';

rmSync('.wrangler', { recursive: true, force: true });
rmSync('dist/server/wrangler.json', { force: true });

console.log('✓ Removed adapter-generated Wrangler config — CI will use wrangler.toml');
