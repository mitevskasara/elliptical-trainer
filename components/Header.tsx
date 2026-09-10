import { WorkoutLevel, WORKOUT_LABELS } from "@/constants/workout";

interface HeaderProps {
  workoutLevel: WorkoutLevel;
  onOpenProgram: () => void;
  onOpenSettings: () => void;
}

export default function Header({ workoutLevel, onOpenProgram, onOpenSettings }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">🔥</span>
        <h1 className="header-title" onClick={onOpenSettings}>
          {WORKOUT_LABELS[workoutLevel].replace(/^[^\w\s]+ /, "")}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button className="see-program-btn" onClick={onOpenProgram}>
          <svg viewBox="0 0 24 24">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
          Program
        </button>
        <button className="settings-btn" onClick={onOpenSettings} aria-label="Settings">
          ⚙
        </button>
      </div>
    </header>
  );
}
