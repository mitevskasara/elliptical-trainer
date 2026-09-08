import { CIRCUMFERENCE } from "@/constants/workout";
import { formatMilliseconds, formatTime } from "@/lib/helpers";

interface TimerRingProps {
  remainingSeconds: number;
  totalSeconds: number;
}

export default function TimerRing({ remainingSeconds, totalSeconds }: TimerRingProps) {
  const elapsedFraction = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const isWarn = remainingSeconds <= 5 && remainingSeconds > 0;
  const isDone = remainingSeconds <= 0;

  return (
    <div className="timer-ring-wrap">
      <div className="timer-ring-bg"></div>
      <div
        className={`timer-ring-fg${isWarn ? " warn" : ""}${isDone ? " done" : ""}`}
        style={{
          strokeDasharray: `${CIRCUMFERENCE}px`,
          strokeDashoffset: `${CIRCUMFERENCE * (1 - elapsedFraction)}px`,
        }}
      ></div>
      <div className="timer-center">
        <div className="timer-digits">{formatTime(remainingSeconds)}</div>
        <div className="timer-ms">.{formatMilliseconds(remainingSeconds * 1000)}</div>
      </div>
    </div>
  );
}