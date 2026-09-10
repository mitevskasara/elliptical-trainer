import { WorkoutInterval } from "@/types/workout";

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatMilliseconds(ms: number): string {
  return String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
}

export function formatDurationString(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return mm > 0 ? `${mm}m${ss > 0 ? " " + ss + "s" : ""}` : `${ss}s`;
}

export function totalWorkoutSeconds(workout: WorkoutInterval[]): number {
  return workout.reduce((sum, item) => sum + item.duration, 0);
}

export function elapsedSeconds(
  workout: WorkoutInterval[],
  currentIdx: number,
  timeLeft: number,
): number {
  let elapsed = 0;
  for (let i = 0; i < currentIdx; i++) elapsed += workout[i].duration;
  elapsed += (workout[currentIdx]?.duration || 0) - timeLeft;
  return elapsed;
}

export function formatCompletionStats(workout: WorkoutInterval[]): string {
  const total = totalWorkoutSeconds(workout);
  return `${workout.length} intervals · ${Math.floor(total / 60)}m ${total % 60}s total`;
}

export function parseWorkoutJson(json: string): WorkoutInterval[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Need at least one interval");
  }
  parsed.forEach((item: any, i: number) => {
    if (!item.label || typeof item.label !== "string") {
      throw new Error(`Item ${i}: label is required (string)`);
    }
    if (!item.duration || typeof item.duration !== "number" || item.duration < 1) {
      throw new Error(`Item ${i}: duration must be a positive number`);
    }
    if (item.resistance === undefined || typeof item.resistance !== "number") {
      throw new Error(`Item ${i}: resistance is required (number)`);
    }
  });
  return parsed.map((item: any) => ({
    label: item.label,
    duration: item.duration,
    resistance: item.resistance,
    description: item.description || item.label,
  }));
}
