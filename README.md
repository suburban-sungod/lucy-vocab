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
2. **Match** -- 4-option multiple choice, 10s timer, 15 questions per session. Alternates Chinese-to-English, English-to-Chinese, Pinyin-to-English. Half of hanzi questions are audio-only. Auto-pronounces each word. Review screen shows mistakes with "Study Mistakes" option.
3. **Speed Round** -- 30 second blitz. High score saved. Mistakes shown in results.
4. **Context** -- fill-in-the-blank Chinese sentences, 4 word choices, 15s timer. 30 sentences for 3A4B set (2 per word). 15 questions per session with review screen.
5. **Pairs** -- 4 Chinese + 4 English tiles in a grid. Tap to match. Timer counts up. 3 rounds per session, results show per-round times.

### Audio features
- **TTS pronunciation** -- Web Speech API (`zh-CN`). Speaker buttons on flashcards, match mode, word details.
- **Speech recognition** -- `webkitSpeechRecognition` in continuous mode (one-time mic permission). Mic button on flashcard back. Compares recognized text against expected characters. Best in Chrome.

### Stats page (tabbed)

Accessed via bar chart icon in header top-right (SVG, inherits theme color). Second tap returns to previous mode.

Three tabs:
- **Progress** -- accuracy, best streak, sessions, total XP. Daily streak calendar tracking consecutive practice days with prize milestones (7d=$3, 14d=$5, 30d=$10).
- **Collection** -- theme picker (colored dots, bg + accent preview) with unlock hints. Badge grid showing 16 achievements (earned/locked).
- **Words** -- mastery grid of all 45 words. Tap any word for detail overlay (streak, accuracy, times seen, last practiced, audio, practice button). Reset button.

Active tab persists across mode switches and sessions.

### Mastery system
- Prominent mastery overview at top of app with color-segmented progress bar. Reflects the active set filter.
- Visual mastery states that decay over time: mastered (green, <7 days), fading (amber, 7-14 days), needs review (red, 14+ days), learning (accent color), unseen (grey).
- "Practice 5 hardest words" button always visible, picks weakest/stalest words.
- Spaced repetition weighting by: days since last correct, wrong ratio, mastery staleness. Unseen words get highest priority. Mastered words resurface after 3-7 days. Applied across flashcards, match and speed.

### Themes

6 color themes that override the full palette (bg, surface, surface2, accent, accent2, text, text2, overlay):

| Theme | Accent | Unlock condition |
|-------|--------|-----------------|
| Default | purple | -- |
| Sakura | pink | Master first word |
| Ocean | blue | Perfect Match round |
| Sunset | orange | Master 50% of words |
| Neon | green | 500 XP |
| Midnight | lavender | 7-day daily streak |

All surfaces, overlays, borders and confetti respond to the active theme via CSS custom properties and `color-mix()`. Theme picker shows bg color with accent border for a 2-color preview.

### Engagement
- XP system with levels: Beginner (0) > Intermediate (200) > Advanced (500) > Master (1000)
- Answer streak counter with fire animation
- Word mastery: 3 correct in a row = mastered
- Coin burst on correct answers (physics-based arcs via rAF)
- Confetti on milestones (colors match active theme)
- Sadie (the dog) appears at streak multiples of 10 -- photo is base64-embedded
- Answer streak rewards: 20=$2, 30=$5, 40=$10. Timestamped receipt for screenshotting.
- Daily login bonus (+10 XP)
- Set filters: All 45, Week 3A-4B, Week 2B, Needs Practice
- 16 achievement badges with toast notifications on unlock
- Mystery 2x XP (~15% chance on correct answers). Golden popup and shimmer effect.
- Sadie dashboard thumbnail in header. States: sleeping (greyscale + zzz), happy (practiced today), excited (fire, 5+ streak), proud (star, after perfect round).

### Data persistence
- All progress in localStorage (key: `lucyVocab`)
- Tracks: XP, streaks (answer + daily), best streaks, sessions, accuracy, speed high score, per-word mastery with lastCorrect timestamps, daily history, daily rewards, badges, unlocked themes, active theme, active stats tab, perfect round flags
- State migration: new fields default in gracefully, existing localStorage unaffected
- Reset button with confirmation in Words tab

## Files

- `index.html` -- the game (all CSS/JS inline)
- `sw.js` -- service worker (network-first caching, auto-reload on new versions)
- `manifest.json` -- PWA manifest for home screen install
- `sadie.png` -- original Sadie photo (base64-compressed version embedded in HTML)
- `apple-touch-icon.png` / `favicon.png` / `icon-1024.png` -- app icons

## Tech notes

- Single HTML file, no dependencies, vanilla JS
- CSS custom properties for theming, `color-mix()` for transparent accent variants (Safari 16.2+)
- Service worker: network-first strategy, auto-reloads on new version (bump `CACHE_VERSION` in sw.js)
- Speech recognition uses persistent continuous session to avoid repeated mic permission prompts
- TTS rate set to 0.85 for clearer pronunciation
- Responsive design, works on laptop and phone
- Sadie photo compressed to ~10KB JPEG before base64 encoding
