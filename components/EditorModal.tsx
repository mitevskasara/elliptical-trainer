"use client";

import { useEffect, useState } from "react";
import { WorkoutInterval } from "@/types/workout";
import { parseWorkoutJson } from "@/lib/helpers";

interface EditorModalProps {
  open: boolean;
  workout: WorkoutInterval[];
  onClose: () => void;
  onSave: (workout: WorkoutInterval[]) => void;
}

export default function EditorModal({ open, workout, onClose, onSave }: EditorModalProps) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (open) {
      setText(JSON.stringify(workout, null, 2));
      setMessage("");
      setIsValid(true);
    }
  }, [open, workout]);

  const handleInput = (value: string) => {
    setText(value);
    try {
      const parsed = parseWorkoutJson(value);
      setMessage(`✓ ${parsed.length} intervals, valid`);
      setIsValid(true);
    } catch (e: any) {
      setMessage(e.message);
      setIsValid(false);
    }
  };

  const handleAddInterval = () => {
    let list: WorkoutInterval[];
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      list = parsed as WorkoutInterval[];
    } catch (e) {
      list = workout;
    }
    const newText = JSON.stringify(
      [...list, { label: "New Interval", duration: 60, resistance: 5, description: "Description here" }],
      null,
      2,
    );
    setText(newText);
    handleInput(newText);
  };

  const handleSave = () => {
    try {
      const parsed = parseWorkoutJson(text);
      onSave(parsed);
      onClose();
    } catch (e: any) {
      setMessage(e.message);
      setIsValid(false);
    }
  };

  return (
    <div
      className={`modal-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Workout</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="editor-label">Workout JSON</div>
          <textarea
            className="json-editor"
            spellCheck={false}
            value={text}
            onChange={(e) => handleInput(e.target.value)}
          ></textarea>
          <div className="json-error" style={{ color: isValid ? "var(--green)" : "var(--red)" }}>
            {message}
          </div>
          <button className="btn-add" onClick={handleAddInterval}>+ Add Interval</button>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save &amp; Close</button>
        </div>
      </div>
    </div>
  );
}