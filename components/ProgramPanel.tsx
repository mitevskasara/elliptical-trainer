"use client";

import { WorkoutInterval } from "@/types/workout";
import { formatDurationString } from "@/lib/helpers";

interface ProgramPanelProps {
  open: boolean;
  workout: WorkoutInterval[];
  currentIdx: number;
  isRunning: boolean;
  isPaused: boolean;
  onClose: () => void;
  onJump: (idx: number) => void;
}

export default function ProgramPanel({
  open,
  workout,
  currentIdx,
  isRunning,
  isPaused,
  onClose,
  onJump,
}: ProgramPanelProps) {
  const canJump = !isRunning && !isPaused;

  return (
    <div
      className={`program-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="program-panel">
        <div className="program-panel-header">
          <h2>Workout Program</h2>
          <button className="program-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="program-list">
          {workout.map((item, i) => {
            const isActive = i === currentIdx && (isRunning || isPaused);
            const isDone = i < currentIdx;
            return (
              <div
                key={i}
                className={`program-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}
                onClick={() => {
                  if (canJump) {
                    onJump(i);
                    onClose();
                  }
                }}
              >
                <div className="program-num">{isDone ? "✓" : i + 1}</div>
                <div className="program-info">
                  <div className="program-name">{item.label}</div>
                  <div className="program-desc">{item.description}</div>
                </div>
                <div className="program-meta">
                  <div className="res">L{item.resistance}</div>
                  <div>{formatDurationString(item.duration)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
