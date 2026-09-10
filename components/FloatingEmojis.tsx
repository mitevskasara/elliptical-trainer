"use client";

import { useEffect, useRef, useState } from "react";

const EMOJIS = [
  "🥗",
  "🍎",
  "🥕",
  "🍇",
  "🍊",
  "🍌",
  "🍋",
  "🍓",
  "🫐",
  "🍈",
  "🍒",
  "🍑",
  "🥭",
  "🍍",
  "🥥",
  "🥝",
  "🍅",
  "🍆",
  "🥑",
  "🥦",
  "🥬",
  "🥒",
  "🌶️",
  "🫑",
  "🌽",
  "🫒",
  "🥚",
  "🍳",
  "🍠",
  "🍉",
  "🥔",
  "💪",
  "🔥",
  "⚡",
  "🏆",
  "👊",
  "🦵",
  "🏋️‍♀️",
  "🥇",
];

const FIRST_BATCH_DELAY_MS = 60000; // 1 minute before first batch
const BATCH_INTERVAL_MIN_MS = 60000; // 2 minutes between batches
const BATCH_INTERVAL_MAX_MS = 240000; // 4 minutes between batches
const BATCH_SIZE_MIN = 2; // min emojis per batch
const BATCH_SIZE_MAX = 4; // max emojis per batch
const EMOJI_MIN_DURATION_S = 6; // 6 seconds
const EMOJI_MAX_DURATION_S = 12; // 12 seconds
const EMOJI_MIN_SIZE_REM = 2.0;
const EMOJI_MAX_SIZE_REM = 3.5;
const EMOJI_MIN_TOP_PERCENT = 10;
const EMOJI_MAX_TOP_SPREAD_PERCENT = 80;
const EMOJI_CLEANUP_DELAY_MS = 13000; // 13 seconds

interface FloatingEmoji {
  id: number;
  emoji: string;
  top: number;
  duration: number;
  delay: number;
  size: number;
}

let nextId = 0;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createEmoji(): FloatingEmoji {
  return {
    id: nextId++,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    top: randomBetween(EMOJI_MIN_TOP_PERCENT, EMOJI_MIN_TOP_PERCENT + EMOJI_MAX_TOP_SPREAD_PERCENT),
    duration: randomBetween(EMOJI_MIN_DURATION_S, EMOJI_MAX_DURATION_S),
    delay: Math.random() * 3,
    size: randomBetween(EMOJI_MIN_SIZE_REM, EMOJI_MAX_SIZE_REM),
  };
}

export default function FloatingEmojis({ active }: { active: boolean }) {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setEmojis([]);
      return;
    }

    const spawnBatch = () => {
      const count = Math.floor(randomBetween(BATCH_SIZE_MIN, BATCH_SIZE_MAX + 1));
      const batch = Array.from({ length: count }, createEmoji);
      setEmojis((prev) => [...prev, ...batch]);

      const nextDelay = randomBetween(BATCH_INTERVAL_MIN_MS, BATCH_INTERVAL_MAX_MS);
      timeoutRef.current = setTimeout(spawnBatch, nextDelay);
    };

    timeoutRef.current = setTimeout(spawnBatch, FIRST_BATCH_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active]);

  useEffect(() => {
    if (emojis.length === 0) return;
    const timeout = setTimeout(() => {
      setEmojis((prev) => prev.slice(1));
    }, EMOJI_CLEANUP_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [emojis]);

  return (
    <div className="floating-emojis">
      {emojis.map((e) => (
        <span
          key={e.id}
          className="floating-emoji"
          style={{
            top: `${e.top}%`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            fontSize: `${e.size}rem`,
          }}
        >
          {e.emoji}
        </span>
      ))}
    </div>
  );
}
