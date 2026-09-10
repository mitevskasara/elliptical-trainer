"use client";

import { useState } from "react";
import Modal from "./Modal";
import { PRESET_TRACKS } from "@/constants/music";
import type { SavedYouTubeUrl } from "@/hooks/useMusic";

interface MusicPickerProps {
  open: boolean;
  onClose: () => void;
  onSelectTrack: (name: string, src: string, icon?: string) => void;
  onUploadFile: (file: File) => void;
  onYouTubeUrl: (url: string) => void;
  onRemoveYouTubeUrl: (url: string) => void;
  savedYouTubeUrls: SavedYouTubeUrl[];
}

export default function MusicPicker({
  open,
  onClose,
  onSelectTrack,
  onUploadFile,
  onYouTubeUrl,
  onRemoveYouTubeUrl,
  savedYouTubeUrls,
}: MusicPickerProps) {
  const [ytUrl, setYtUrl] = useState("");

  const handleSubmitYouTube = () => {
    const trimmed = ytUrl.trim();
    if (trimmed && /(?:youtube\.com|youtu\.be)/.test(trimmed)) {
      onYouTubeUrl(trimmed);
      setYtUrl("");
      onClose();
    }
  };

  return (
    <Modal open={open} title="Music" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {savedYouTubeUrls.length > 0 && savedYouTubeUrls.map((yt) => (
          <div key={yt.url} style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn-settings-editor"
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              onClick={() => {
                onYouTubeUrl(yt.url);
                onClose();
              }}
            >
              ▶️ YouTube | {yt.title}
            </button>
            <button
              className="btn-settings-editor"
              style={{
                flex: "0 0 auto",
                width: "44px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => onRemoveYouTubeUrl(yt.url)}
            >
              ✕
            </button>
          </div>
        ))}
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
      <input
        type="text"
        className="yt-url-input"
        placeholder="▶️ Paste YouTube URL"
        value={ytUrl}
        onChange={(e) => setYtUrl(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text").trim();
          if (text && /(?:youtube\.com|youtu\.be)/.test(text)) {
            e.preventDefault();
            setYtUrl("");
            onYouTubeUrl(text);
            onClose();
          }
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmitYouTube()}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid var(--surface2)",
          background: "transparent",
          color: "var(--text)",
          fontSize: ".9rem",
          outline: "none",
        }}
      />
      </div>
    </Modal>
  );
}
