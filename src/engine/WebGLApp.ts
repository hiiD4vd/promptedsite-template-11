import type { NavigationTab } from '../types';

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
  private isInitialized = false;

  public static getInstance(): WebGLApp {
    if (!WebGLApp.instance) {
      WebGLApp.instance = new WebGLApp();
    }
    return WebGLApp.instance;
  }

  public init(_container?: HTMLElement, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // 1. Setup Global HydraX configuration before script execution
      window._UNSUPPORTED_PAGE_ = '/unsupported.html';
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
      window.UIL_STATIC_PATH = '/assets/data/uil.1782836328290.json';
      window.USE_CACHED_FILE = true;
      window.UIL_ID = 'santioni';
      window.USE_PUBLISHED_UIL_FOR_ENVS = '';
      window.ENABLE_UIL_CMS = false;

      if (this.isInitialized || document.querySelector('script[src*="app.1782836328290.js"]')) {
        this.isInitialized = true;
        if (onProgress) onProgress(100);
        resolve();
        return;
      }

      // Progress animation
      let progress = 20;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 20, 95);
        if (onProgress) onProgress(progress);
      }, 150);

      // 2. Inject application script once
      const script = document.createElement('script');
      script.src = '/assets/js/app.1782836328290.js';
      script.async = true;

      script.onload = () => {
        clearInterval(progressInterval);
        this.isInitialized = true;
        if (onProgress) onProgress(100);
        resolve();
      };

      script.onerror = (err) => {
        clearInterval(progressInterval);
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  public setTab(tab: NavigationTab): void {
    const targetText = tab === 'collection' ? 'collection' : 'experience';
    const allLinks = document.querySelectorAll('.header__link');
    allLinks.forEach((el) => {
      if (el.textContent?.toLowerCase().includes(targetText)) {
        (el as HTMLElement).click();
      }
    });
  }

  public selectProduct(index: number): void {
    const key = index === 0 ? 'ArrowLeft' : 'ArrowRight';
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }

  public destroy(): void {
    // Keep initialized state persistent
  }
}
