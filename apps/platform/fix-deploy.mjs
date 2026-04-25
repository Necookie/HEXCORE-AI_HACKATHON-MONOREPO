import { rmSync, existsSync, readdirSync, renameSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting post-build cleanup...');

// 1. Remove the broken adapter-generated configs
const targets = ['.wrangler', 'dist/server/wrangler.json'];
targets.forEach(t => {
  if (existsSync(t)) {
    rmSync(t, { recursive: true, force: true });
    console.log(`  - Deleted ${t}`);
  }
});

// 2. Fix directory structure if adapter used "Advanced/Worker" mode instead of "Pages" mode
// Cloudflare Pages expects _worker.js in the root of the output directory.
if (existsSync('dist/server/_worker.js') && !existsSync('dist/_worker.js')) {
  console.log('  - Moving _worker.js from dist/server to dist/ root...');
  renameSync('dist/server/_worker.js', 'dist/_worker.js');
}

// 3. Verify _worker.js exists
const workerPath = 'dist/_worker.js';
if (existsSync(workerPath)) {
  console.log(`✅ SUCCESS: _worker.js found at ${workerPath}`);
} else {
  console.error(`❌ ERROR: _worker.js NOT FOUND in dist/!`);
  console.log('Final dist structure:', readdirSync('dist', { recursive: true }));
}

console.log('✓ Cleanup complete.');
