import manifest from './assets.json';

const releaseBaseUrl = (import.meta.env.VITE_MEDIA_BASE_URL || manifest.baseUrl).replace(/\/$/, '');
const knownFiles = manifest.files as Record<string, { bytes: number; sha256: string; contentType: string }>;

export function assetUrl(path: string): string {
  const normalized = path.replace(/^\//, '');
  if (!knownFiles[normalized]) throw new Error(`Unknown template asset: ${normalized}`);
  return `${releaseBaseUrl}/${normalized}?v=${manifest.release}`;
}

export const assetBaseUrl = `${releaseBaseUrl}/`;
