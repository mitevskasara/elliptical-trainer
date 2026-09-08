"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMusicResult {
  musicName: string;
  isPlaying: boolean;
  musicLoaded: boolean;
  volume: number;
  loadFile: (file: File) => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  duck: () => void;
  unduck: () => void;
}

export function useMusic(): UseMusicResult {
  const [musicName, setMusicName] = useState("No music loaded");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const [volume, setVolumeState] = useState(70);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userVolumeRef = useRef(0.7);
  const isDuckingRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
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
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.volume = userVolumeRef.current;
      objectUrlRef.current = url;
      audioRef.current = audio;

      setMusicName(file.name.replace(/\.[^.]+$/, ""));
      setMusicLoaded(true);
      setIsPlaying(false);
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

  const duck = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) return;
    isDuckingRef.current = true;
    audioRef.current.volume = Math.min(userVolumeRef.current, 0.15);
  }, []);

  const unduck = useCallback(() => {
    if (!isDuckingRef.current) return;
    isDuckingRef.current = false;
    if (audioRef.current) {
      audioRef.current.volume = userVolumeRef.current;
    }
  }, []);

  return {
    musicName,
    isPlaying,
    musicLoaded,
    volume,
    loadFile,
    togglePlayback,
    setVolume,
    duck,
    unduck,
  };
}