"use client";

import { useCallback, useRef, useState } from "react";

export interface UseToastResult {
  message: string;
  showToast: (msg: string, duration?: number) => void;
}

export function useToast(): UseToastResult {
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, duration = 2000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(""), duration);
  }, []);

  return { message, showToast };
}