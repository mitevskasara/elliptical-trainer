import { WorkoutInterval } from "@/types/workout";

interface LevelDisplayProps {
  currentItem: WorkoutInterval | undefined;
  nextItem: WorkoutInterval | undefined;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

export default function LevelDisplay({
  currentItem,
  nextItem,
  remainingSeconds,
  isRunning,
  isPaused,
  isComplete,
}: LevelDisplayProps) {
  const isActive = isRunning || isPaused || remainingSeconds > 0;

  let currentLabel: string;
  let currentLevel: string;

  if (isComplete) {
    currentLabel = "Workout Complete!";
    currentLevel = "🎉";
  } else if (isPaused) {
    currentLabel = "Paused";
    currentLevel = currentItem ? `L${currentItem.resistance}` : "—";
  } else if (isActive) {
    currentLabel = currentItem?.label ?? "Ready";
    currentLevel = currentItem ? `L${currentItem.resistance}` : "—";
  } else {
    currentLabel = "Ready";
    currentLevel = "—";
  }

  return (
    <div className="level-row">
      <div className="level-current">
        <div className="level-current-label">{currentLabel}</div>
        <div className="level-current-num">{currentLevel}</div>
      </div>
      {nextItem && (
        <div className="level-next">
          <div className="level-next-label">NEXT</div>
          <div className="level-next-num">L{nextItem.resistance}</div>
          <div className="level-next-name">{nextItem.label}</div>
        </div>
      )}
    </div>
  );
}
