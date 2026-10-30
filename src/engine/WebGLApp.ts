import type { ExperienceStatus, NavigationTab } from '../types';
import { assetBaseUrl, assetUrl } from '../config/assetUrl';

declare global {
  interface Window {
    _CONFIG_?: string;
    CREATED_WITH_HYDRAX?: string;
    _CACHE_?: string;
    UIL_STATIC_PATH?: string;
    USE_CACHED_FILE?: boolean;
    UIL_ID?: string;
    USE_PUBLISHED_UIL_FOR_ENVS?: string;
    ENABLE_UIL_CMS?: boolean;
    _UNSUPPORTED_PAGE_?: string;
    HYDRA_ASSETS_CDN?: string;
    HYDRA_ASSETS_BASE_PATH?: string;
    __ALLOW_SOFTWARE_WEBGL__?: boolean;
    Global?: {
      CAMERA?: unknown;
      SCROLL?: { y?: number };
      loader?: { onProgress?: (p: number) => void };
      app?: unknown;
    };
  }
}

export class WebGLApp {
  private static instance: WebGLApp | null = null;
  private readonly runtimeSource = '/assets/js/app.1782836328290.js';
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private status: ExperienceStatus = 'idle';

  public static getInstance(): WebGLApp {
    if (!WebGLApp.instance) {
      WebGLApp.instance = new WebGLApp();
    }
    return WebGLApp.instance;
  }

  public init(_container?: HTMLElement, onProgress?: (progress: number) => void): Promise<void> {
    if (this.isInitialized) {
      onProgress?.(100);
      return Promise.resolve();
    }

    if (this.initPromise) return this.initPromise;

    this.status = 'loading';
    this.initPromise = new Promise((resolve, reject) => {
      // 1. Setup Global HydraX configuration before script execution
      window._UNSUPPORTED_PAGE_ = '/unsupported.html';
      window.HYDRA_ASSETS_CDN = assetBaseUrl;
      window.HYDRA_ASSETS_BASE_PATH = assetBaseUrl;
      window.__ALLOW_SOFTWARE_WEBGL__ = import.meta.env.VITE_ALLOW_SOFTWARE_WEBGL === '1';
      window._CONFIG_ = JSON.stringify({
        USE_CACHED_FILE: true,
        ENABLE_UIL_CMS: false,
        ENV: 'production',
        PROD: true,
        CACHE: 1782836328290,
        UIL_ID: 'santioni',
        USE_PUBLISHED_UIL_FOR_ENVS: [],
      });
      window.CREATED_WITH_HYDRAX = '1.1.20';
      window._CACHE_ = '1782836328290';
      window.UIL_STATIC_PATH = assetUrl('assets/data/uil.1782836328290.json');
      window.USE_CACHED_FILE = true;
      window.UIL_ID = 'santioni';
      window.USE_PUBLISHED_UIL_FOR_ENVS = '';
      window.ENABLE_UIL_CMS = false;

      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${this.runtimeSource}"]`,
      );

      if (existingScript?.dataset.loaded === 'true') {
        this.isInitialized = true;
        this.status = 'ready';
        onProgress?.(100);
        resolve();
        return;
      }

      // Progress animation
      let progress = 20;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 20, 95);
        onProgress?.(progress);
      }, 150);

      // 2. Inject application script once
      const script = existingScript ?? document.createElement('script');
      script.src = this.runtimeSource;
      script.async = true;

      script.onload = () => {
        clearInterval(progressInterval);
        script.dataset.loaded = 'true';
        this.isInitialized = true;
        this.status = 'ready';
        onProgress?.(100);
        resolve();
      };

      script.onerror = () => {
        clearInterval(progressInterval);
        this.status = 'error';
        this.initPromise = null;
        reject(new Error('The HydraX experience runtime could not be loaded.'));
      };

      if (!existingScript) document.head.appendChild(script);
    });

    return this.initPromise;
  }

  public getStatus(): ExperienceStatus {
    return this.status;
  }

  public retry(container?: HTMLElement, onProgress?: (progress: number) => void): Promise<void> {
    if (this.status !== 'error') return this.init(container, onProgress);

    document.querySelector<HTMLScriptElement>(`script[src="${this.runtimeSource}"]`)?.remove();
    this.initPromise = null;
    return this.init(container, onProgress);
  }

  public setTab(tab: NavigationTab): void {
    const targetText = tab === 'collection' ? 'collection' : 'experience';
    const allLinks = document.querySelectorAll('.Story > .HeaderMenu .header__link .hit');
    allLinks.forEach((el) => {
      if (el.getAttribute('aria-label')?.toLowerCase() === targetText) {
        (el as HTMLElement).click();
      }
    });
  }

  public selectProduct(index: number): void {
    const key = index === 0 ? 'ArrowLeft' : 'ArrowRight';
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }

  public destroy(): void {
    // HydraX is a self-bootstrapping legacy runtime and does not expose a safe
    // disposal API. Its singleton must stay mounted for the lifetime of the page.
  }
}
