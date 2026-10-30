import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'engine-src');
const outputPath = path.join(root, 'public/assets/js/app.1782836328290.js');
const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8'));

const output = manifest.map(({ file }) => fs.readFileSync(path.join(sourceDir, file), 'utf8')).join('\n');
fs.writeFileSync(outputPath, output);
console.log(`Built WebGL runtime from ${manifest.length} readable source units.`);
