import { rmSync, existsSync, readdirSync, renameSync, cpSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting FINAL post-build merge...');

// 1. Move CLIENT assets (CSS, JS, Images) to root
if (existsSync('dist/client')) {
    console.log('  - Merging dist/client into dist/ root...');
    cpSync('dist/client', 'dist', { recursive: true });
    rmSync('dist/client', { recursive: true, force: true });
}

// 2. Move SERVER assets (Worker, Chunks) to root
if (existsSync('dist/server')) {
    console.log('  - Merging dist/server into dist/ root...');
    cpSync('dist/server', 'dist', { recursive: true });
    
    // Rename the entry point to _worker.js for Cloudflare Pages
    if (existsSync('dist/entry.mjs')) {
        renameSync('dist/entry.mjs', 'dist/_worker.js');
        console.log('  - Renamed entry.mjs to _worker.js');
    }
    
    rmSync('dist/server', { recursive: true, force: true });
}

// 3. Clean up the .wrangler folder
if (existsSync('.wrangler')) {
  rmSync('.wrangler', { recursive: true, force: true });
}

// 4. Verify
if (existsSync('dist/_worker.js') && existsSync('dist/_astro')) {
  console.log('✅ SUCCESS: Worker and Styles are both in the root dist/ folder.');
} else {
  console.log('Current dist structure:', readdirSync('dist', { recursive: true }));
}

console.log('✓ Merge complete.');
