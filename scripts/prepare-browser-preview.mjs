import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'src/config/assets.json'), 'utf8'));
const release = manifest.release;
const archiveName = `template-11-media-${release}.zip`;
const archiveUrl = `https://github.com/gilbertstevenson16-code/promptedsite-template-11-media/releases/download/artifact-assets-${release}/${archiveName}`;
const archiveHash = 'c261430b0e3a76fdaa4c3aa90b1ebe1652712e771145faeb1f353ecce81fc6d3';
const cacheDir = path.join(root, '.cache', 'browser-preview');
const archivePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(cacheDir, archiveName);
const extractDir = path.join(cacheDir, 'extracted');
const sha256 = (data) => createHash('sha256').update(data).digest('hex');

await fs.mkdir(cacheDir, { recursive: true });
if (!process.argv[2]) {
  try {
    await fs.access(archivePath);
  } catch {
    const response = await fetch(archiveUrl, { signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`Media download failed: HTTP ${response.status}`);
    await fs.writeFile(archivePath, Buffer.from(await response.arrayBuffer()));
  }
}

if (sha256(await fs.readFile(archivePath)) !== archiveHash) {
  throw new Error(`Media archive checksum mismatch: ${archivePath}`);
}
await fs.rm(extractDir, { recursive: true, force: true });
await fs.mkdir(extractDir, { recursive: true });
await run('unzip', ['-q', archivePath, '-d', extractDir]);

for (const [name, metadata] of Object.entries(manifest.files)) {
  const file = path.join(extractDir, name);
  const data = await fs.readFile(file);
  if (data.length !== metadata.bytes || sha256(data) !== metadata.sha256) {
    throw new Error(`Media file checksum mismatch: ${name}`);
  }
}
await fs.cp(path.join(extractDir, 'assets'), path.join(root, 'public/assets'), { recursive: true });
console.log(`Verified and installed ${Object.keys(manifest.files).length} same-origin preview files.`);
