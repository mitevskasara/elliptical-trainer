"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PRESET_TRACKS } from "@/constants/music";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: Record<string, unknown>,
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(vol: number): void;
  getVolume(): number;
  destroy(): void;
  getVideoData(): { title: string };
  getPlayerState?(): number;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export interface SavedYouTubeUrl {
  url: string;
  title: string;
}

export interface UseMusicResult {
  musicName: string;
  musicIcon: string;
  isPlaying: boolean;
  musicLoaded: boolean;
  volume: number;
  savedYouTubeUrls: SavedYouTubeUrl[];
  loadFile: (file: File) => void;
  loadTrack: (name: string, src: string, icon?: string) => void;
  loadYouTube: (url: string) => void;
  removeYouTubeUrl: (url: string) => void;
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
  const [savedYouTubeUrls, setSavedYouTubeUrls] = useState<SavedYouTubeUrl[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userVolumeRef = useRef(0.7);
  const isDuckingRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);
  const ytLoadingRef = useRef(false);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const usingYouTubeRef = useRef(false);
  const savedYtUrlsRef = useRef<SavedYouTubeUrl[]>([]);

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
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("trainer-yt-urls");
      if (stored) {
        const urls = JSON.parse(stored);
        setSavedYouTubeUrls(urls);
        savedYtUrlsRef.current = urls;
      }
    } catch {}
  }, []);

  const persistYouTubeUrls = useCallback((urls: SavedYouTubeUrl[]) => {
    savedYtUrlsRef.current = urls;
    setSavedYouTubeUrls(urls);
    try { localStorage.setItem("trainer-yt-urls", JSON.stringify(urls)); } catch {}
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("trainer-yt-urls");
    let urls: SavedYouTubeUrl[] = [];
    try {
      if (stored) {
        urls = JSON.parse(stored);
        setSavedYouTubeUrls(urls);
        savedYtUrlsRef.current = urls;
      }
    } catch {}

    if (urls.length > 0) {
      const last = urls[urls.length - 1];
      const videoId = extractVideoId(last.url);
      if (videoId) {
        setMusicIcon("▶️");
        setMusicName(`YouTube | ${last.title}`);
        setMusicLoaded(true);
        usingYouTubeRef.current = true;
        loadYouTubeApi().then(() => {
          const container = document.createElement("div");
          container.id = "yt-music-container";
          container.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;";
          document.body.appendChild(container);
          ytContainerRef.current = container;
          const playerDiv = document.createElement("div");
          playerDiv.id = "yt-music-player";
          container.appendChild(playerDiv);
          const YT = window.YT;
          new YT.Player("yt-music-player", {
            videoId,
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0 },
            events: {
              onReady: (e: { target: YTPlayer }) => {
                ytPlayerRef.current = e.target;
                e.target.setVolume(Math.round(userVolumeRef.current * 100));
              },
              onStateChange: (e: { data: number; target: YTPlayer }) => {
                if (e.data === 0) e.target.playVideo();
              },
            },
          }) as unknown as YTPlayer;
        });
        return;
      }
    }

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
    if (isDuckingRef.current) return;
    if (usingYouTubeRef.current && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(Math.round(userVolumeRef.current * 100));
    } else if (audioRef.current) {
      audioRef.current.volume = userVolumeRef.current;
    }
  }, []);

  const loadYouTubeApi = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (ytReadyRef.current) { resolve(); return; }
      if (ytLoadingRef.current) {
        const check = setInterval(() => {
          if (ytReadyRef.current) { clearInterval(check); resolve(); }
        }, 50);
        return;
      }
      ytLoadingRef.current = true;
      window.onYouTubeIframeAPIReady = () => {
        ytReadyRef.current = true;
        resolve();
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
      usingYouTubeRef.current = false;

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

  const loadYouTube = useCallback(
    (url: string) => {
      const videoId = extractVideoId(url);
      if (!videoId) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setMusicIcon("▶️");
      setMusicLoaded(true);
      usingYouTubeRef.current = true;

      const setupPlayer = () => {
        let container = ytContainerRef.current;
        if (!container) {
          container = document.createElement("div");
          container.id = "yt-music-container";
          container.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;";
          document.body.appendChild(container);
          ytContainerRef.current = container;
        }

        if (ytPlayerRef.current) {
          try { ytPlayerRef.current.destroy(); } catch {}
          ytPlayerRef.current = null;
        }

        const playerDiv = document.createElement("div");
        playerDiv.id = "yt-music-player";
        container.innerHTML = "";
        container.appendChild(playerDiv);

        const YT = window.YT;
        const player = new YT.Player("yt-music-player", {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (e: { target: YTPlayer }) => {
              ytPlayerRef.current = e.target;
              e.target.setVolume(Math.round(userVolumeRef.current * 100));
              const title = e.target.getVideoData()?.title;
              setMusicName(title ? `YouTube | ${title}` : "YouTube");
              if (title) {
                const prev = savedYtUrlsRef.current;
                persistYouTubeUrls([
                  ...prev.filter((s) => s.url !== url),
                  { url, title },
                ]);
              }
            },
            onStateChange: (e: { data: number; target: YTPlayer }) => {
              if (e.data === 0) {
                e.target.playVideo();
              }
            },
          },
        }) as unknown as YTPlayer;
      };

      loadYouTubeApi().then(setupPlayer);
    },
    [loadYouTubeApi],
  );

  const togglePlayback = useCallback(() => {
    if (usingYouTubeRef.current && ytPlayerRef.current) {
      const state = (ytPlayerRef.current as unknown as { getPlayerState?: () => number }).getPlayerState?.();
      if (state === 1) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
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

      if (usingYouTubeRef.current && ytPlayerRef.current) {
        const fromVol = Math.round(from * 100);
        const toVol = Math.round(to * 100);
        const steps = 20;
        const stepMs = durationMs / steps;
        let step = 0;
        ytPlayerRef.current.setVolume(fromVol);
        fadeIntervalRef.current = setInterval(() => {
          step++;
          const t = step / steps;
          const vol = Math.round(fromVol + (toVol - fromVol) * t);
          ytPlayerRef.current?.setVolume(vol);
          if (step >= steps) {
            clearInterval(fadeIntervalRef.current!);
            fadeIntervalRef.current = null;
            ytPlayerRef.current?.setVolume(toVol);
            done?.();
          }
        }, stepMs);
        return;
      }

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
    if (isDuckingRef.current) return;
    const active = usingYouTubeRef.current
      ? ytPlayerRef.current !== null
      : audioRef.current !== null && !audioRef.current.paused;
    if (!active) return;
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    isDuckingRef.current = true;
    const currentVol = usingYouTubeRef.current
      ? (ytPlayerRef.current!.getVolume() / 100)
      : audioRef.current!.volume;
    const targetVol = Math.min(currentVol, 0.15);
    fadeVolume(currentVol, targetVol, 800);
  }, [fadeVolume]);

  const unduck = useCallback(() => {
    if (!isDuckingRef.current) return;
    isDuckingRef.current = false;
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    const currentVol = usingYouTubeRef.current
      ? (ytPlayerRef.current!.getVolume() / 100)
      : audioRef.current!.volume;
    fadeVolume(currentVol, userVolumeRef.current, 1200);
  }, [fadeVolume]);

  const loadTrack = useCallback(
    (name: string, src: string, icon?: string) => {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
      usingYouTubeRef.current = false;

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

  const removeYouTubeUrl = useCallback(
    (url: string) => {
      persistYouTubeUrls(savedYtUrlsRef.current.filter((s) => s.url !== url));
    },
    [persistYouTubeUrls],
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && isPlaying) {
        if (usingYouTubeRef.current && ytPlayerRef.current) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  return {
    musicName,
    musicIcon,
    isPlaying,
    musicLoaded,
    volume,
    savedYouTubeUrls,
    loadFile,
    loadTrack,
    loadYouTube,
    removeYouTubeUrl,
    togglePlayback,
    setVolume,
    duck,
    unduck,
  };
}