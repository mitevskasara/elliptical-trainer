interface ProgressProps {
  totalPercent: number;
  intervalCountLabel: string;
}

export default function Progress({ totalPercent, intervalCountLabel }: ProgressProps) {
  return (
    <div className="progress-wrap">
      <div className="progress-label">
        <span>{intervalCountLabel}</span>
        <span>{Math.round(totalPercent)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${totalPercent}%` }}></div>
      </div>
    </div>
  );
}
