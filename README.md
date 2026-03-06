# Lucy's Chinese Vocab

A progressive web app for a 7-year-old learning 45 Chinese vocabulary words. Built with vanilla JavaScript, no dependencies, no build tools. Designed for mobile (iPhone) and deployed to GitHub Pages.

<img src="https://img.shields.io/badge/vanilla-JS-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="Vanilla JS"> <img src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat&logo=pwa&logoColor=white" alt="PWA"> <img src="https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat" alt="Zero Dependencies">

## What it does

Lucy opens the app on her phone, taps Start, and works through a structured practice session:

1. **Flashcard review** -- 5 priority words, tap to flip, self-assess
2. **Three practice rounds** -- match (multiple choice), context (fill-in-the-blank), pairs (tile matching), 10 questions each
3. **Writing practice** -- hear a word via TTS, write the character on paper, tap to reveal and self-check, 3 rounds of 5 words shuffled

Three sessions per day earns a daily streak. Streaks unlock real-world rewards ($3 at 7 days, $5 at 14, $10 at 30).

## Features

- **Spaced repetition** -- words decay from mastered to fading to needs-review over 7-14 days. Priority algorithm surfaces the words Lucy needs most.
- **5 practice modes** -- flashcard, match, context, pairs, writing. Each mode registers itself via a plugin system for easy extension.
- **Mastery grid** -- 45 tiles showing every word's status at a glance. Tap any tile for stats and a focused mini-drill.
- **Engagement layer** -- XP, levels, 16 achievements, answer streak rewards, mystery 2x XP, confetti, coin bursts, and Sadie the dog.
- **6 color themes** -- unlocked by earning badges. Dark mode throughout.
- **Offline-first** -- service worker precaches everything. Works without internet after first load.
- **Auto-update** -- bump `CACHE_VERSION` in `sw.js`, push, and the app refreshes automatically on Lucy's device.
- **v1 migration** -- reads existing localStorage data and upgrades the schema in place. No progress lost.

## Run locally

```bash
python3 -m http.server 8000
open http://localhost:8000
```

ES modules require HTTP -- `file://` won't work.

## Test on iPhone (same wifi)

```bash
# Find your Mac's local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Open on iPhone
# http://192.168.x.x:8000
```

Service worker and PWA install require HTTPS or localhost. On a local IP the app works but won't install to homescreen.

## Project structure

```
index.html              App shell
manifest.json           PWA manifest
sw.js                   Service worker (network-first, auto-update)

css/
  base.css              Reset, variables, layout, animations
  themes.css            6 theme definitions (CSS custom properties)
  home.css              Home screen + session launcher
  grid.css              Mastery grid (5-column, color-coded)
  progress.css          Streak calendar + daily prizes
  practice.css          Flashcards, quizzes, timers, writing mode
  overlays.css          Word detail, theme picker, results, toasts

js/
  app.js                Entry point, router, session orchestration
  state.js              localStorage persistence, v1 migration
  mastery.js            Spaced repetition, word selection, decay
  session.js            Session state machine (3-step flow)
  engagement.js         XP, badges, streaks, rewards
  animations.js         Coins, confetti, Sadie popup, toasts
  audio.js              Web Speech API (TTS + recognition)

  data/
    words.js            45 vocabulary items (hanzi, pinyin, english)
    sentences.js        90 context sentences (2 per word)
    badges.js           16 achievement definitions
    themes.js           6 theme definitions

  modes/
    mode-registry.js    Plugin system for practice modes
    flashcard.js        Tap-to-flip review cards
    match.js            Multiple choice with countdown timer
    context.js          Fill-in-the-blank sentences
    pairs.js            Tile matching game
    writing.js          Listen, write on paper, reveal + self-check

  ui/
    home.js             Session launcher screen
    grid.js             Mastery grid screen
    progress.js         Streak + calendar screen
    nav.js              Bottom nav pill + top bar
    overlays.js         Word detail, theme picker, results

assets/
    sadie.js            Base64-encoded Sadie photo
    *.png               PWA icons
```

## Adding a new word set

1. Add word objects to `js/data/words.js` -- `{ hanzi, pinyin, english, set }`
2. Add 2 context sentences per word to `js/data/sentences.js`
3. Bump `CACHE_VERSION` in `sw.js`
4. Push

## Adding a new practice mode

```javascript
// js/modes/my-mode.js
import { registerMode } from './mode-registry.js';

registerMode('my-mode', {
  name: 'My Mode',
  setup(container, { words, questionCount, onComplete, onAnswer }) {
    // Render your mode UI into container
    // Call onAnswer(correct, word) after each answer
    // Call onComplete(results) when done
  },
  cleanup() {}
});
```

Then import it in `js/app.js`. The session orchestrator picks it up automatically.

## Deploy

```bash
# Bump CACHE_VERSION in sw.js
git add -A && git commit -m "description"
git push origin main
```

GitHub Pages rebuilds automatically. The service worker detects the new cache version and auto-refreshes.

## Tech decisions

- **Zero dependencies** -- no npm, no bundlers, no frameworks. Just ES modules served over HTTP.
- **Single localStorage key** -- all state in one JSON object under `lucyVocab`. Simple, debuggable, portable.
- **CSS custom properties for theming** -- one `data-theme` attribute on `<html>` swaps the entire color scheme.
- **Mode registry pattern** -- practice modes register themselves on import. Adding a mode never touches existing files.
- **Network-first service worker** -- always tries the network, falls back to cache. Version bumps trigger automatic refresh.

## Background

This was built for my daughter Lucy who is learning Mandarin Chinese at school. She has 45 vocabulary words across two units (Week 3A4B and Week 2B) covering topics like food, festivals and Chinese New Year traditions.

The v1 app was a single 3,500-line HTML file. v2 breaks it into ~24 modules while preserving all progress data and the same GitHub Pages URL so Lucy's homescreen bookmark keeps working.

Built with [Claude Code](https://claude.ai/code) using spec-driven development. Design artifacts (spec, plan, data model, tasks) are in `specs/`.

## License

MIT
