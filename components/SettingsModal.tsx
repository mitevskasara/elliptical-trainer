"use client";

import Modal from "./Modal";
import { WORKOUTS, WORKOUT_LABELS, WorkoutLevel } from "@/constants/workout";

interface SettingsModalProps {
  open: boolean;
  theme: string;
  workoutLevel: WorkoutLevel;
  onClose: () => void;
  onThemeChange: (theme: string) => void;
  onWorkoutChange: (level: WorkoutLevel) => void;
}

const themes = [
  {
    id: "blue",
    name: "Blue",
    colors: ["#E8C88A", "#4A7A9A", "#89B4D4", "#79A4C4"],
  },
  {
    id: "green",
    name: "Green",
    colors: ["#FFE066", "#2A7C13", "#7FB77E", "#6FA86E"],
  },
  {
    id: "dark",
    name: "Dark",
    colors: ["#7eb8d0", "#5a8a9a", "#1c1c1e", "#2c2c2e"],
  },
];

export default function SettingsModal({
  open,
  theme,
  workoutLevel,
  onClose,
  onThemeChange,
  onWorkoutChange,
}: SettingsModalProps) {
  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className="settings-section">
        <div className="settings-section-title">Theme</div>
        <div className="theme-options">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-option${theme === t.id ? " active" : ""}`}
              onClick={() => onThemeChange(t.id)}
            >
              <div className="theme-option-name">{t.name}</div>
              <div className="theme-option-preview">
                {t.colors.map((c, i) => (
                  <div key={i} className="theme-swatch" style={{ background: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-section-title">Workout</div>
        <div className="theme-options">
          {Object.keys(WORKOUTS).map((level) => (
            <button
              key={level}
              className={`theme-option${workoutLevel === level ? " active" : ""}`}
              onClick={() => onWorkoutChange(level as WorkoutLevel)}
            >
              <div className="theme-option-name">{WORKOUT_LABELS[level]}</div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
