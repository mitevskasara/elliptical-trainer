interface ControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function Controls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
}: ControlsProps) {
  const showReset = isRunning || isPaused;

  return (
    <div className="controls">
      {showReset && (
        <button className="ctrl-btn ctrl-reset" onClick={onReset} aria-label="Reset">↺</button>
      )}
      {!isRunning && !isPaused ? (
        <button className="ctrl-btn ctrl-primary" onClick={onStart}>
          <svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
          Start
        </button>
      ) : isRunning && !isPaused ? (
        <button className="ctrl-btn ctrl-primary ctrl-pause" onClick={onPause}>
          <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" /></svg>
          Pause
        </button>
      ) : (
        <button className="ctrl-btn ctrl-primary" onClick={onResume}>
          <svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
          Resume
        </button>
      )}
    </div>
  );
}