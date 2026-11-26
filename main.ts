// HearthLedger hand-in (Node 22, standard library only).
//
// The site is plain static files in app/ and its screenshots in
// screenshots/. This program copies both into the output directory and
// writes dossier.json there with the vendored make.fun library, so the
// scorer can check the entry and the judge can read it. Run it twice and
// the two outputs are byte for byte the same.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// Clear the output directory without ever removing the directory itself:
// the grader mounts /output, so deleting it would fail outright. Only the
// entries inside it are removed, one by one, so a stale file from an
// earlier run can never leak into the entry. A fresh empty directory is
// left exactly as found, ready to receive the new copy.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

// Fail fast, with a plain message, when the screenshots are missing:
// buildDossier would refuse them anyway, but only after copying.
if (!existsSync(join(outDir, 'screenshots', '1-dashboard.jpg'))) {
  throw new Error('main.ts: screenshots/1-dashboard.jpg is missing — take the screenshots first');
}

// The dossier caps mirror the gate: at most 4 screenshots, each at most
// 256 KiB, app/ at most 993 files and 16 MiB, and the dossier text at most
// 160 KiB. buildDossier refuses anything past them.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
