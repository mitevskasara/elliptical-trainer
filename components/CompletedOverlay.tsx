interface CompletedOverlayProps {
  show: boolean;
  statsText: string;
  onDone: () => void;
}

export default function CompletedOverlay({ show, statsText, onDone }: CompletedOverlayProps) {
  return (
    <div className={`completed-overlay${show ? " show" : ""}`}>
      <div className="completed-emoji">🎉</div>
      <div className="completed-text">Workout Complete!</div>
      <div className="completed-sub">{statsText}</div>
      <button onClick={onDone}>Done</button>
    </div>
  );
}
