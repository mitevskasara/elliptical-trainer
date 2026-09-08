interface MusicBarProps {
  musicName: string;
  isPlaying: boolean;
  musicLoaded: boolean;
  volume: number;
  onLoadFile: (file: File) => void;
  onTogglePlayback: () => void;
  onVolumeChange: (value: number) => void;
}

export default function MusicBar({
  musicName,
  isPlaying,
  musicLoaded,
  volume,
  onLoadFile,
  onTogglePlayback,
  onVolumeChange,
}: MusicBarProps) {
  return (
    <div className="music-bar">
      {!musicLoaded ? (
        <label className="music-pick">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLoadFile(file);
            }}
          />
          + Add music
        </label>
      ) : (
        <button className={`music-btn${isPlaying ? " playing" : ""}`} onClick={onTogglePlayback} aria-label="Play/Pause music">
          {!isPlaying ? (
            <svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
          ) : (
            <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" /></svg>
          )}
        </button>
      )}
      <span className="music-name">{musicName}</span>
      {musicLoaded && (
        <input
          type="range"
          className="music-vol"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="Music volume"
        />
      )}
    </div>
  );
}