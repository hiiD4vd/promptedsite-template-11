import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const manifest = JSON.parse(fs.readFileSync(new URL('./src/config/assets.json', import.meta.url), 'utf8')) as {
  baseUrl: string;
  release: string;
  files: Record<string, unknown>;
};
const baseUrl = (process.env.VITE_MEDIA_BASE_URL || manifest.baseUrl).replace(/\/$/, '');
const resolveAsset = (path: string) => {
  if (path.includes(`?v=${manifest.release}`)) return path;
  const file = path.replace(/^\//, '');
  if (!Object.hasOwn(manifest.files, file)) throw new Error(`Unknown CSS/HTML asset: ${file}`);
  return `${baseUrl}/${file}?v=${manifest.release}`;
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'template-11-html-assets',
      transformIndexHtml(html) {
        return html.replace('/assets/favicon/favicon.svg', resolveAsset('/assets/favicon/favicon.svg'));
      },
    },
  ],
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'template-11-css-assets',
          Declaration(declaration) {
            if (!declaration.value.includes('/assets/')) return;
            declaration.value = declaration.value.replace(
              /url\((['"]?)(\/assets\/[^)'"\s]+)\1\)/g,
              (_, _quote: string, path: string) => `url("${resolveAsset(path)}")`,
            );
          },
        },
      ],
    },
  },
});
