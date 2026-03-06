# Quickstart: Lucy Vocab v2

## Prerequisites

- A modern browser (Safari 16+ or Chrome)
- Python 3 (for local development server)
- Git

## Run locally

```bash
# Clone and enter the project
git clone https://github.com/suburban-sungod/lucy-vocab.git
cd lucy-vocab

# Checkout the v2 branch
git checkout 001-v2-rebuild

# Start a local server (ES modules require HTTP, not file://)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## Test on iPhone (same wifi)

```bash
# Find your Mac's local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Open on iPhone browser
# http://192.168.x.x:8000
```

Note: Service worker and PWA install require HTTPS or localhost. On the local network IP, the app will work but won't install to home screen or cache offline.

## Project structure

```
index.html          # App shell
sw.js               # Service worker
manifest.json       # PWA manifest
css/                # Stylesheets (7 files)
js/                 # Application logic
  app.js            # Entry point
  data/             # Static content (words, sentences, badges, themes)
  modes/            # Practice modes (flashcard, match, context, pairs, writing)
  ui/               # Screen renderers (home, grid, progress, nav, overlays)
  state.js          # Data persistence + v1 migration
  mastery.js        # Spaced repetition algorithm
  session.js        # Session orchestrator (3-step flow)
  engagement.js     # XP, streaks, achievements
  audio.js          # TTS + speech recognition
  animations.js     # Visual effects
assets/             # Icons + Sadie photo
```

## Key workflows

### Adding a new word set

1. Edit `js/data/words.js` -- add new word objects with `{hanzi, pinyin, english, set}`
2. Edit `js/data/sentences.js` -- add 2 context sentences per new word
3. Bump `CACHE_VERSION` in `sw.js`
4. Deploy

### Adding a new practice mode

1. Create `js/modes/my-mode.js`
2. Import `registerMode` from `mode-registry.js`
3. Call `registerMode('my-mode', { setup, render, handleAnswer, cleanup })`
4. Import the new mode file in `js/app.js`
5. Bump `CACHE_VERSION` in `sw.js`
6. Deploy

### Deploying updates

```bash
# Bump CACHE_VERSION in sw.js (increment by 1)
git add -A && git commit -m "description" && git push origin main
```

GitHub Pages rebuilds automatically. The service worker detects the new cache version and auto-refreshes on Lucy's device.

## Testing v1 migration

1. Open v1 app in browser, use it to build up some progress
2. Note the XP, streaks, mastery states
3. Deploy v2 to the same origin
4. Refresh -- v2 should show all v1 progress intact
5. Verify mastery grid colors match v1 state

Or manually seed localStorage:

```javascript
// In browser console
localStorage.setItem('lucyVocab', JSON.stringify({
  xp: 350, streak: 5, bestStreak: 12, sessions: 20,
  totalCorrect: 150, totalAnswered: 200,
  lastLogin: new Date().toDateString(),
  words: { "端午节": { correct: 5, streak: 3, mastered: true, seen: 8, wrong: 1, lastCorrect: Date.now() - 86400000 * 3 } },
  dailyHistory: [/* recent dates */],
  dailyStreak: 3, bestDailyStreak: 7,
  dailyRewards: {}, badges: { firstSteps: Date.now() },
  unlockedThemes: ['default', 'sakura'], activeTheme: 'sakura',
  lastPerfectRound: 0, _perfectMatch: false, _perfectContext: false, _lightningPairs: false
}));
// Refresh the page
location.reload();
```
