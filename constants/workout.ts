import { WorkoutInterval } from "@/types/workout";

export type WorkoutLevel = "standard" | "intense" | "hardcode" | "custom";

export const WORKOUTS: Record<Exclude<WorkoutLevel, "custom">, WorkoutInterval[]> = {
  standard: [
    { label: "Warm-Up", duration: 180, resistance: 2, description: "Warm-Up, easy pace." },
    {
      label: "Work Interval",
      duration: 120,
      resistance: 4,
      description: "Fast & Powerful. Push and pull hard.",
    },
    {
      label: "Recovery",
      duration: 60,
      resistance: 2,
      description: "Slow down, catch your breath.",
    },
    { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful." },
    { label: "Recovery", duration: 60, resistance: 3, description: "Steady, easy pedaling." },
    {
      label: "Work Interval",
      duration: 120,
      resistance: 5,
      description: "Fast & Powerful. Move in reverse",
    },
    { label: "Recovery", duration: 60, resistance: 3, description: "Catch your breath." },
    {
      label: "Work Interval",
      duration: 120,
      resistance: 5,
      description: "Fast & Powerful. Give it all.",
    },
    { label: "Recovery", duration: 60, resistance: 3, description: "Steady recovery." },
    {
      label: "Peak Interval",
      duration: 120,
      resistance: 6,
      description: "Slower pace, maximum muscle push.",
    },
    {
      label: "Cool-Down",
      duration: 180,
      resistance: 2,
      description: "Slow pedaling. Bring heart rate down.",
    },
  ],
  intense: [
    { label: "Warm-Up", duration: 180, resistance: 3, description: "Gradual warm-up." },
    {
      label: "Work Interval",
      duration: 150,
      resistance: 5,
      description: "Sustained powerful pace.",
    },
    { label: "Active Recovery", duration: 45, resistance: 3, description: "Keep legs moving." },
    { label: "Work Interval", duration: 150, resistance: 6, description: "Fast & Powerful." },
    { label: "Active Recovery", duration: 45, resistance: 3, description: "Steady breath catch." },
    { label: "Work Interval", duration: 150, resistance: 6, description: "Reverse pedaling." },
    { label: "Active Recovery", duration: 45, resistance: 3, description: "Maintain momentum." },
    { label: "Work Interval", duration: 150, resistance: 7, description: "High Intensity." },
    {
      label: "Active Recovery",
      duration: 45,
      resistance: 3,
      description: "Brief recovery before the surge.",
    },
    {
      label: "Peak Interval",
      duration: 150,
      resistance: 8,
      description: "Max Burn. Heavy resistance climb.",
    },
    {
      label: "Cool-Down",
      duration: 180,
      resistance: 2,
      description: "Gradual slow-down. Lower heart rate.",
    },
  ],
  hardcode: [
    {
      label: "Warm-Up",
      duration: 180,
      resistance: 3,
      description: "Fast ramp-up. Prime the nervous system.",
    },
    {
      label: "Work Interval",
      duration: 180,
      resistance: 6,
      description: "Aggressive pace. Heavy power output.",
    },
    {
      label: "Active Recovery",
      duration: 30,
      resistance: 3,
      description: "Minimal rest. Keep legs churning.",
    },
    {
      label: "Work Interval",
      duration: 180,
      resistance: 7,
      description: "High resistance. Push through heels.",
    },
    {
      label: "Active Recovery",
      duration: 30,
      resistance: 3,
      description: "Breathe through. Maintain cadence.",
    },
    {
      label: "Work Interval",
      duration: 180,
      resistance: 7,
      description: "Reverse pedaling. Maximum hamstring burn.",
    },
    {
      label: "Active Recovery",
      duration: 30,
      resistance: 3,
      description: "Quick transition. Stay locked in.",
    },
    {
      label: "Work Interval",
      duration: 180,
      resistance: 8,
      description: "Brutal climb. Fight for every stride.",
    },
    {
      label: "Active Recovery",
      duration: 30,
      resistance: 4,
      description: "Scant recovery. Heart rate stays pinned.",
    },
    {
      label: "Peak Interval",
      duration: 180,
      resistance: 9,
      description: "All-Out Max Burn. Finish strong.",
    },
    {
      label: "Cool-Down",
      duration: 180,
      resistance: 2,
      description: "Deep breathing. Flush out lactic acid.",
    },
  ],
};

export const WORKOUT_LABELS: Record<WorkoutLevel, string> = {
  standard: "Standard",
  intense: "Intense",
  hardcode: "Hardcode",
  custom: "➕ Custom",
};

export const STORAGE_KEY = "elliptical_workout_v2";
export const CUSTOM_WORKOUT_KEY = "elliptical_custom_workout";

export const TIMER_RADIUS = 120;
export const CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

export const PREFERRED_VOICE_NAMES = [
  "samantha",
  "karen",
  "moira",
  "tessa",
  "zira",
  "hazel",
  "google uk english female",
  "google us english",
  "microsoft zira",
  "microsoft hazel",
  "siri",
  "google español",
  "female",
];

export const FEMALE_VOICE_KEYWORDS = [
  "female",
  "woman",
  "samantha",
  "karen",
  "zira",
  "hazel",
  "moira",
  "tessa",
];
