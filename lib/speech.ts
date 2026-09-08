import { PREFERRED_VOICE_NAMES, FEMALE_VOICE_KEYWORDS } from "@/constants/workout";

let femaleVoice: SpeechSynthesisVoice | null = null;

export function findFemaleVoice(): SpeechSynthesisVoice | null {
  if (femaleVoice) return femaleVoice;
  const voices = speechSynthesis.getVoices();

  for (const pref of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name.toLowerCase().includes(pref));
    if (match) {
      femaleVoice = match;
      return femaleVoice;
    }
  }

  for (const kw of FEMALE_VOICE_KEYWORDS) {
    const match = voices.find((v) => v.name.toLowerCase().includes(kw));
    if (match) {
      femaleVoice = match;
      return femaleVoice;
    }
  }

  const nonDefault = voices.find((v) => !v.default && v.lang.startsWith("en"));
  if (nonDefault) {
    femaleVoice = nonDefault;
    return femaleVoice;
  }

  return null;
}

export function resetVoice(): void {
  femaleVoice = null;
  findFemaleVoice();
}

let speechUnlocked = false;

export function unlockSpeech(): void {
  if (speechUnlocked) return;
  try {
    findFemaleVoice();
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    speechSynthesis.speak(u);
    speechUnlocked = true;
  } catch (e) {}
}

export function speak(
  text: string,
  onDuck: () => void,
  onUnduck: () => void,
): void {
  if (!speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1.1;
  u.volume = 1;
  const voice = findFemaleVoice();
  if (voice) u.voice = voice;
  onDuck();
  u.onend = () => onUnduck();
  u.onerror = () => onUnduck();
  speechSynthesis.speak(u);
}
