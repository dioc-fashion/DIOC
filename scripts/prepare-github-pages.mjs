// Prepares a CI checkout for a static GitHub Pages export.
// Static export cannot run middleware or force-dynamic pages, so this switches
// those pages to build-time rendering. The Cloudflare Worker build is unaffected
// because this only runs inside the GitHub Pages workflow.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(t|j)sx?$/.test(entry.name)) yield path;
  }
}

let updated = 0;
for await (const file of files('app')) {
  const source = await readFile(file, 'utf8');
  let next = source.replace(/export const dynamic\s*=\s*['"]force-dynamic['"]/g, "export const dynamic = 'force-static'");
  const isMetadataRoute = /(^|[\\/])(robots|sitemap|manifest)\.(t|j)s$/.test(file);
  if (isMetadataRoute && !/export const dynamic\s*=/.test(next)) {
    next = `${next.trimEnd()}\n\nexport const dynamic = 'force-static';\n`;
  }
  if (next !== source) {
    await writeFile(file, next);
    updated += 1;
  }
}

await rm('middleware.ts', { force: true });
console.log(`Prepared GitHub Pages export: ${updated} routes set to static rendering, middleware removed.`);
