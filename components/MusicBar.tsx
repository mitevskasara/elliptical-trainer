"use client";

import { useRef, useCallback, useState } from "react";
import MusicPicker from "./MusicPicker";
import type { SavedYouTubeUrl } from "@/hooks/useMusic";

interface MusicBarProps {
  musicName: string;
  musicIcon: string;
  isPlaying: boolean;
  musicLoaded: boolean;
  volume: number;
  savedYouTubeUrls: SavedYouTubeUrl[];
  onLoadFile: (file: File) => void;
  onSelectTrack: (name: string, src: string, icon?: string) => void;
  onYouTubeUrl: (url: string) => void;
  onRemoveYouTubeUrl: (url: string) => void;
  onTogglePlayback: () => void;
  onVolumeChange: (value: number) => void;
}

export default function MusicBar({
  musicName,
  musicIcon,
  isPlaying,
  musicLoaded,
  volume,
  savedYouTubeUrls,
  onLoadFile,
  onSelectTrack,
  onYouTubeUrl,
  onRemoveYouTubeUrl,
  onTogglePlayback,
  onVolumeChange,
}: MusicBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateVolume = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    onVolumeChange(pct);
  }, [onVolumeChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    trackRef.current?.setPointerCapture(e.pointerId);
    updateVolume(e.clientX);
  }, [updateVolume]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateVolume(e.clientX);
  }, [updateVolume]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

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
      <span className="music-name" onClick={() => setPickerOpen(true)}>{musicIcon} {musicName}</span>
      {musicLoaded && (
        <div
          className="music-vol-track"
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="music-vol-fill" style={{ width: `${volume}%` }} />
          <span className="music-vol-thumb" style={{ left: `${volume}%` }}>{volume === 0 ? "🔇" : "🔉"}</span>
        </div>
      )}
      <MusicPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectTrack={onSelectTrack}
        onUploadFile={onLoadFile}
        onYouTubeUrl={onYouTubeUrl}
        onRemoveYouTubeUrl={onRemoveYouTubeUrl}
        savedYouTubeUrls={savedYouTubeUrls}
      />
    </div>
  );
}
