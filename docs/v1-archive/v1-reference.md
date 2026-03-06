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

## V1 UI (current — reverted from v2)

Locket-inspired redesign. One action per screen, two screens with a floating bottom nav pill.

### Home screen
- **Mastery grid**: 45 tiles in a 5-column grid. Each tile shows the first 1-2 characters and a short English label. Border color reflects mastery state (green = mastered, amber = fading, red = needs review, accent = learning, none = unseen).
- **Summary line**: "X mastered · Y learning · Z new"
- **Practice button**: golden 72px circle (Locket shutter style). Launches a mixed-mode practice session.
- Tap any tile for word detail overlay (character, pinyin, English, audio, mastery stats, "Practice this word" button).

### Progress screen
- Big streak number with best streak
- 5-week calendar grid (dark rounded squares, accent fill for practiced days)
- Daily prize indicators (7d=$3, 14d=$5, 30d=$10)

### Top bar
- Flame + daily streak count (left)
- Palette button (right) opens theme picker overlay with reset progress option

### Bottom nav
- Floating pill with two icon buttons: Home (grid) and Progress (calendar)

### Practice sessions
Tapping the practice button launches a full-screen overlay with 10 questions drawn from a weighted mix of four modes:

1. **Flashcard (40%)** -- tap to flip, swipe or buttons for got it / need practice. Mastery dots, audio, mic for speech recognition. Keyboard: space to flip, arrows to answer.
2. **Match (25%)** -- 4-option multiple choice, 10s timer. Alternates Chinese-to-English, English-to-Chinese, Pinyin-to-English. Half of hanzi questions are audio-only. Auto-pronounces each word.
3. **Context (20%)** -- fill-in-the-blank Chinese sentences, 4 word choices, 15s timer. 30 sentences for the 3A4B set (2 per word).
4. **Pairs (15%)** -- 4 Chinese + 4 English tiles in a grid. Tap to match. Takes ~4 question slots.

Progress shown as 10 dots at top (grey = pending, accent = current, green = correct, red = wrong). Session ends with score, mistake review with audio buttons, and Done/Again actions.

Word detail "Practice this word" launches a focused session on that word.

### Audio features
- **TTS pronunciation** -- Web Speech API (`zh-CN`). Speaker buttons on flashcards, match, word details.
- **Speech recognition** -- `webkitSpeechRecognition` in continuous mode (one-time mic permission). Mic button on flashcard back. Compares recognized text against expected characters.

### Word list (45 words)
- **Week 3A-4B** (15 words): food, drinks, Dragon Boat Festival vocab
- **Week 2B** (30 words): Spring Festival / Chinese New Year vocab

Each word has: characters, pinyin, English meaning.

### Mastery system
- Visual mastery states that decay over time: mastered (green, <7 days), fading (amber, 7-14 days), needs review (red, 14+ days), learning (accent color), unseen (grey).
- Spaced repetition weighting by: days since last correct, wrong ratio, mastery staleness. Unseen words get highest priority. Mastered words resurface after 3-7 days.
- Word mastery: 3 correct in a row = mastered.

### Themes

6 color themes that override the full palette via CSS custom properties:

| Theme | Accent | Unlock condition |
|-------|--------|-----------------|
| Default | purple | -- |
| Sakura | pink | Master first word |
| Ocean | blue | Perfect Match round |
| Sunset | orange | Master 50% of words |
| Neon | green | 500 XP |
| Midnight | lavender | 7-day daily streak |

Theme picker accessed via palette button in top bar.

### Engagement
- XP system with levels: Beginner (0) > Intermediate (200) > Advanced (500) > Master (1000). XP awarded but bar not visible (decluttered UI).
- Answer streak counter with fire animation
- Coin burst on correct answers (physics-based arcs via rAF)
- Confetti on milestones (colors match active theme)
- Sadie (the dog) appears at streak multiples of 10. Tap to dismiss. Photo shown in welcome overlay too.
- Answer streak rewards: 20=$2, 30=$5, 40=$10. Timestamped receipt for screenshotting.
- Daily login bonus (+10 XP)
- 16 achievement badges with toast notifications on unlock (no visible badge grid)
- Mystery 2x XP (~15% chance on correct answers). Golden popup and shimmer effect.
- Daily streak rewards at 7/14/30 consecutive days

### Data persistence
- All progress in localStorage (key: `lucyVocab`)
- Tracks: XP, streaks (answer + daily), best streaks, sessions, accuracy, speed high score, per-word mastery with lastCorrect timestamps, daily history, daily rewards, badges, unlocked themes, active theme, perfect round flags
- Full backward compatibility with v1 localStorage data
- State migration: new fields default in gracefully
- Reset button in theme overlay

## Files

- `index.html` -- the game, v1 (reverted from v2; all CSS/JS inline)
- `index-v1.html` -- v1 source copy
- `index-v2.html` -- v2 (not active; preserved for reference)
- `sw.js` -- service worker (network-first caching, auto-reload on new versions)
- `manifest.json` -- PWA manifest for home screen install
- `sadie.png` -- original Sadie photo (base64-compressed version embedded in HTML)
- `apple-touch-icon.png` / `favicon.png` / `icon-1024.png` -- app icons

## Removed in v2

These v1 features were intentionally stripped for simplicity:
- Visible XP bar and level display
- Speed mode
- Mode navigation buttons (flashcard/match/speed/context/pairs)
- Set filter buttons (All 45 / Week 3A-4B / Week 2B / Needs Practice)
- Stats dashboard with three tabs (Progress/Collection/Words)
- Badge grid
- Mastery segmented bar
- Practice hardest button
- Sadie thumbnail in header

## Tech notes

- Single HTML file, no dependencies, vanilla JS
- CSS custom properties for theming, `color-mix()` for transparent accent variants (Safari 16.2+)
- Service worker: network-first strategy, auto-reloads on new version (bump `CACHE_VERSION` in sw.js)
- Speech recognition uses persistent continuous session to avoid repeated mic permission prompts
- TTS rate set to 0.85 for clearer pronunciation
- Responsive design for 320-480px viewports
- Sadie photo compressed to ~10KB JPEG before base64 encoding
