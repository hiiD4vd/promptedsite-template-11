import { useEffect, useRef, useState } from 'react';
import { WebGLApp } from '../engine/WebGLApp';
import type { ExperienceStatus, NavigationTab } from '../types';

export function useWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [status, setStatus] = useState<ExperienceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (!containerRef.current) return;

    const app = WebGLApp.getInstance();
    setStatus('loading');
    setError(null);

    void app
      .init(containerRef.current, (progress) => {
        setLoadProgress(progress);
        if (progress >= 100) {
          setIsLoaded(true);
          setStatus('ready');
        }
      })
      .catch((reason: unknown) => {
        const message = reason instanceof Error ? reason.message : 'The experience could not start.';
        setStatus('error');
        setError(message);
      });
  };

  useEffect(() => {
    start();

    return () => {
      // Teardown on unmount
      WebGLApp.getInstance().destroy();
    };
  }, []);

  const retry = () => {
    if (!containerRef.current) return;

    setStatus('loading');
    setError(null);
    setLoadProgress(0);
    void WebGLApp.getInstance()
      .retry(containerRef.current, (progress) => {
        setLoadProgress(progress);
        if (progress >= 100) {
          setIsLoaded(true);
          setStatus('ready');
        }
      })
      .catch((reason: unknown) => {
        setStatus('error');
        setError(reason instanceof Error ? reason.message : 'The experience could not start.');
      });
  };

  const changeTab = (tab: NavigationTab) => {
    WebGLApp.getInstance().setTab(tab);
  };

  const selectProduct = (index: number) => {
    WebGLApp.getInstance().selectProduct(index);
  };

  return {
    containerRef,
    isLoaded,
    loadProgress,
    status,
    error,
    retry,
    changeTab,
    selectProduct,
  };
}
