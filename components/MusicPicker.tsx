"use client";

import Modal from "./Modal";
import { PRESET_TRACKS } from "@/constants/music";

interface MusicPickerProps {
  open: boolean;
  onClose: () => void;
  onSelectTrack: (name: string, src: string, icon?: string) => void;
  onUploadFile: (file: File) => void;
}

export default function MusicPicker({
  open,
  onClose,
  onSelectTrack,
  onUploadFile,
}: MusicPickerProps) {
  return (
    <Modal open={open} title="Music" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {PRESET_TRACKS.map((track) => (
        <button
          key={track.src}
          className="btn-settings-editor"
          onClick={() => {
            onSelectTrack(track.name, track.src, track.icon);
            onClose();
          }}
        >
          {track.icon || "🎵"} {track.name}
        </button>
      ))}
      <label className="btn-settings-editor" style={{ cursor: "pointer" }}>
        📁 Upload
        <input
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUploadFile(file);
              onClose();
            }
          }}
        />
      </label>
      </div>
    </Modal>
  );
}
