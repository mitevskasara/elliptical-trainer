"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import MusicBar from "@/components/MusicBar";
import LevelDisplay from "@/components/LevelDisplay";
import TimerRing from "@/components/TimerRing";
import Progress from "@/components/Progress";
import Controls from "@/components/Controls";
import EditorModal from "@/components/EditorModal";
import ProgramPanel from "@/components/ProgramPanel";
import CompletedOverlay from "@/components/CompletedOverlay";
import Toast from "@/components/Toast";
import { useWorkout } from "@/hooks/useWorkout";
import { useMusic } from "@/hooks/useMusic";
import { useToast } from "@/hooks/useToast";
import { formatCompletionStats } from "@/lib/helpers";

export default function Home() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const { message, showToast } = useToast();
  const music = useMusic();
  const workout = useWorkout({ duck: music.duck, unduck: music.unduck });

  useEffect(() => {
    if (workout.isComplete && music.musicLoaded && music.isPlaying) {
      music.togglePlayback();
    }
  }, [workout.isComplete]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSaveWorkout = useCallback(
    (w: Parameters<typeof workout.controls.saveWorkout>[0]) => {
      workout.controls.saveWorkout(w);
      showToast("Workout saved!");
    },
    [showToast, workout.controls],
  );

  const completionStats = formatCompletionStats(workout.workout);
  const currentTotalSeconds = workout.currentItem?.duration ?? 0;

  return (
    <div className="app">
      <Header
        wakeLock={workout.wakeLock}
        onOpenProgram={() => setProgramOpen(true)}
        onOpenEditor={() => setEditorOpen(true)}
      />

      <MusicBar
        musicName={music.musicName}
        isPlaying={music.isPlaying}
        musicLoaded={music.musicLoaded}
        volume={music.volume}
        onLoadFile={music.loadFile}
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

      <EditorModal
        open={editorOpen}
        workout={workout.workout}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveWorkout}
      />

      <CompletedOverlay
        show={workout.isComplete}
        statsText={completionStats}
        onDone={handleReset}
      />

      <Toast message={message} />
    </div>
  );
}