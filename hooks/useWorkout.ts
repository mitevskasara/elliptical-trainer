"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WorkoutInterval } from "@/types/workout";
import { DEFAULT_WORKOUT, STORAGE_KEY } from "@/constants/workout";
import { beep, countdownBeep } from "@/lib/audio";
import { findFemaleVoice, speak, unlockSpeech } from "@/lib/speech";
import { elapsedSeconds, totalWorkoutSeconds } from "@/lib/helpers";

interface DuckHandlers {
  duck: () => void;
  unduck: () => void;
}

export interface WakeLockStatus {
  state: "inactive" | "active";
  text: string;
}

interface WorkoutControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  jumpTo: (idx: number) => void;
  saveWorkout: (workout: WorkoutInterval[]) => void;
}

export interface UseWorkoutResult {
  workout: WorkoutInterval[];
  currentIdx: number;
  currentItem: WorkoutInterval | undefined;
  nextItem: WorkoutInterval | undefined;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  totalPercent: number;
  intervalCountLabel: string;
  wakeLock: WakeLockStatus;
  controls: WorkoutControls;
}

function loadWorkout(): WorkoutInterval[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].duration) {
        return parsed as WorkoutInterval[];
      }
    }
  } catch (e) {}
  return structuredClone(DEFAULT_WORKOUT);
}

