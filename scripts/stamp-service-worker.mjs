// Appends a build fingerprint to build/service-worker.js so its bytes change
// whenever the bundle changes. The browser updates a service worker only when
// the file's bytes differ, so without this stamp a deploy would never re-run
// the precache step. Idempotent: re-running replaces the previous stamp.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const manifest = readFileSync('build/asset-manifest.json');
const stamp = createHash('sha256').update(manifest).digest('hex').slice(0, 16);

const swPath = 'build/service-worker.js';
const source = readFileSync(swPath, 'utf8').replace(/\n\/\/ build [0-9a-f]+\n$/, '\n');
writeFileSync(swPath, `${source}// build ${stamp}\n`);
console.log(`service-worker.js stamped with build ${stamp}`);
