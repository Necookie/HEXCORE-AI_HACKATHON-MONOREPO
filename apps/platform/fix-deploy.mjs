import { rmSync, existsSync, readdirSync, renameSync, copyFileSync, cpSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting post-build cleanup...');

// 1. Remove the broken adapter-generated configs if they exist
if (existsSync('.wrangler')) {
  rmSync('.wrangler', { recursive: true, force: true });
  console.log('  - Deleted .wrangler');
}

// 2. Fix directory structure
// If the adapter put things in dist/server, move everything to dist/
// This ensures _worker.js can find its ./chunks/ folder.
if (existsSync('dist/server')) {
    console.log('  - Moving contents of dist/server to dist/ root...');
    
    // Copy all files/folders from dist/server to dist/
    cpSync('dist/server', 'dist', { recursive: true });
    
    // Rename entry.mjs to _worker.js if it exists
    if (existsSync('dist/entry.mjs')) {
        renameSync('dist/entry.mjs', 'dist/_worker.js');
        console.log('  - Renamed entry.mjs to _worker.js');
    }
    
    // Clean up the now-empty server folder
    rmSync('dist/server', { recursive: true, force: true });
}

// 3. Verify final state
if (existsSync('dist/_worker.js')) {
  console.log(`✅ SUCCESS: _worker.js and chunks are ready in dist/`);
  console.log('Final dist root:', readdirSync('dist'));
} else {
  console.error(`❌ ERROR: Could not find any worker entry point!`);
  console.log('Full dist structure:', readdirSync('dist', { recursive: true }));
}

console.log('✓ Cleanup complete.');