export function useWorkout(duckHandlers?: DuckHandlers): UseWorkoutResult {
  const [workout, setWorkout] = useState<WorkoutInterval[]>(() =>
    structuredClone(DEFAULT_WORKOUT),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPercent, setTotalPercent] = useState(0);
  const [wakeLock, setWakeLock] = useState<WakeLockStatus>({
    state: "inactive",
    text: "⚡ Wake",
  });

  const workoutRef = useRef(workout);
  const currentIdxRef = useRef(0);
  const remainingMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastSecondRef = useRef(-1);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const duckHandlersRef = useRef<DuckHandlers>({ duck: () => {}, unduck: () => {} });

  const startIntervalRef = useRef<() => void>(() => {});
  const finishWorkoutRef = useRef<() => void>(() => {});
  const advanceIntervalRef = useRef<() => void>(() => {});

  useEffect(() => {
    duckHandlersRef.current = duckHandlers ?? { duck: () => {}, unduck: () => {} };
  }, [duckHandlers]);

  const clearIntervalRef = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        const lock = await navigator.wakeLock.request("screen");
        wakeLockRef.current = lock;
        setWakeLock({ state: "active", text: "⚡ Screen awake" });
        lock.addEventListener("release", () => {
          setWakeLock({ state: "inactive", text: "⚡ Wake" });
        });
      }
    } catch (e) {
      setWakeLock({ state: "inactive", text: "⚡ Wake N/A" });
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (e) {}
      wakeLockRef.current = null;
    }
    setWakeLock({ state: "inactive", text: "⚡ Wake" });
  }, []);

  const syncUiState = useCallback(() => {
    const total = totalWorkoutSeconds(workoutRef.current);
    const elapsed = elapsedSeconds(
      workoutRef.current,
      currentIdxRef.current,
      Math.max(0, Math.ceil(remainingMsRef.current / 1000)),
    );
    const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
    setRemainingSeconds(Math.max(0, Math.ceil(remainingMsRef.current / 1000)));
    setTotalPercent(pct);
  }, []);

  const setRunningState = useCallback((running: boolean, paused: boolean) => {
    runningRef.current = running;
    pausedRef.current = paused;
    setIsRunning(running);
    setIsPaused(paused);
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;
    remainingMsRef.current -= delta;

    const currentSec = Math.ceil(remainingMsRef.current / 1000);

    if (currentSec !== lastSecondRef.current && currentSec <= 3 && currentSec > 0) {
      countdownBeep(currentSec);
      speak(`${currentSec}`, duckHandlersRef.current.duck, duckHandlersRef.current.unduck);
    }
    lastSecondRef.current = currentSec;

    syncUiState();

    if (remainingMsRef.current <= 0) {
      advanceIntervalRef.current();
    }
  }, [syncUiState]);

  const finishWorkout = useCallback(() => {
    setRunningState(false, false);
    setIsComplete(true);
    setRemainingSeconds(0);
    setTotalPercent(100);
    speak("Workout complete. Great job!", duckHandlersRef.current.duck, duckHandlersRef.current.unduck);
    releaseWakeLock();
    clearIntervalRef();
  }, [clearIntervalRef, releaseWakeLock, setRunningState]);

  const startInterval = useCallback(() => {
    if (currentIdxRef.current >= workoutRef.current.length) {
      finishWorkoutRef.current();
      return;
    }
    const item = workoutRef.current[currentIdxRef.current];
    remainingMsRef.current = item.duration * 1000;
    lastSecondRef.current = -1;
    lastTickRef.current = performance.now();
    setCurrentIdx(currentIdxRef.current);
    syncUiState();

    beep(520, 0.1);
    setTimeout(() => {
      speak(
        `Level ${item.resistance}. ${item.label}. ${item.description}.`,
        duckHandlersRef.current.duck,
        duckHandlersRef.current.unduck,
      );
    }, 150);

    clearIntervalRef();
    intervalIdRef.current = setInterval(tick, 50);
  }, [clearIntervalRef, syncUiState, tick]);

  const advanceInterval = useCallback(() => {
    clearIntervalRef();
    beep(1000, 0.15);
    currentIdxRef.current += 1;
    if (currentIdxRef.current >= workoutRef.current.length) {
      finishWorkoutRef.current();
    } else {
      startIntervalRef.current();
    }
  }, [clearIntervalRef]);

  const start = useCallback(() => {
    unlockSpeech();
    if (workoutRef.current.length === 0) return;
    currentIdxRef.current = 0;
    setRunningState(true, false);
    setIsComplete(false);
    setRemainingSeconds(0);
    setTotalPercent(0);
    acquireWakeLock();
    startIntervalRef.current();
  }, [acquireWakeLock, setRunningState]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    setRunningState(false, true);
    setRemainingSeconds(Math.max(0, Math.ceil(remainingMsRef.current / 1000)));
    clearIntervalRef();
    speak("Paused", duckHandlersRef.current.duck, duckHandlersRef.current.unduck);
  }, [clearIntervalRef, setRunningState]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    setRunningState(true, false);
    acquireWakeLock();
    lastTickRef.current = performance.now();
    intervalIdRef.current = setInterval(tick, 50);
    speak("Resuming", duckHandlersRef.current.duck, duckHandlersRef.current.unduck);
  }, [acquireWakeLock, setRunningState, tick]);

  const reset = useCallback(() => {
    clearIntervalRef();
    setRunningState(false, false);
    setIsComplete(false);
    currentIdxRef.current = 0;
    remainingMsRef.current = 0;
    setCurrentIdx(0);
    setRemainingSeconds(0);
    setTotalPercent(0);
    releaseWakeLock();
  }, [clearIntervalRef, releaseWakeLock, setRunningState]);

  const jumpTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= workoutRef.current.length) return;
    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    startIntervalRef.current();
  }, []);

  const saveWorkout = useCallback((w: WorkoutInterval[]) => {
    workoutRef.current = w;
    setWorkout(w);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
    } catch (e) {}
  }, []);

  useEffect(() => {
    workoutRef.current = workout;
  }, [workout]);

  useEffect(() => {
    const saved = loadWorkout();
    setWorkout(saved);
    workoutRef.current = saved;
  }, []);

  useEffect(() => {
    startIntervalRef.current = startInterval;
    finishWorkoutRef.current = finishWorkout;
    advanceIntervalRef.current = advanceInterval;
  }, [startInterval, finishWorkout, advanceInterval]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && runningRef.current && !pausedRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [acquireWakeLock]);

  useEffect(() => {
    speechSynthesis.onvoiceschanged = () => {
      findFemaleVoice();
    };
    return () => {
      speechSynthesis.onvoiceschanged = null;
      clearIntervalRef();
      releaseWakeLock();
    };
  }, [clearIntervalRef, releaseWakeLock]);

  const currentItem = workout[currentIdx];
  const nextItem = workout[currentIdx + 1];
  const intervalCountLabel = `${currentIdx + 1} / ${workout.length} intervals`;

  return {
    workout,
    currentIdx,
    currentItem,
    nextItem,
    remainingSeconds,
    isRunning,
    isPaused,
    isComplete,
    totalPercent,
    intervalCountLabel,
    wakeLock,
    controls: {
      start,
      pause,
      resume,
      reset,
      jumpTo,
      saveWorkout,
    },
  };
}