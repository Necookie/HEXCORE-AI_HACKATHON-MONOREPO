import { rmSync, existsSync, readdirSync } from 'fs';
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

// 2. Verify _worker.js exists
const workerPath = 'dist/_worker.js';
if (existsSync(workerPath)) {
  console.log(`✅ SUCCESS: _worker.js found at ${workerPath}`);
} else {
  console.error(`❌ ERROR: _worker.js NOT FOUND in dist/!`);
  console.log('Contents of dist:', readdirSync('dist'));
}

console.log('✓ Cleanup complete. Cloudflare CI will now use wrangler.toml');
