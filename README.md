# Lucy's Chinese Vocab

Flashcard game for Lucy to learn 45 Chinese vocabulary words. Single self-contained HTML file with service worker for offline support and auto-updates.

## Live URL

https://suburban-sungod.github.io/lucy-vocab/

## GitHub repo

https://github.com/suburban-sungod/lucy-vocab

GitHub Pages serves from `main` branch root.

## Deploying updates

The git repo is initialised in this folder. To deploy:

```bash
cd ~/Documents/Projects/Lucy\ Vocab
git add -A && git commit -m "description" && git push origin main
```

Pages rebuilds automatically. The service worker (`sw.js`) handles cache invalidation. Bump `CACHE_VERSION` in `sw.js` with each deploy so the app auto-refreshes on Lucy's device.

## What's in the game

### Word list (45 words)
- **Week 3A-4B** (15 words): food, drinks, Dragon Boat Festival vocab
- **Week 2B** (30 words): Spring Festival / Chinese New Year vocab

Each word has: characters, pinyin, English meaning.

### Game modes
1. **Flashcards** -- tap to flip, swipe or buttons for got it / need practice. Spaced repetition weighting (weak/stale words appear more). Keyboard: space to flip, arrows to answer, `s` to speak.
2. **Match** -- 4-option multiple choice, 10s timer, 15 questions per session. Alternates Chinese-to-English, English-to-Chinese, Pinyin-to-English. Auto-pronounces each word. Review screen at end shows mistakes with "Study Mistakes" option.
3. **Speed Round** -- 30 second blitz. High score saved. Mistakes shown in results.
4. **Context** -- fill-in-the-blank Chinese sentences, 4 word choices, 15s timer. 30 sentences for 3A4B set (2 per word). 15 questions per session with review screen.
5. **Pairs** -- 4 Chinese + 4 English tiles in a grid. Tap to select, tap match. Timer counts up. 3 rounds per session, results show per-round times.

### Audio features
- **TTS pronunciation** -- Web Speech API (`zh-CN`). Speaker buttons on flashcards, match mode, draw mode, stats grid.
- **Speech recognition** -- `webkitSpeechRecognition` in continuous mode (one-time mic permission). Mic button on flashcard back. Compares recognized text against expected characters. Best in Chrome.

### Mastery dashboard
- Prominent mastery overview at top of app: X/45 words mastered with color-segmented progress bar
- Visual mastery states that decay over time: mastered (green, <7 days), fading (amber, 7-14 days stale), needs review (red, 14+ days stale), learning (purple), unseen (grey)
- "Practice 5 hardest words" button always visible, picks weakest/stalest words and launches flashcards
- Words tab with tap-to-inspect: tap any word to see full stats (streak, accuracy, times seen, last practiced) plus audio and a practice button

### Spaced repetition
Words are weighted by: days since last correct answer, wrong ratio, mastery staleness. Unseen words get highest priority. Mastered words resurface after 3-7 days to prevent forgetting. Applied to flashcard deck building, match and speed question selection.

### Engagement
- XP system with levels: Beginner (0) > Intermediate (200) > Advanced (500) > Master (1000)
- Answer streak counter with fire animation
- Word mastery: 3 correct in a row = mastered
- Coin burst on correct answers (physics-based arcs via rAF)
- Confetti on milestones (50% mastery, 100% mastery, level ups)
- Sadie (the dog) appears at streak multiples of 10 -- her photo is base64-embedded
- Answer streak rewards: 20 streak = $2, 30 streak = $5, 40 streak = $10. Timestamped for screenshotting
- Daily streak calendar (visible in Words tab): tracks consecutive days practiced. Prizes: 7 days = $3, 14 days = $5, 30 days = $10
- Daily login bonus (+10 XP)
- Set filters: All 45, Week 3A-4B, Week 2B, Needs Practice
- **Achievement badges** -- 16 badges earned through milestones (first correct, first mastery, perfect rounds, streaks, XP thresholds). Toast notification slides in at top on unlock. Badge grid in Words tab shows earned/locked state.
- **Unlockable themes** -- 6 color themes (Default, Sakura, Ocean, Sunset, Neon, Midnight). Each unlocks with a specific badge. Theme picker in Words tab as colored dots. Active theme persisted across sessions.
- **Mystery 2x XP** -- ~15% random chance on correct answers in Match, Speed, Context and Pairs. Golden "2x XP!" popup and shimmer effect on the answer button.
- **Sadie dashboard thumbnail** -- 32px circular Sadie photo in the header. Changes state: sleeping (greyscale + zzz) when not practiced today, happy when practiced, excited (fire) on 5+ streak, proud (star) for 30s after a perfect round.

### Data persistence
- All progress in localStorage (key: `lucyVocab`)
- Tracks: XP, streaks (answer + daily), best streaks, sessions, accuracy, speed high score, per-word mastery with lastCorrect timestamps, daily history, daily rewards, badges earned, unlocked themes, active theme, perfect round flags
- State migration: new fields default in gracefully, existing localStorage unaffected
- Reset button with confirmation in Stats tab

## Files

- `index.html` -- the game
- `sw.js` -- service worker (network-first caching, auto-reload on new versions)
- `manifest.json` -- PWA manifest for home screen install
- `sadie.png` -- original Sadie photo (base64-compressed version embedded in HTML)
- `apple-touch-icon.png` / `favicon.png` / `icon-1024.png` -- app icons
- `README.md` -- this file

## Tech notes

- Single HTML file, all CSS/JS inline, no dependencies
- Vanilla JS, no frameworks
- Service worker: network-first strategy, auto-reloads when new version deployed (bump CACHE_VERSION in sw.js)
- Canvas drawing uses 420x420 resolution, CSS-scaled to viewport
- Draw scoring: renders target character on hidden canvas, downsamples both to 30x30 grid, calculates F1 (precision + recall) of pixel overlap
- Speech recognition uses persistent continuous session to avoid repeated mic permission prompts on file:// URLs
- TTS rate set to 0.85 for clearer pronunciation
- Responsive design, works on laptop and phone
- Sadie photo compressed to ~10KB JPEG before base64 encoding
