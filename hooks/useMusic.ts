"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PRESET_TRACKS } from "@/constants/music";

export interface UseMusicResult {
  musicName: string;
  musicIcon: string;
  isPlaying: boolean;
  musicLoaded: boolean;
  volume: number;
  loadFile: (file: File) => void;
  loadTrack: (name: string, src: string, icon?: string) => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  duck: () => void;
  unduck: () => void;
}

export function useMusic(): UseMusicResult {
  const [musicName, setMusicName] = useState("No music loaded");
  const [musicIcon, setMusicIcon] = useState("🎵");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const [volume, setVolumeState] = useState(70);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userVolumeRef = useRef(0.7);
  const isDuckingRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const defaultTrack = PRESET_TRACKS[0];
    const audio = new Audio();
    audio.loop = true;
    audio.volume = userVolumeRef.current;
    audio.src = defaultTrack.src;
    audioRef.current = audio;
    setMusicName(defaultTrack.name);
    setMusicIcon(defaultTrack.icon || "🎵");
    setMusicLoaded(true);
  }, []);

  const applyVolume = useCallback(() => {
    if (!isDuckingRef.current && audioRef.current) {
      audioRef.current.volume = userVolumeRef.current;
    }
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const audio = new Audio();
      audio.loop = true;
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.volume = userVolumeRef.current;
      objectUrlRef.current = url;
      audioRef.current = audio;

      setMusicName(file.name.replace(/\.[^.]+$/, ""));
      setMusicIcon("🎵");
      setMusicLoaded(true);
      audio.play();
      setIsPlaying(true);
    },
    [],
  );

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    userVolumeRef.current = value / 100;
    setVolumeState(value);
    applyVolume();
  }, [applyVolume]);

  const fadeVolume = useCallback(
    (from: number, to: number, durationMs: number, done?: () => void) => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      const audio = audioRef.current;
      if (!audio) { done?.(); return; }
      const steps = 20;
      const stepMs = durationMs / steps;
      let step = 0;
      audio.volume = from;
      fadeIntervalRef.current = setInterval(() => {
        step++;
        const t = step / steps;
        audio.volume = from + (to - from) * t;
        if (step >= steps) {
          clearInterval(fadeIntervalRef.current!);
          fadeIntervalRef.current = null;
          audio.volume = to;
          done?.();
        }
      }, stepMs);
    },
    [],
  );

  const duck = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) return;
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    isDuckingRef.current = true;
    const targetVol = Math.min(userVolumeRef.current, 0.15);
    fadeVolume(audioRef.current.volume, targetVol, 800);
  }, [fadeVolume]);

  const unduck = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) return;
    if (!isDuckingRef.current) return;
    isDuckingRef.current = false;
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    fadeVolume(audioRef.current.volume, userVolumeRef.current, 1200);
  }, [fadeVolume]);

  const loadTrack = useCallback(
    (name: string, src: string, icon?: string) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      const audio = new Audio();
      audio.loop = true;
      audio.volume = userVolumeRef.current;
      audio.src = src;
      audioRef.current = audio;
      setMusicName(name);
      setMusicIcon(icon || "🎵");
      setMusicLoaded(true);
      audio.play();
      setIsPlaying(true);
    },
    [],
  );

  return {
    musicName,
    musicIcon,
    isPlaying,
    musicLoaded,
    volume,
    loadFile,
    loadTrack,
    togglePlayback,
    setVolume,
    duck,
    unduck,
  };
}