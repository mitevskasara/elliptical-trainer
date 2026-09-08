import { WorkoutInterval } from "@/types/workout";

export const DEFAULT_WORKOUT: WorkoutInterval[] = [
  { label: "Warm-Up", duration: 180, resistance: 2, description: "Comfortable, easy pace to wake up the joints." },
  { label: "Work Interval", duration: 120, resistance: 4, description: "Fast & Powerful. Push and pull hard." },
  { label: "Recovery", duration: 60, resistance: 2, description: "Slow down, catch your breath." },
  { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Focus on pushing through the heels." },
  { label: "Recovery", duration: 60, resistance: 3, description: "Steady, easy pedaling." },
  { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Move in reverse, optional, targets hamstrings." },
  { label: "Recovery", duration: 60, resistance: 3, description: "Catch your breath." },
  { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Give it everything you've got." },
  { label: "Recovery", duration: 60, resistance: 3, description: "Steady recovery." },
  { label: "Peak Interval", duration: 120, resistance: 6, description: "Heavy Burn. Slower pace, but maximum muscle push." },
  { label: "Cool-Down", duration: 180, resistance: 2, description: "Slow pedaling to bring your heart rate down." },
];

export const STORAGE_KEY = "elliptical_workout_v2";

export const TIMER_RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

export const PREFERRED_VOICE_NAMES = [
  "samantha", "karen", "moira", "tessa", "zira", "hazel",
  "google uk english female", "google us english", "microsoft zira",
  "microsoft hazel", "siri", "google español", "female",
];

export const FEMALE_VOICE_KEYWORDS = [
  "female", "woman", "samantha", "karen", "zira", "hazel", "moira", "tessa",
];
