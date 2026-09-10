"use client";

import { useState } from "react";
import Modal from "./Modal";
import { WORKOUTS, WORKOUT_LABELS, WorkoutLevel } from "@/constants/workout";
import { WorkoutInterval } from "@/types/workout";

interface SettingsModalProps {
  open: boolean;
  theme: string;
  workoutLevel: WorkoutLevel;
  onClose: () => void;
  onThemeChange: (theme: string) => void;
  onWorkoutChange: (level: WorkoutLevel) => void;
  onSaveCustomWorkout: (intervals: WorkoutInterval[]) => void;
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

const LABEL_OPTIONS = [
  "Warm-Up",
  "Work Interval",
  "Recovery",
  "Active Recovery",
  "Peak Interval",
  "Cool-Down",
];

function createEmptyInterval(): WorkoutInterval {
  return { label: "Work Interval", duration: 120, resistance: 5, description: "" };
}

export default function SettingsModal({
  open,
  theme,
  workoutLevel,
  onClose,
  onThemeChange,
  onWorkoutChange,
  onSaveCustomWorkout,
}: SettingsModalProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIntervals, setCustomIntervals] = useState<WorkoutInterval[]>([
    createEmptyInterval(),
  ]);

  const handleAddInterval = () => {
    setCustomIntervals([...customIntervals, createEmptyInterval()]);
  };

  const handleRemoveInterval = (idx: number) => {
    setCustomIntervals(customIntervals.filter((_, i) => i !== idx));
  };

  const handleUpdateInterval = (
    idx: number,
    field: keyof WorkoutInterval,
    value: string | number,
  ) => {
    const updated = [...customIntervals];
    updated[idx] = { ...updated[idx], [field]: value };
    setCustomIntervals(updated);
  };

  const handleSaveCustom = () => {
    if (customIntervals.length === 0) return;
    onSaveCustomWorkout(customIntervals);
    setShowCustomForm(false);
    onClose();
  };

  const handleCustomClick = () => {
    setCustomIntervals([createEmptyInterval()]);
    setShowCustomForm(true);
  };

  if (showCustomForm) {
    return (
      <Modal open={open} title="Custom Workout" onClose={() => setShowCustomForm(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {customIntervals.map((interval, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--surface2)",
              }}
            >
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <select
                  value={interval.label}
                  onChange={(e) => handleUpdateInterval(idx, "label", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--surface)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: ".8rem",
                  }}
                >
                  {LABEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveInterval(idx)}
                  style={{
                    background: "var(--surface)",
                    color: "var(--muted)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: ".8rem",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".65rem", color: "var(--muted)", marginBottom: "2px" }}>
                    Duration (sec)
                  </div>
                  <input
                    type="number"
                    value={interval.duration}
                    onChange={(e) =>
                      handleUpdateInterval(
                        idx,
                        "duration",
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid var(--surface)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: ".8rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: ".65rem", color: "var(--muted)", marginBottom: "2px" }}>
                    Resistance (1-10)
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={interval.resistance}
                    onChange={(e) =>
                      handleUpdateInterval(
                        idx,
                        "resistance",
                        Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid var(--surface)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      fontSize: ".8rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={interval.description}
                onChange={(e) => handleUpdateInterval(idx, "description", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--surface)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: ".8rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <button
            onClick={handleAddInterval}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px dashed var(--surface)",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: ".85rem",
            }}
          >
            + Add Interval
          </button>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={() => setShowCustomForm(false)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: "var(--surface2)",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: ".85rem",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustom}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: "var(--surface2)",
                color: "var(--accent, #4A90D9)",
                cursor: "pointer",
                fontSize: ".85rem",
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className="settings-section">
        <div className="settings-section-title">Workout</div>
        <div className="theme-options">
          {Object.keys(WORKOUTS).map((level) => (
            <button
              key={level}
              className={`theme-option${workoutLevel === level ? " active" : ""}`}
              onClick={() => onWorkoutChange(level as WorkoutLevel)}
            >
              <div className="theme-option-name">{WORKOUT_LABELS[level as WorkoutLevel]}</div>
            </button>
          ))}
          <button
            className={`theme-option${workoutLevel === "custom" ? " active" : ""}`}
            onClick={handleCustomClick}
          >
            <div className="theme-option-name">{WORKOUT_LABELS.custom}</div>
          </button>
        </div>
      </div>
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
    </Modal>
  );
}
