"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function Home() {
  const appRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // ── Default Workout ──────────────────────────────────────────────
    const DEFAULT_WORKOUT = [
      { label: "Warm-Up", duration: 180, resistance: 2, description: "Comfortable, easy pace to wake up the joints." },
      { label: "Work Interval", duration: 120, resistance: 4, description: "Fast & Powerful. Push and pull hard." },
      { label: "Recovery", duration: 60, resistance: 2, description: "Slow down, catch your breath." },
      { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Focus on pushing through the heels." },
      { label: "Recovery", duration: 60, resistance: 3, description: "Steady, easy pedaling." },
      { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Move in reverse, optional, targets hamstrings." },
      { label: "Recovery", duration: 60, resistance: 3, description: "Catch your breath." },
      { label: "Work Interval", duration: 120, resistance: 5, description: "Fast & Powerful. Give it everything you've got." },
      { label: "Recovery", duration: 60, resistance: 3, description: "Steady recovery." },
      { label: "Peak Interval", duration: 120, resistance: 6, description: "Heavy Burn. Slower pace, but maximum muscle push." },
      { label: "Cool-Down", duration: 180, resistance: 2, description: "Slow pedaling to bring your heart rate down." },
    ];

    const STORAGE_KEY = "elliptical_workout_v2";
    const CIRCUMFERENCE = 2 * Math.PI * 120;

    // ── State ────────────────────────────────────────────────────────
    let workout: any[] = [];
    let currentIdx = 0;
    let timeLeft = 0;
    let totalTime = 0;
    let running = false;
    let paused = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let lastTick = 0;
    let wakeLock: any = null;
    let speechUnlocked = false;
    let remainingMs = 0;
    let lastSecond = -1;

    // ── Audio Context ────────────────────────────────────────────────
    let audioCtx: AudioContext | null = null;
    function getAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioCtx;
    }

    // ── DOM refs ─────────────────────────────────────────────────────
    const $ = (id: string) => document.getElementById(id)!;
    const currentLabel = $("currentLabel");
    const currentLevel = $("currentLevel");
    const nextLevelEl = $("nextLevel");
    const nextNameEl = $("nextName");
    const levelNextEl = $("levelNext");
    const timerDigits = $("timerDigits");
    const timerMs = $("timerMs");
    const timerRing = $("timerRing");
    const progressFill = $("progressFill");
    const progressText = $("progressText");
    const progressPct = $("progressPct");
    const programList = $("programList");
    const programOverlay = $("programOverlay");
    const openProgram = $("openProgram");
    const closeProgram = $("closeProgram");
    const btnStart = $("btnStart");
    const btnPause = $("btnPause");
    const btnResume = $("btnResume");
    const btnReset = $("btnReset");
    const openEditor = $("openEditor");
    const modalOverlay = $("modalOverlay");
    const closeEditor = $("closeEditor");
    const jsonEditor = $("jsonEditor") as HTMLTextAreaElement;
    const jsonError = $("jsonError");
    const btnSave = $("btnSave");
    const btnCancel = $("btnCancel");
    const btnAddInterval = $("btnAddInterval");
    const wakeBadge = $("wakeBadge");
    const completedOverlay = $("completedOverlay");
    const completedStats = $("completedStats");
    const btnDone = $("btnDone");
    const toast = $("toast");

    // ── Music ────────────────────────────────────────────────────────
    const musicFile = $("musicFile") as HTMLInputElement;
    const musicPlayPause = $("musicPlayPause");
    const musicPlayIcon = $("musicPlayIcon");
    const musicPauseIcon = $("musicPauseIcon");
    const musicNameEl = $("musicName");
    const musicVol = $("musicVol") as HTMLInputElement;
    const musicPick = $("musicPick");

    let musicEl: HTMLAudioElement | null = null;
    let musicLoaded = false;
    let userVolume = 0.7;
    let isDucking = false;

    function loadMusic(file: File) {
      if (musicEl) { musicEl.pause(); musicEl.src = ""; }
      musicEl = new Audio();
      musicEl.crossOrigin = "anonymous";
      musicEl.loop = true;
      musicEl.volume = userVolume;
      musicEl.src = URL.createObjectURL(file);
      musicLoaded = true;
      musicNameEl.textContent = file.name.replace(/\.[^.]+$/, "");
      musicPlayPause.style.display = "";
      musicVol.style.display = "";
      musicPick.style.display = "none";
    }

    function toggleMusic() {
      if (!musicLoaded || !musicEl) return;
      if (musicEl.paused) {
        musicEl.play();
        musicPlayIcon.style.display = "none";
        musicPauseIcon.style.display = "";
        musicPlayPause.classList.add("playing");
      } else {
        musicEl.pause();
        musicPlayIcon.style.display = "";
        musicPauseIcon.style.display = "none";
        musicPlayPause.classList.remove("playing");
      }
    }

    function duckMusic() {
      if (!musicLoaded || !musicEl || musicEl.paused) return;
      isDucking = true;
      musicEl.volume = Math.min(userVolume, 0.15);
    }

    function unduckMusic() {
      if (!musicLoaded || !musicEl || !isDucking) return;
      isDucking = false;
      musicEl.volume = userVolume;
    }

    musicFile.addEventListener("change", (e: any) => {
      if (e.target.files[0]) loadMusic(e.target.files[0]);
    });
    musicPlayPause.addEventListener("click", toggleMusic);
    musicVol.addEventListener("input", () => {
      userVolume = Number(musicVol.value) / 100;
      if (!isDucking && musicLoaded && musicEl) musicEl.volume = userVolume;
    });

    // ── Helpers ──────────────────────────────────────────────────────
    function fmt(sec: number) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    function fmtMs(ms: number) {
      return String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
    }

    function totalWorkoutSeconds() {
      return workout.reduce((a: number, i: any) => a + i.duration, 0);
    }

    function elapsedSeconds() {
      let elapsed = 0;
      for (let i = 0; i < currentIdx; i++) elapsed += workout[i].duration;
      elapsed += (workout[currentIdx]?.duration || 0) - timeLeft;
      return elapsed;
    }

    function showToast(msg: string, dur = 2000) {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), dur);
    }

    // ── Render ───────────────────────────────────────────────────────
    function renderProgramList() {
      programList.innerHTML = "";
      workout.forEach((item: any, i: number) => {
        const el = document.createElement("div");
        el.className = "program-item" + (i === currentIdx && (running || paused) ? " active" : "") + (i < currentIdx ? " done" : "");
        const dur = item.duration;
        const mm = Math.floor(dur / 60);
        const ss = dur % 60;
        const timeStr = mm > 0 ? `${mm}m${ss > 0 ? " " + ss + "s" : ""}` : `${ss}s`;
        el.innerHTML = `
          <div class="program-num">${i < currentIdx ? "✓" : i + 1}</div>
          <div class="program-info">
            <div class="program-name">${item.label}</div>
            <div class="program-desc">${item.description}</div>
          </div>
          <div class="program-meta"><div class="res">L${item.resistance}</div><div>${timeStr}</div></div>
        `;
        el.addEventListener("click", () => {
          if (!running && !paused) { jumpTo(i); closeProgramPanel(); }
        });
        programList.appendChild(el);
      });
    }

    function renderTimer() {
      const item = workout[currentIdx];
      if (!item) {
        timerDigits.textContent = "0:00";
        timerMs.textContent = "";
        timerRing.style.strokeDashoffset = String(CIRCUMFERENCE);
        return;
      }
      timerDigits.textContent = fmt(timeLeft);
      timerMs.textContent = `.${fmtMs(timeLeft * 1000)}`;
      const pct = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
      timerRing.style.strokeDasharray = String(CIRCUMFERENCE);
      timerRing.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct));
      timerRing.classList.toggle("warn", timeLeft <= 5 && timeLeft > 0);
      timerRing.classList.toggle("done", timeLeft <= 0);
    }

    function renderProgress() {
      const total = workout.reduce((a: number, i: any) => a + i.duration, 0);
      const done = elapsedSeconds();
      const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
      progressFill.style.width = pct + "%";
      progressText.textContent = `${currentIdx + 1} / ${workout.length} intervals`;
      progressPct.textContent = Math.round(pct) + "%";
    }

    function renderAll() {
      renderProgramList();
      renderTimer();
      renderProgress();
    }

    function updateLevelDisplay() {
      const item = workout[currentIdx];
      const next = workout[currentIdx + 1];
      if (item) {
        currentLabel.textContent = item.label;
        currentLevel.textContent = `L${item.resistance}`;
      } else {
        currentLabel.textContent = "Ready";
        currentLevel.textContent = "—";
      }
      if (next) {
        levelNextEl.style.display = "";
        nextLevelEl.textContent = `L${next.resistance}`;
        nextNameEl.textContent = next.label;
      } else {
        levelNextEl.style.display = "none";
      }
    }

    // ── Speech ───────────────────────────────────────────────────────
    let femaleVoice: SpeechSynthesisVoice | null = null;

    function findFemaleVoice() {
      if (femaleVoice) return femaleVoice;
      const voices = speechSynthesis.getVoices();
      const preferred = ["samantha", "karen", "moira", "tessa", "zira", "hazel",
        "google uk english female", "google us english", "microsoft zira",
        "microsoft hazel", "siri", "google español", "female"];
      for (const pref of preferred) {
        const match = voices.find(v => v.name.toLowerCase().includes(pref));
        if (match) { femaleVoice = match; return femaleVoice; }
      }
      const femaleKeywords = ["female", "woman", "samantha", "karen", "zira", "hazel", "moira", "tessa"];
      for (const kw of femaleKeywords) {
        const match = voices.find(v => v.name.toLowerCase().includes(kw));
        if (match) { femaleVoice = match; return femaleVoice; }
      }
      const nonDefault = voices.find(v => !v.default && v.lang.startsWith("en"));
      if (nonDefault) { femaleVoice = nonDefault; return femaleVoice; }
      return null;
    }

    function unlockSpeech() {
      if (speechUnlocked) return;
      try {
        findFemaleVoice();
        const u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        speechSynthesis.speak(u);
        speechUnlocked = true;
      } catch (e) {}
    }

    function speak(text: string) {
      if (!speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      u.pitch = 1.1;
      u.volume = 1;
      const voice = findFemaleVoice();
      if (voice) u.voice = voice;
      duckMusic();
      u.onend = () => unduckMusic();
      u.onerror = () => unduckMusic();
      speechSynthesis.speak(u);
    }

    speechSynthesis.onvoiceschanged = () => { femaleVoice = null; findFemaleVoice(); };

    // ── Beep ─────────────────────────────────────────────────────────
    function beep(freq = 880, dur = 0.12) {
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}
    }

    function countdownBeep(count: number) {
      beep(count === 0 ? 1200 : 660, 0.08);
    }

    // ── Wake Lock ────────────────────────────────────────────────────
    async function acquireWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          wakeBadge.classList.add("active");
          wakeBadge.textContent = "⚡ Screen awake";
          wakeLock.addEventListener("release", () => {
            wakeBadge.classList.remove("active");
            wakeBadge.textContent = "⚡ Wake";
          });
        }
      } catch (e) {
        wakeBadge.textContent = "⚡ Wake N/A";
      }
    }

    async function releaseWakeLock() {
      if (wakeLock) {
        try { await wakeLock.release(); } catch (e) {}
        wakeLock = null;
      }
      wakeBadge.classList.remove("active");
      wakeBadge.textContent = "⚡ Wake";
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && running && !paused) {
        acquireWakeLock();
      }
    });

    // ── Interval Engine ──────────────────────────────────────────────
    function tick() {
      const now = performance.now();
      const delta = now - lastTick;
      lastTick = now;
      remainingMs -= delta;

      const currentSec = Math.ceil(remainingMs / 1000);

      if (currentSec !== lastSecond && currentSec <= 3 && currentSec > 0) {
        countdownBeep(currentSec);
        speak(`${currentSec}`);
      }
      lastSecond = currentSec;

      const secFloat = remainingMs / 1000;
      timeLeft = Math.max(0, Math.ceil(secFloat));
      renderTimer();
      renderProgress();

      if (remainingMs <= 0) {
        advanceInterval();
      }
    }

    function startInterval() {
      if (currentIdx >= workout.length) {
        finishWorkout();
        return;
      }
      const item = workout[currentIdx];
      totalTime = item.duration;
      remainingMs = item.duration * 1000;
      timeLeft = item.duration;
      lastSecond = -1;
      lastTick = performance.now();

      updateLevelDisplay();
      renderAll();

      beep(520, 0.1);
      setTimeout(() => {
        speak(`Level ${item.resistance}. ${item.label}. ${item.description}.`);
      }, 150);

      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(tick, 50);
    }

    function advanceInterval() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      beep(1000, 0.15);
      currentIdx++;
      if (currentIdx >= workout.length) {
        finishWorkout();
      } else {
        startInterval();
      }
    }

    function jumpTo(idx: number) {
      if (idx < 0 || idx >= workout.length) return;
      currentIdx = idx;
      startInterval();
    }

    function finishWorkout() {
      running = false;
      paused = false;
      currentLabel.textContent = "Workout Complete!";
      currentLevel.textContent = "🎉";
      levelNextEl.style.display = "none";
      const total = totalWorkoutSeconds();
      completedStats.textContent = `${workout.length} intervals · ${Math.floor(total / 60)}m ${total % 60}s total`;
      completedOverlay.classList.add("show");
      speak("Workout complete. Great job!");
      releaseWakeLock();
      if (musicLoaded && musicEl && !musicEl.paused) {
        musicEl.pause();
        musicPlayIcon.style.display = "";
        musicPauseIcon.style.display = "none";
        musicPlayPause.classList.remove("playing");
      }
      renderAll();
      updateButtons();
    }

    // ── Controls ─────────────────────────────────────────────────────
    function updateButtons() {
      btnStart.style.display = (!running && !paused) ? "" : "none";
      btnPause.style.display = (running && !paused) ? "" : "none";
      btnResume.style.display = paused ? "" : "none";
      btnReset.style.display = (running || paused) ? "" : "none";
    }

    btnStart.addEventListener("click", () => {
      unlockSpeech();
      if (workout.length === 0) { showToast("Add intervals first!"); return; }
      currentIdx = 0;
      running = true;
      paused = false;
      acquireWakeLock();
      startInterval();
      updateButtons();
      if (musicLoaded && musicEl && musicEl.paused) {
        musicEl.play();
        musicPlayIcon.style.display = "none";
        musicPauseIcon.style.display = "";
        musicPlayPause.classList.add("playing");
      }
    });

    btnPause.addEventListener("click", () => {
      if (!running) return;
      paused = true;
      running = false;
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      currentLabel.textContent = "Paused";
      const item = workout[currentIdx];
      currentLevel.textContent = item ? `L${item.resistance}` : "—";
      updateLevelDisplay();
      speak("Paused");
      updateButtons();
    });

    btnResume.addEventListener("click", () => {
      if (!paused) return;
      paused = false;
      running = true;
      acquireWakeLock();
      lastTick = performance.now();
      intervalId = setInterval(tick, 50);
      speak("Resuming");
      updateButtons();
    });

    btnReset.addEventListener("click", () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      running = false;
      paused = false;
      currentIdx = 0;
      timeLeft = 0;
      totalTime = 0;
      remainingMs = 0;
      currentLabel.textContent = "Ready";
      currentLevel.textContent = "—";
      levelNextEl.style.display = "none";
      timerRing.style.strokeDashoffset = String(CIRCUMFERENCE);
      timerRing.classList.remove("warn", "done");
      releaseWakeLock();
      if (musicLoaded && musicEl && !musicEl.paused) {
        musicEl.pause();
        musicPlayIcon.style.display = "";
        musicPauseIcon.style.display = "none";
        musicPlayPause.classList.remove("playing");
      }
      renderAll();
      updateButtons();
    });

    btnDone.addEventListener("click", () => {
      completedOverlay.classList.remove("show");
      btnReset.click();
    });

    // ── Editor ───────────────────────────────────────────────────────
    function loadWorkout() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].duration) {
            workout = parsed;
            return;
          }
        }
      } catch (e) {}
      workout = structuredClone(DEFAULT_WORKOUT);
    }

    function saveWorkout() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workout)); } catch (e) {}
    }

    function openWorkoutEditor() {
      jsonEditor.value = JSON.stringify(workout, null, 2);
      jsonError.textContent = "";
      modalOverlay.classList.add("open");
    }

    function closeWorkoutEditor() {
      modalOverlay.classList.remove("open");
    }

    jsonEditor.addEventListener("input", () => {
      try {
        const parsed = JSON.parse(jsonEditor.value);
        if (!Array.isArray(parsed)) throw new Error("Must be an array");
        parsed.forEach((item: any, i: number) => {
          if (!item.label || typeof item.label !== "string") throw new Error(`Item ${i}: label is required (string)`);
          if (!item.duration || typeof item.duration !== "number" || item.duration < 1) throw new Error(`Item ${i}: duration must be a positive number`);
          if (item.resistance === undefined || typeof item.resistance !== "number") throw new Error(`Item ${i}: resistance is required (number)`);
        });
        jsonError.textContent = "";
        jsonError.style.color = "var(--green)";
        jsonError.textContent = `✓ ${parsed.length} intervals, valid`;
        setTimeout(() => { jsonError.textContent = ""; }, 2000);
      } catch (e: any) {
        jsonError.textContent = e.message;
        jsonError.style.color = "var(--red)";
      }
    });

    btnSave.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(jsonEditor.value);
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Need at least one interval");
        parsed.forEach((item: any, i: number) => {
          if (!item.label || typeof item.label !== "string") throw new Error(`Item ${i}: label required`);
          if (!item.duration || typeof item.duration !== "number" || item.duration < 1) throw new Error(`Item ${i}: duration must be >= 1`);
          if (item.resistance === undefined || typeof item.resistance !== "number") throw new Error(`Item ${i}: resistance required`);
          if (!item.description) item.description = item.label;
        });
        workout = parsed;
        saveWorkout();
        closeWorkoutEditor();
        renderProgramList();
        showToast("Workout saved!");
      } catch (e: any) {
        jsonError.textContent = e.message;
        jsonError.style.color = "var(--red)";
      }
    });

    btnCancel.addEventListener("click", closeWorkoutEditor);
    closeEditor.addEventListener("click", closeWorkoutEditor);
    openEditor.addEventListener("click", openWorkoutEditor);
    modalOverlay.addEventListener("click", (e: any) => {
      if (e.target === modalOverlay) closeWorkoutEditor();
    });

    btnAddInterval.addEventListener("click", () => {
      const newItem = { label: "New Interval", duration: 60, resistance: 5, description: "Description here" };
      let arr: any[];
      try { arr = JSON.parse(jsonEditor.value); } catch (e) { arr = [...workout]; }
      arr.push(newItem);
      jsonEditor.value = JSON.stringify(arr, null, 2);
      jsonEditor.scrollTop = jsonEditor.scrollHeight;
      jsonEditor.dispatchEvent(new Event("input"));
    });

    // ── Program Panel ────────────────────────────────────────────────
    function openProgramPanel() {
      renderProgramList();
      programOverlay.classList.add("open");
    }
    function closeProgramPanel() {
      programOverlay.classList.remove("open");
    }
    openProgram.addEventListener("click", openProgramPanel);
    closeProgram.addEventListener("click", closeProgramPanel);
    programOverlay.addEventListener("click", (e: any) => {
      if (e.target === programOverlay) closeProgramPanel();
    });

    // ── Init ─────────────────────────────────────────────────────────
    timerRing.style.strokeDasharray = String(CIRCUMFERENCE);
    timerRing.style.strokeDashoffset = String(CIRCUMFERENCE);
    loadWorkout();
    renderAll();
    updateButtons();

    ["touchstart", "click", "keydown"].forEach(evt => {
      document.addEventListener(evt, unlockSpeech, { once: false, passive: true } as any);
    });

    if (document.visibilityState === "visible" && running) acquireWakeLock();
  }, []);

  return (
    <div className="app" ref={appRef}>
      <header className="header">
        <div className="header-left">
          <span className="logo">🚴</span>
          <h1>20-Min Fat-Burn: 2:1</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="see-program-btn" id="openProgram">
            <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
            Program
          </button>
          <span className="wake-badge" id="wakeBadge">⚡ Wake</span>
          <button className="settings-btn" id="openEditor" aria-label="Edit workout">⚙</button>
        </div>
      </header>

      <div className="music-bar" id="musicBar">
        <label className="music-pick" id="musicPick">
          <input type="file" id="musicFile" accept="audio/*" />
          + Add music
        </label>
        <button className="music-btn" id="musicPlayPause" style={{ display: "none" }} aria-label="Play/Pause music">
          <svg viewBox="0 0 24 24" id="musicPlayIcon"><polygon points="6,3 20,12 6,21"/></svg>
          <svg viewBox="0 0 24 24" id="musicPauseIcon" style={{ display: "none" }}><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
        </button>
        <span className="music-name" id="musicName">No music loaded</span>
        <input type="range" className="music-vol" id="musicVol" min="0" max="100" defaultValue="70" style={{ display: "none" }} />
      </div>

      <section className="dashboard" id="dashboard">
        <div className="level-row" id="levelRow">
          <div className="level-current">
            <div className="level-current-label" id="currentLabel">Ready</div>
            <div className="level-current-num" id="currentLevel">—</div>
          </div>
          <div className="level-next" id="levelNext">
            <div className="level-next-label">NEXT</div>
            <div className="level-next-num" id="nextLevel">—</div>
            <div className="level-next-name" id="nextName"></div>
          </div>
        </div>

        <div className="timer-ring-wrap">
          <div className="timer-ring-bg"></div>
          <div className="timer-ring-fg" id="timerRing"></div>
          <div className="timer-center">
            <div className="timer-digits" id="timerDigits">0:00</div>
            <div className="timer-ms" id="timerMs"></div>
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-label">
            <span id="progressText">0 / 0 intervals</span>
            <span id="progressPct">0%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" id="progressFill"></div></div>
        </div>
      </section>

      <div className="controls">
        <button className="ctrl-btn ctrl-reset" id="btnReset" aria-label="Reset" style={{ display: "none" }}>↺</button>
        <button className="ctrl-btn ctrl-primary" id="btnStart">
          <svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>
          Start
        </button>
        <button className="ctrl-btn ctrl-primary ctrl-pause" id="btnPause" style={{ display: "none" }}>
          <svg viewBox="0 0 24 24"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>
          Pause
        </button>
        <button className="ctrl-btn ctrl-primary" id="btnResume" style={{ display: "none" }}>
          <svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>
          Resume
        </button>
      </div>

      <div className="program-overlay" id="programOverlay">
        <div className="program-panel">
          <div className="program-panel-header">
            <h2>Workout Program</h2>
            <button className="program-panel-close" id="closeProgram">✕</button>
          </div>
          <div className="program-list" id="programList"></div>
        </div>
      </div>

      <div className="modal-overlay" id="modalOverlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Edit Workout</h2>
            <button className="modal-close" id="closeEditor">✕</button>
          </div>
          <div className="modal-body">
            <div className="editor-label">Workout JSON</div>
            <textarea className="json-editor" id="jsonEditor" spellCheck={false}></textarea>
            <div className="json-error" id="jsonError"></div>
            <button className="btn-add" id="btnAddInterval">+ Add Interval</button>
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" id="btnCancel">Cancel</button>
            <button className="btn-save" id="btnSave">Save &amp; Close</button>
          </div>
        </div>
      </div>

      <div className="completed-overlay" id="completedOverlay">
        <div className="completed-emoji">🎉</div>
        <div className="completed-text">Workout Complete!</div>
        <div className="completed-sub" id="completedStats"></div>
        <button id="btnDone">Done</button>
      </div>

      <div className="toast" id="toast"></div>
    </div>
  );
}
