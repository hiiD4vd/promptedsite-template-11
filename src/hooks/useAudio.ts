import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>([0.2, 0.4, 0.3, 0.5]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;

      gain.connect(ctx.destination);
      analyser.connect(gain);

      audioContextRef.current = ctx;
      gainNodeRef.current = gain;
      analyserRef.current = analyser;

      const audio = new Audio('/assets/audio/drones/1.mp3');
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      audioElementRef.current = audio;
    } catch {
      // AudioContext not allowed before user interaction
    }
  }, []);

  const toggleAudio = useCallback(() => {
    initAudio();

    if (!audioElementRef.current || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [initAudio, isPlaying]);

  const playClick = useCallback(() => {
    try {
      const clickAudio = new Audio('/assets/audio/one-shots/uiClick.mp3');
      clickAudio.volume = 0.4;
      clickAudio.play().catch(() => {});
    } catch {
      // Audio autoplay restrictions
    }
  }, []);

  useEffect(() => {
    let animId: number;
    const updateFrequencies = () => {
      if (analyserRef.current && isPlaying) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const b1 = (data[1] || 0) / 255;
        const b2 = (data[3] || 0) / 255;
        const b3 = (data[5] || 0) / 255;
        const b4 = (data[7] || 0) / 255;
        setFrequencies([Math.max(0.1, b1), Math.max(0.1, b2), Math.max(0.1, b3), Math.max(0.1, b4)]);
      } else {
        setFrequencies([0.2, 0.35, 0.25, 0.4]);
      }
      animId = requestAnimationFrame(updateFrequencies);
    };

    animId = requestAnimationFrame(updateFrequencies);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return {
    isPlaying,
    frequencies,
    toggleAudio,
    playClick,
    initAudio,
  };
}
