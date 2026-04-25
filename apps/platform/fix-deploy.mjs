import { rmSync, existsSync, readdirSync, renameSync, copyFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting post-build cleanup...');

// 1. Remove the broken adapter-generated configs
const targets = ['.wrangler'];
targets.forEach(t => {
  if (existsSync(t)) {
    rmSync(t, { recursive: true, force: true });
    console.log(`  - Deleted ${t}`);
  }
});

// 2. SEARCH for the worker file if it's not in the right place
// Sometimes Astro v5+ puts it in dist/_worker.js, sometimes dist/server/entry.mjs
if (!existsSync('dist/_worker.js')) {
    console.log('  - _worker.js missing, looking for alternatives...');
    const possiblePaths = [
        'dist/server/entry.mjs',
        'dist/server/_worker.js'
    ];
    
    for (const p of possiblePaths) {
        if (existsSync(p)) {
            console.log(`  - Found worker entry at ${p}, moving to dist/_worker.js`);
            copyFileSync(p, 'dist/_worker.js');
            break;
        }
    }
}

// 3. Verify final state
if (existsSync('dist/_worker.js')) {
  console.log(`✅ SUCCESS: _worker.js is ready in dist/`);
} else {
  console.error(`❌ ERROR: Could not find any worker entry point!`);
  console.log('Full dist structure:', readdirSync('dist', { recursive: true }));
}

console.log('✓ Cleanup complete.');
