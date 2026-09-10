# 🚴 Elliptical Trainer

A minimalist, installable interval workout timer for elliptical (or any cardio) training — built to be plug-and-go, with zero sign-in and zero setup.

**[Live Demo →](https://elliptical-trainer.vercel.app/)**

## What it does

Elliptical Trainer guides you through a structured interval workout: warm-up, work intervals, recovery periods, and cool-down with a live countdown, resistance/intensity level guidance (L1–L9), and progress tracking through the full session.

### Features

- **Guided interval programs** — pre-built workouts (Standard, Intense, Hardcode) made up of warm-up, work, recovery, and cool-down phases, each with a target intensity level and duration
- **Live session view** — large countdown timer, current interval name and instructions, and overall progress through the workout (e.g. "1 / 11 intervals")
- **Background music** — pick a genre (Rock, Nu-Metal, Latino, House) or upload your own track to play during the session
- **Theming** — switch between Blue, Green, and Dark visual themes
- **Workout summary** — a completion screen showing total intervals and total time once the session ends
- **Installable PWA** — designed to be added to your phone's home screen and used like a native app, with a mobile-optimized fullscreen interface

### How a session works

1. Choose a workout program and theme
2. Optionally load music
3. Hit **Start** — the app walks you through each interval automatically, showing what to do and how hard to push (via the level indicator) at every stage
4. Finish with a workout summary

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript 5.8**
- **Vanilla CSS** — custom properties for theming, no CSS framework
- **Browser APIs** — Web Audio (beeps), Speech Synthesis (voice coaching), Wake Lock (screen-on), localStorage
- **PWA** — Web App Manifest, standalone display, safe-area insets for mobile
- Deployed on [Vercel](https://vercel.com/)

## Why I built this

I was getting tired of apps that make you sign up, hit a paywall, or hand over your data before you even find out if the thing is useful. So many "simple" tools have quietly turned into subscriptions or data-collection funnels.

This project is part of a small pushback against that, one plug-and-go app at a time. Open it, use it, done. No account, no paywall, no tracking, no upsell screen between you and the feature you came for.

## License

That's also the reason for the license. I don't want this turned into the thing I built it to avoid: a paywalled or subscription-gated app, or a commercial product built on top of it that brings back sign-ups, ads, or tracking.

That's why it's licensed under [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) rather than a standard open-source license. It's free to use, learn from, modify, and share for any noncommercial purpose, just not to build a commercial product from. See the [LICENSE](./LICENSE) file for full terms.
