import { cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve();
const buildDir = resolve(root, 'dist');
const directoriesToCopy = ['js'];

await Promise.all(directoriesToCopy.map(async (dir) => {
  const src = resolve(root, dir);
  const dest = resolve(buildDir, dir);
  try {
    await rm(dest, { recursive: true, force: true });
  } catch {
    // ignore
  }
  await cp(src, dest, { recursive: true });
}));
