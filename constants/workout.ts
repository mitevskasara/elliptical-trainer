import { WorkoutInterval } from "@/types/workout";

export type WorkoutLevel = "standard" | "intense" | "hardcode";

export const WORKOUTS: Record<WorkoutLevel, WorkoutInterval[]> = {
  standard: [
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
  ],
  intense: [
  { label: "Warm-Up", duration: 180, resistance: 3, description: "Gradual ramp-up to elevate core temperature and heart rate." },
  { label: "Work Interval", duration: 150, resistance: 5, description: "Sustained powerful pace. Building aerobic endurance." },
  { label: "Active Recovery", duration: 45, resistance: 3, description: "Keep legs moving; don't let the heart rate drop too fast." },
  { label: "Work Interval", duration: 150, resistance: 6, description: "Fast & Powerful. Push through the heels to engage glutes and quads." },
  { label: "Active Recovery", duration: 45, resistance: 3, description: "Steady breath catch." },
  { label: "Work Interval", duration: 150, resistance: 6, description: "Reverse pedaling. Heavy focus on hamstrings and posterior chain." },
  { label: "Active Recovery", duration: 45, resistance: 3, description: "Maintain momentum." },
  { label: "Work Interval", duration: 150, resistance: 7, description: "High Intensity. Dig deep, maintain a strong cadence against heavy drag." },
  { label: "Active Recovery", duration: 45, resistance: 3, description: "Final brief recovery before the surge." },
  { label: "Peak Interval", duration: 150, resistance: 8, description: "Max Fat-Burn Surge. Maximum effort, heavy resistance climb." },
  { label: "Cool-Down", duration: 180, resistance: 2, description: "Gradual deceleration to safely lower heart rate." },
],
  hardcode: [
  { label: "Warm-Up", duration: 180, resistance: 3, description: "Fast ramp-up to prime the central nervous system." },
  { label: "Work Interval", duration: 180, resistance: 6, description: "Aggressive pace. Heavy sustained power output." },
  { label: "Active Recovery", duration: 30, resistance: 3, description: "Minimal rest. Keep the legs churning." },
  { label: "Work Interval", duration: 180, resistance: 7, description: "High resistance grind. Push hard through the heels." },
  { label: "Active Recovery", duration: 30, resistance: 3, description: "Breathe through it, maintain cadence." },
  { label: "Work Interval", duration: 180, resistance: 7, description: "Reverse pedaling. Maximum hamstring and glute recruitment." },
  { label: "Active Recovery", duration: 30, resistance: 3, description: "Quick transition. Stay mentally locked in." },
  { label: "Work Interval", duration: 180, resistance: 8, description: "Brutal climb. Deep fatigue setting in, fight for every stride." },
  { label: "Active Recovery", duration: 30, resistance: 4, description: "Scant recovery. Heart rate stays pinned." },
  { label: "Peak Interval", duration: 180, resistance: 9, description: "All-Out Max Burn. Maximum sustainable wattage to finish strong." },
  { label: "Cool-Down", duration: 180, resistance: 2, description: "Deep breathing, flushing out lactic acid." },
],
};

export const WORKOUT_LABELS: Record<WorkoutLevel, string> = {
  standard: "Standard",
  intense: "Intense",
  hardcode: "Hardcode",
};

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
