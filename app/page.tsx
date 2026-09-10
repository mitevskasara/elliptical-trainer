"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import MusicBar from "@/components/MusicBar";
import LevelDisplay from "@/components/LevelDisplay";
import TimerRing from "@/components/TimerRing";
import Progress from "@/components/Progress";
import Controls from "@/components/Controls";
import SettingsModal from "@/components/SettingsModal";
import ProgramPanel from "@/components/ProgramPanel";
import CompletedOverlay from "@/components/CompletedOverlay";
import FloatingEmojis from "@/components/FloatingEmojis";
import Toast from "@/components/Toast";
import { useWorkout } from "@/hooks/useWorkout";
import { useMusic } from "@/hooks/useMusic";
import { useToast } from "@/hooks/useToast";
import { formatCompletionStats } from "@/lib/helpers";

export default function Home() {
  const [programOpen, setProgramOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setThemeState] = useState("dark");
  const { message, showToast } = useToast();

  const handleThemeChange = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("trainer-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("trainer-theme") || "dark";
    setThemeState(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const music = useMusic();
  const workout = useWorkout({ duck: music.duck, unduck: music.unduck });

  useEffect(() => {
    if (workout.isComplete && music.musicLoaded && music.isPlaying) {
      music.togglePlayback();
    }
  }, [workout.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const musicWasPlayingRef = useRef(false);

  useEffect(() => {
    if (workout.isPaused && music.musicLoaded && music.isPlaying) {
      musicWasPlayingRef.current = true;
      music.togglePlayback();
    }
  }, [workout.isPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!workout.isPaused && workout.isRunning && music.musicLoaded && !music.isPlaying && musicWasPlayingRef.current) {
      musicWasPlayingRef.current = false;
      music.togglePlayback();
    }
    if (!workout.isPaused && workout.isRunning) {
      musicWasPlayingRef.current = false;
    }
  }, [workout.isPaused, workout.isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    if (workout.workout.length === 0) {
      showToast("Add intervals first!");
      return;
    }
    workout.controls.start();
    if (music.musicLoaded && !music.isPlaying) {
      music.togglePlayback();
    }
  }, [music.isPlaying, music.musicLoaded, music.togglePlayback, showToast, workout.workout.length, workout.controls]);

  const handleReset = useCallback(() => {
    workout.controls.reset();
    if (music.musicLoaded && music.isPlaying) {
      music.togglePlayback();
    }
  }, [music.isPlaying, music.musicLoaded, music.togglePlayback, workout.controls]);

  const completionStats = formatCompletionStats(workout.workout);
  const currentTotalSeconds = workout.currentItem?.duration ?? 0;

  return (
    <div className="app">
      <Header
        workoutLevel={workout.workoutLevel}
        onOpenProgram={() => setProgramOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <MusicBar
        musicName={music.musicName}
        musicIcon={music.musicIcon}
        isPlaying={music.isPlaying}
        musicLoaded={music.musicLoaded}
        volume={music.volume}
        savedYouTubeUrls={music.savedYouTubeUrls}
        onLoadFile={music.loadFile}
        onSelectTrack={music.loadTrack}
        onYouTubeUrl={music.loadYouTube}
        onRemoveYouTubeUrl={music.removeYouTubeUrl}
        onTogglePlayback={music.togglePlayback}
        onVolumeChange={music.setVolume}
      />

      <section className="dashboard">
        <LevelDisplay
          currentItem={workout.currentItem}
          nextItem={workout.nextItem}
          remainingSeconds={workout.remainingSeconds}
          isRunning={workout.isRunning}
          isPaused={workout.isPaused}
          isComplete={workout.isComplete}
        />

        <TimerRing
          remainingSeconds={workout.remainingSeconds}
          totalSeconds={currentTotalSeconds}
        />

        <Progress
          totalPercent={workout.totalPercent}
          intervalCountLabel={workout.intervalCountLabel}
        />
      </section>

      <Controls
        isRunning={workout.isRunning}
        isPaused={workout.isPaused}
        onStart={handleStart}
        onPause={workout.controls.pause}
        onResume={workout.controls.resume}
        onReset={handleReset}
      />

      <ProgramPanel
        open={programOpen}
        workout={workout.workout}
        currentIdx={workout.currentIdx}
        isRunning={workout.isRunning}
        isPaused={workout.isPaused}
        onClose={() => setProgramOpen(false)}
        onJump={workout.controls.jumpTo}
      />

      <SettingsModal
        open={settingsOpen}
        theme={theme}
        workoutLevel={workout.workoutLevel}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={handleThemeChange}
        onWorkoutChange={workout.controls.setWorkoutLevel}
        onSaveCustomWorkout={workout.controls.saveCustomWorkout}
      />

      <CompletedOverlay
        show={workout.isComplete}
        statsText={completionStats}
        onDone={handleReset}
      />

      <Toast message={message} />

      <FloatingEmojis active={workout.isRunning && !workout.isPaused && !workout.isComplete} />

      <div className={`paused-overlay${workout.isPaused ? " show" : ""}`} />
    </div>
  );
}
