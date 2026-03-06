import { cp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve();
const buildDir = resolve(root, 'dist');
const assetsToCopy = ['css', 'js', 'images', 'videos', 'fonts'];

await Promise.all(assetsToCopy.map(async (entry) => {
  const src = resolve(root, entry);
  const dest = resolve(buildDir, entry);
  await rm(dest, { recursive: true, force: true });
  await cp(src, dest, { recursive: true });
}));

const textExts = new Set(['.html', '.css', '.js', '.mjs', '.json', '.txt', '.svg']);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

const replacePrefix = async () => {
  const files = await walk(buildDir);
  await Promise.all(files.map(async (file) => {
    if (!textExts.has(extname(file).toLowerCase())) return;
    const content = await readFile(file, 'utf8');
    if (!content.includes('/productionbot/')) return;
    const updated = content.replace(/\/productionbot\//g, '/');
    await writeFile(file, updated);
  }));
};

await replacePrefix();
