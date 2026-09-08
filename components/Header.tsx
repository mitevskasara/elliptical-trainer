import { WakeLockStatus } from "@/hooks/useWorkout";

interface HeaderProps {
  wakeLock: WakeLockStatus;
  onOpenProgram: () => void;
  onOpenEditor: () => void;
}

export default function Header({ wakeLock, onOpenProgram, onOpenEditor }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">🚴</span>
        <h1>20-Min Fat-Burn: 2:1</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button className="see-program-btn" onClick={onOpenProgram}>
          <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
          Program
        </button>
        <span className={`wake-badge${wakeLock.state === "active" ? " active" : ""}`}>{wakeLock.text}</span>
        <button className="settings-btn" onClick={onOpenEditor} aria-label="Edit workout">⚙</button>
      </div>
    </header>
  );
}