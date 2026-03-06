# Tasks: v2 Rebuild

**Input**: Design documents from `/specs/001-v2-rebuild/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No automated tests (zero-dependency constraint). Manual testing via local HTTP server.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create project file structure and app shell

- [X] T001 Create directory structure: `css/`, `js/`, `js/data/`, `js/modes/`, `js/ui/`, `assets/`
- [X] T002 Create `index.html` app shell with `<script type="module" src="js/app.js">`, viewport meta, PWA meta tags, apple-mobile-web-app tags, and container divs for screens (home, grid, progress) and overlay container. Link all CSS files.
- [X] T003 [P] Create `manifest.json` with app name "Lucy's Chinese Vocab", display standalone, theme-color, icon references to `assets/`
- [X] T004 [P] Copy PWA icon files (`apple-touch-icon.png`, `favicon.png`, `icon-1024.png`) from v1 repo into `assets/`

**Checkpoint**: Opening index.html via HTTP server shows a blank page with no errors in console

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules that ALL user stories depend on. Must be complete before any story work begins.

**Data Files**

- [X] T005 [P] Create `js/data/words.js` -- export the 45-word vocabulary array from v1 with `{hanzi, pinyin, english, set}` fields. 15 words in set '3A4B', 30 in set '2B'. Copy exact data from v1-source.html lines 564-609.
- [X] T006 [P] Create `js/data/sentences.js` -- export 90 context sentences array. Copy 30 existing 3A4B sentences from v1-source.html lines 613-643. Author 60 new sentences for Week 2B words (2 per word, same format: `{sentence, answer, english}`). Sentences must be age-appropriate for a 7-year-old learner.
- [X] T007 [P] Create `js/data/badges.js` -- export 16 badge definitions array from v1 with `{id, emoji, name, desc}` fields. Do NOT include `test` functions here (those depend on state and belong in engagement.js). Copy badge data from v1-source.html lines 935-951.
- [X] T008 [P] Create `js/data/themes.js` -- export 6 theme definitions array with `{id, name, bg, accent, badge}` fields. Copy from v1-source.html lines 955-961.
- [X] T009 [P] Create `assets/sadie.js` -- export Sadie photo as base64 string constant. Extract from v1-source.html embedded base64.

**Core Modules**

- [X] T010 Create `js/state.js` -- implement `loadState()`, `saveState()`, `getState()`, `resetState()`. Load from localStorage `lucyVocab` key, return default state if missing. Default state per data-model.md AppState table (all v1 fields + schemaVersion, sessionsToday, lastSessionDate). Daily reset logic: if lastSessionDate !== today, reset sessionsToday to 0. Export functions for state access and mutation.
- [X] T011 Create `js/mastery.js` -- implement `getMasteryState(wordMastery)` returning computed state (unseen/learning/mastered/fading/needs-review) per data-model.md Mastery State table. Implement `getWordState(hanzi)` to read/init per-word mastery from state. Implement `updateWordMastery(hanzi, correct)` to update streak, correct/wrong counts, lastCorrect timestamp, and mastered flag (threshold: 3 consecutive correct). Export all functions.
- [X] T012 Create `js/audio.js` -- implement `speakChinese(text)` using Web Speech API with zh-CN voice at 0.85 rate. Implement `initSpeechRecognition()` for continuous mode webkitSpeechRecognition with mic permission. Include feature detection: export `hasTTS()` and `hasRecognition()` booleans. Graceful no-op when APIs unavailable.
- [X] T013 Create `js/modes/mode-registry.js` -- export `registerMode(id, config)` where config has `{name, setup(container, options), cleanup()}`. Export `getMode(id)` and `getAllModes()`. The registry is a simple Map. This is the extensibility point per constitution Principle IX.

**CSS Foundation**

- [X] T014 [P] Create `css/base.css` -- CSS reset, `:root` custom properties for default theme colors (--bg:#0f0f1a, --surface:#1a1a2e, --surface2:#252542, --accent:#7c5cfc, --accent2:#ff6b9d, --gold:#ffd700, --green:#00e676, --red:#ff5252, --text:#e8e8f0, --text2:#8888aa, --radius:16px), body font-family, app container (max-width:480px, centered), dark background, 100dvh min-height. Include keyframe animations: pulse, shake, shimmer. Include `:focus-visible` outline styles for all interactive elements (buttons, nav items, tiles) using accent color, 2px offset. Hide on touch (`:focus:not(:focus-visible)` removes outline).
- [X] T015 [P] Create `css/themes.css` -- define `[data-theme]` selectors for all 6 themes overriding --bg, --accent and derived colors. Use `color-mix()` for transparent accent variants. Themes: sakura (--accent:#e8789a), ocean (--accent:#3db8e8), sunset (--accent:#e87830), neon (--accent:#00e676), midnight (--accent:#8888cc).
- [X] T016 [P] Create `css/practice.css` -- shared practice mode styles: flashcard (3D flip, front/back faces, aspect-ratio 3/4), quiz prompt, quiz options grid, timer bar, progress dots (10 dots), audio/mic buttons (44px min), mastery dots, card actions (got-it/need-practice buttons), answer streak fire animation.
- [X] T017 [P] Create `css/overlays.css` -- overlay base (fixed, full-screen, dark semi-transparent background), word detail overlay, theme picker overlay, results overlay, badge toast, reward receipt, Sadie popup. All with smooth enter/exit transitions.

**App Entry Point**

- [X] T018 Create `js/app.js` -- import all modules (state, mastery, audio, mode-registry, all modes, all UI, engagement, animations, session). On DOMContentLoaded: call `loadState()`, apply saved theme, render initial screen (home), set up nav event listeners. Implement simple router: `showScreen(name)` that shows/hides screen containers and updates nav active state. Export `showScreen` for use by other modules.

**Checkpoint**: App loads via HTTP server, shows empty screens, console shows all modules loaded without errors. State initializes in localStorage.

---

## Phase 3: User Story 1 - Structured Practice Session (Priority: P1)

**Goal**: Lucy can start a session and complete all 3 steps: flashcard review, 3 practice rounds, writing practice

**Independent Test**: Start a session from home screen, complete all steps, see results screen with score

### Implementation for User Story 1

- [X] T019 [US1] Create `js/session.js` -- implement session state machine per data-model.md Session entity. States: IDLE, FLASHCARD_REVIEW, PRACTICE_ROUND (with round counter 1-3), WRITING, RESULTS. Implement `startSession()`: select 5 priority flashcard words via mastery.js, determine mode rotation for 3 rounds (cycling match→context→pairs), select 5 priority writing words. Implement `advanceStep()` for state transitions. Implement `endSession()`: increment sessionsToday, check daily streak (3 sessions = practiced day), save state. Export session control functions.
- [X] T020 [US1] Implement session step progress UI in `js/session.js` -- render a step indicator showing current position in the flow (e.g. "Step 1 of 3: Flashcard Review", "Round 2 of 3: Context") at top of practice screen. Update on each transition.
- [X] T021 [US1] Create `js/modes/flashcard.js` -- import `registerMode` from mode-registry.js. Register 'flashcard' mode. Implement `setup(container, {words})`: render card with front (hanzi, large) and back (pinyin + english). Tap to flip (CSS 3D transform). Got-it/Need-practice buttons below. Audio button (speakChinese) on front, mic button on back (speech recognition). Mastery dots (3 dots showing streak progress). After response, call `updateWordMastery()` and advance to next card. After 5 cards, signal step complete.
- [X] T022 [US1] Create `js/modes/match.js` -- import `registerMode`. Register 'match' mode. Implement `setup(container, {words, questionCount: 10})`: generate 10 questions. Each question: pick a word, pick direction (Chinese→English, English→Chinese, Pinyin→English, alternating), generate 3 distractors. If direction is Chinese and random < 0.5, make it audio-only (hide hanzi, auto-speak). Show 4-option buttons, 10s countdown timer. On correct: green flash, XP. On wrong/timeout: red flash, show correct answer. Progress dots at top. After 10 questions, signal round complete.
- [X] T023 [US1] Create `js/modes/context.js` -- import `registerMode`. Register 'context' mode. Implement `setup(container, {questionCount: 10})`: pick 10 random sentences from sentences.js. Display sentence with blank, 4 word choices (1 correct + 3 distractors from same set), 15s timer. On correct/wrong: update word mastery, show feedback. Progress dots. After 10 questions, signal round complete.
- [X] T024 [US1] Create `js/modes/pairs.js` -- import `registerMode`. Register 'pairs' mode. Implement `setup(container, {questionCount: 10})`: generate boards of 4 Chinese + 4 English tiles. Tap to select, tap match. Correct pair: tiles disappear with animation. Wrong: shake and reset. Track time per board. Each board counts as ~4 question slots. After ~10 slots consumed (2-3 boards), signal round complete.
- [X] T025 [US1] Implement results screen in `js/ui/overlays.js` -- render session results overlay: total score (correct/total across all steps), mistake review list (each mistake shows hanzi, pinyin, english, audio replay button), Done button (returns to home, increments session count), Again button (starts new session). Calculate and display XP earned.

**Checkpoint**: Can start a session, complete flashcard review (5 cards), 3 practice rounds (match, context, pairs with 10 questions each), see results with Done/Again. Mastery data updates in localStorage.

---

## Phase 4: User Story 2 - Home Screen with Session Launcher (Priority: P1)

**Goal**: Session-focused home screen with start button, daily progress, streak, mastery summary

**Independent Test**: Open app, see session count (X of 3), streak, mastery summary, tap Start to begin session

### Implementation for User Story 2

- [X] T026 [P] [US2] Create `css/home.css` -- home screen layout: centered content, large "Start Session" button (golden, 72px circle, Locket-style shutter), session progress indicator (X of 3), streak display with flame icon, mastery summary bar. Celebration state styles for when all 3 sessions complete. Dark theme, rounded surfaces, large typography.
- [X] T027 [US2] Create `js/ui/home.js` -- import state, mastery, session modules. Implement `renderHome(container)`: show "Start Session" button wired to `startSession()`, today's progress ("X of 3 done" from state.sessionsToday), current daily streak with flame icon, mastery summary computed from all 45 words (count mastered/learning/new). If sessionsToday >= 3: show celebration state with confetti trigger, change button to "Bonus Session". Re-render on state changes.
- [X] T028 [US2] Create `js/ui/nav.js` -- implement floating bottom nav pill with 3 buttons: Home (house icon), Mastery (grid icon), Progress (calendar icon). Highlight active screen. Wire taps to `showScreen()` from app.js. Implement top bar: streak count with flame (left), palette button (right, wired to theme picker overlay). Hide bottom nav when practice session active (FR-055).

**Checkpoint**: App opens to home screen with Start Session button, shows 0 of 3, streak count, mastery summary. Tapping Start launches a session. Bottom nav switches between screens.

---

## Phase 5: User Story 3 - Writing Practice Mode (Priority: P1)

**Goal**: Listen-write-reveal self-check flow for 5 words, 3 attempts each

**Independent Test**: Enter writing step in session, hear word via TTS, tap reveal to see character, mark got-it/need-practice, complete all 15 interactions

### Implementation for User Story 3

- [X] T029 [US3] Create `js/modes/writing.js` -- import `registerMode`. Register 'writing' mode. Implement `setup(container, {words})`: for each of 5 words, run 3-attempt cycle. Each attempt: (1) auto-speak word via TTS, show "Write this character on paper" prompt with large replay button (tap to hear again), attempt counter ("Attempt 1 of 3"). (2) "Show Answer" button (44px+ touch target). On tap, reveal hanzi character large and centered with pinyin below. (3) Two response buttons: "Got it" (green) and "Practice more" (red). "Got-it" calls `updateWordMastery(hanzi, true)`, "Practice more" calls `updateWordMastery(hanzi, false)`. After 3 attempts, advance to next word. After all 5 words done, signal step complete with results.
- [X] T030 [US3] Add writing practice CSS to `css/practice.css` -- styles for writing mode: large prompt text, replay button (centered, prominent), reveal animation (scale-up character), large hanzi display (4rem+), got-it/practice-more button pair, attempt counter. TTS-unavailable fallback: show pinyin as prompt instead of audio.

**Checkpoint**: Writing practice works within session flow. Words are spoken, Lucy taps reveal, self-reports, each word repeats 3 times, results captured.

---

## Phase 6: User Story 4 - Data Migration from v1 (Priority: P1)

**Goal**: v1 localStorage data migrates seamlessly on first v2 load

**Independent Test**: Seed localStorage with v1-format data, load v2, verify all progress preserved

### Implementation for User Story 4

- [X] T031 [US4] Add v1 migration logic to `js/state.js` -- in `loadState()`, after reading `lucyVocab` JSON: check if `schemaVersion` field is missing (indicates v1 data). If v1: add `schemaVersion: 2`, add `sessionsToday: 0`, add `lastSessionDate: ''`. Backfill any missing v1 fields with defaults (dailyHistory, dailyStreak, bestDailyStreak, dailyRewards, badges, unlockedThemes, activeTheme, lastPerfectRound, _perfectMatch, _perfectContext, _lightningPairs, activeStatsTab). Preserve ALL existing field values unchanged. Save migrated state back to localStorage immediately.
- [X] T032 [US4] Add localStorage error handling to `js/state.js` -- wrap localStorage reads in try/catch. If localStorage unavailable or full: set in-memory flag `persistenceAvailable = false`, initialize default state in memory, show user-friendly message via a toast ("Progress won't be saved this session"). All save operations check the flag before writing.

**Checkpoint**: Copy v1 state JSON into localStorage `lucyVocab` key via console. Load v2 app. Verify XP, streaks, word mastery, badges and themes are all intact. Mastery grid shows correct colors.

---

## Phase 7: User Story 5 - Spaced Repetition and Mastery Decay (Priority: P1)

**Goal**: Words decay over time, selection algorithm prioritizes review-needed words

**Independent Test**: Set word timestamps to various ages, verify grid colors and selection priority

### Implementation for User Story 5

- [X] T033 [US5] Implement word selection algorithm in `js/mastery.js` -- add `selectPriorityWords(count, exclude)` function. Calculate priority score per word: unseen words get highest score (1000), needs-review (14+ days) get 500 + days, fading (7-14 days) get 300 + days, learning get 100 + wrongRatio * 50, mastered get 10. Sort by score descending, return top `count` words. Accept `exclude` array to avoid repeating words between flashcard and writing selections in same session.
- [X] T034 [US5] Implement mastery summary in `js/mastery.js` -- add `getMasterySummary()` that returns `{mastered, fading, needsReview, learning, unseen}` counts computed across all 45 words. Used by home screen and mastery grid.

**Checkpoint**: With manipulated timestamps in localStorage, verify: mastered words show green (<7d), fading shows amber (7-14d), needs-review shows red (14d+). Priority selection favors unseen > needs-review > fading > learning.

---

## Phase 8: User Story 6 - Progress Screen (Priority: P2)

**Goal**: Daily streak, best streak, 5-week calendar, daily prize milestones

**Independent Test**: Navigate to progress screen, verify streak numbers, calendar fills, prize indicators

### Implementation for User Story 6

- [X] T035 [P] [US6] Create `css/progress.css` -- progress screen layout: big streak number with flame icon and "day streak" label, best streak below, 5-week calendar grid (7 columns, dark rounded squares, accent fill for practiced days), daily prize indicators (7d=$3, 14d=$5, 30d=$10) with highlighted/claimed states.
- [X] T036 [US6] Create `js/ui/progress.js` -- import state. Implement `renderProgress(container)`: display current dailyStreak (large number), bestDailyStreak, 5-week calendar grid computed from dailyHistory (last 35 days, mark practiced days with accent fill), daily prize milestones with amounts and claimed/unclaimed status from dailyRewards. Re-render on state changes.

**Checkpoint**: Progress screen shows streak data, calendar fills match dailyHistory, prize milestones display correctly.

---

## Phase 9: User Story 7 - Theme System (Priority: P2)

**Goal**: Theme picker overlay, 6 themes with unlock conditions, instant theme switching

**Independent Test**: Open theme picker, verify locked/unlocked states, select theme, verify full app recolors

### Implementation for User Story 7

- [X] T037 [US7] Implement theme management in `js/ui/overlays.js` -- add `renderThemePicker(container)` function. Import themes data and state. For each theme: show name, accent color swatch, lock/unlock status. Locked themes show unlock condition text (badge name). Unlocked themes are tappable: on select, set `data-theme` attribute on `<html>`, update `state.activeTheme`, save state. Include reset progress button at bottom with confirmation dialog. Wire palette button in top bar to open this overlay.
- [X] T038 [US7] Implement theme unlock checking in `js/engagement.js` (or create if not yet exists) -- add `checkThemeUnlocks()` that cross-references earned badges with theme unlock requirements. When a badge is earned, check if it unlocks a new theme and add to `state.unlockedThemes`. Called after badge checks.

**Checkpoint**: Theme picker shows 6 themes. Default is unlocked. Earning badges unlocks themes. Selecting a theme instantly recolors the entire app. Reset progress works with confirmation.

---

## Phase 10: User Story 8 - Engagement Features (Priority: P2)

**Goal**: XP, levels, achievements, animations, rewards, Sadie

**Independent Test**: Answer correctly, see coin burst. Hit streaks, see Sadie. Earn badge, see toast.

### Implementation for User Story 8

- [X] T039 [US8] Create `js/engagement.js` -- implement XP system: `addXP(amount)` updates state.xp, checks level transitions (Beginner 0, Intermediate 200, Advanced 500, Master 1000), triggers level-up popup. Implement `checkBadges()`: evaluate all 16 badge conditions against current state, award new badges with timestamp, trigger toast notification and theme unlock check. Implement streak tracking: answer streak counter, best streak update. Implement daily login bonus: +10 XP on first open each day. Implement mystery 2x XP: ~15% random chance on correct answer, golden popup. Implement answer streak rewards: 20=$2, 30=$5, 40=$10 with timestamped receipt. Implement daily streak rewards: 7d=$3, 14d=$5, 30d=$10 check via `checkDailyRewards()`.
- [X] T040 [US8] Create `js/animations.js` -- implement `spawnCoins(count)`: physics-based coin arcs via requestAnimationFrame, golden circles that arc and fade. Implement `spawnConfetti(count)`: colored particles using active theme accent color + complements. Implement `showSadie()`: display Sadie photo (from assets/sadie.js base64) as centered popup at answer streak multiples of 10, tap to dismiss. Implement `showBadgeToast(badge)`: slide-in toast with emoji and badge name, auto-dismiss after 3s. Implement `showReward(amount, title, subtitle)`: reward receipt overlay with dollar amount, timestamp, screenshot-friendly layout. Implement `showXPPopup(text)`: brief floating text for level-ups and 2x XP.

**Checkpoint**: Correct answers trigger coin burst + XP. Streak of 10 shows Sadie. Badge conditions trigger toasts. Mystery 2x XP appears randomly. Reward receipts show at streak milestones.

---

## Phase 11: User Story 9 - Offline Support and Auto-Update (Priority: P2)

**Goal**: App works offline, auto-updates on new deploy

**Independent Test**: Load app, go offline, verify full functionality. Deploy new version, verify auto-refresh.

### Implementation for User Story 9

- [X] T041 [US9] Create `sw.js` -- service worker at repository root. Define `CACHE_VERSION` (start at 1). Define `PRECACHE_URLS` array listing all app files (index.html, all css/*.css, all js/**/*.js, manifest.json, asset files). On install: precache all URLs. On activate: delete old caches. On fetch: network-first strategy (try fetch, fall back to cache). On new version detected (different cache name): post message to client to trigger reload. Include `self.skipWaiting()` and `clients.claim()` for immediate activation.
- [X] T042 [US9] Add service worker registration to `index.html` -- add inline script (not module) that registers `sw.js` if `'serviceWorker' in navigator`. Listen for `controllerchange` event to auto-reload when new version activates. Show brief "Updating..." toast before reload.

**Checkpoint**: Load app, disconnect network, refresh -- app still works fully. Bump CACHE_VERSION, reload -- app auto-refreshes to new version.

---

## Phase 12: User Story 2 (continued) - Mastery Grid View (Priority: P1)

**Goal**: 45-tile mastery grid with color-coded borders, word detail overlay

**Independent Test**: Navigate to mastery grid, verify tile colors match mastery states, tap tile for word detail

### Implementation for User Story 2 (continued)

- [X] T043 [P] [US2] Create `css/grid.css` -- mastery grid layout: 5-column CSS grid, tiles with character preview (1-2 chars) and short English label, colored borders (green/amber/red/accent/grey per mastery state), small mastery icon overlay per tile (checkmark for mastered, clock for fading, exclamation for needs-review, dot for learning), hover/tap states. Word detail overlay styles. Responsive for 320-480px viewport.
- [X] T044 [US2] Create `js/ui/grid.js` -- import words data, mastery module, state. Implement `renderGrid(container)`: create 45 tiles, each showing first 1-2 characters of hanzi and truncated English label. Compute mastery state per word and apply border color class (mastered=green, fading=amber, needs-review=red, learning=accent, unseen=grey). Add secondary mastery indicator (small icon/label) per constitution Principle VII. On tile tap: show word detail overlay.
- [X] T045 [US2] Implement word detail overlay in `js/ui/overlays.js` -- render overlay showing: large hanzi, pinyin, English meaning, audio button (speakChinese), mastery stats (streak, total correct, last practiced), "Practice this word" button that launches a focused mini-drill. Mini-drill: flashcard for the word, 3-4 match/context questions featuring that word, writing practice for that word (3 attempts). Uses session.js in mini-drill mode.

**Checkpoint**: Mastery grid shows 45 tiles with correct mastery colors. Tapping a tile shows word detail with audio and stats. "Practice this word" launches mini-drill.

---

## Phase 13: User Story 10 & 11 - Architecture Validation & Interface Polish (Priority: P2)

**Goal**: Verify modular architecture, polish interface to Duolingo/Locket standards

**Independent Test**: Verify mode registration works, all touch targets >= 44px, smooth transitions

### Implementation

- [X] T046 [US10] Validate mode registry extensibility -- create a minimal test: add a dummy mode file that registers itself, verify it appears in `getAllModes()` without modifying any existing files. Document the pattern in a code comment at top of `mode-registry.js`. Remove dummy file after validation.
- [X] T047 [US11] Add screen transitions to `js/app.js` -- implement smooth CSS transitions between screens (fade or slide). Nav button taps trigger transition animation before switching screen content. Practice session entry/exit uses full-screen slide-up/down.
- [X] T048 [US11] Add keyboard shortcuts to practice modes -- in `js/session.js`: listen for keydown events during practice. Space bar: flip flashcard / advance writing step. Arrow left: "Need practice" / wrong. Arrow right: "Got it" / select. Number keys 1-4: select match/context options. Escape: exit session (with confirmation).
- [X] T049 [US11] Audit and fix touch targets -- review all interactive elements across all screens. Ensure minimum 44x44px touch targets on buttons, nav items, tiles, overlay controls. Fix any undersized targets by increasing padding or min-width/min-height.

**Checkpoint**: All screens have smooth transitions. Keyboard shortcuts work in practice modes. All touch targets pass 44px minimum. Mode registry allows adding new modes without modifying existing files.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge cases, content authoring

- [X] T050 Wire engagement hooks into practice modes -- ensure every correct/wrong answer across all modes calls appropriate engagement functions: `addXP()`, update answer streak, `checkBadges()`, trigger animations (coins, confetti, Sadie, mystery 2x). Ensure session completion triggers daily streak check.
- [X] T051 Implement edge case handling -- localStorage full/unavailable toast (T032 fallback), pairs mode with <4 words (skip mode or reduce board), mid-session exit (save completed step progress, discard incomplete), all-45-mastered celebration (confetti + achievement check), bonus session (4th+) doesn't re-increment daily streak.
- [X] T052 Review and verify content in `js/data/sentences.js` -- proofread all 90 context sentences for accuracy, age-appropriate language, correct blank placement, and matching English translations. Ensure 2B sentences match the vocabulary level of the word set.
- [X] T053 Final CSS polish -- verify dark theme defaults look correct across all screens, ensure no hard-coded colors (all via custom properties), test all 6 themes render correctly, verify `color-mix()` transparent variants work in Safari 16.2+, ensure no flash of unstyled content on theme switch.
- [X] T054 Update `sw.js` precache list -- add all final file paths to the PRECACHE_URLS array. Verify the list matches the actual file structure. Set initial CACHE_VERSION for first deploy.
- [X] T055 End-to-end walkthrough -- complete 3 full sessions to earn a daily streak. Verify: home screen updates session count, mastery grid reflects changes, progress screen shows streak and calendar, engagement features fire correctly, writing practice works with TTS, results screen shows accurate scores, daily streak increments after 3rd session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion -- BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (needs state, mastery, audio, mode-registry, CSS)
- **US2 (Phase 4)**: Depends on Phase 2 (needs state, mastery for summary)
- **US3 (Phase 5)**: Depends on Phase 2 (needs audio, mode-registry, mastery)
- **US4 (Phase 6)**: Depends on T010 (state.js exists to add migration logic)
- **US5 (Phase 7)**: Depends on T011 (mastery.js exists to add selection algorithm)
- **US2 continued (Phase 12)**: Depends on Phase 2 + T045 depends on session.js (T019) for mini-drill
- **US6 (Phase 8)**: Depends on Phase 2 (needs state for streak data)
- **US7 (Phase 9)**: Depends on Phase 2 + US8 (needs badge checking for unlocks)
- **US8 (Phase 10)**: Depends on Phase 2 (needs state, mastery)
- **US9 (Phase 11)**: Depends on all other phases (needs final file list for precache)
- **US10/11 (Phase 13)**: Depends on all mode implementations (Phases 3, 5)
- **Polish (Phase 14)**: Depends on all user stories complete

### Recommended Execution Order

1. Phase 1 (Setup)
2. Phase 2 (Foundational) -- all [P] tasks in parallel
3. Phase 6 (US4 - Migration) + Phase 7 (US5 - Spaced repetition) -- can run in parallel, both extend foundational modules
4. Phase 4 (US2 - Home screen) -- gives a visible landing page
5. Phase 3 (US1 - Session + practice modes) -- the big implementation phase
6. Phase 5 (US3 - Writing mode) -- adds writing step to sessions
7. Phase 12 (US2 continued - Mastery grid + word detail)
8. Phase 10 (US8 - Engagement) -- adds fun layer
9. Phase 9 (US7 - Themes) -- depends on engagement for unlock checks
10. Phase 8 (US6 - Progress screen)
11. Phase 13 (US10/11 - Architecture validation + polish)
12. Phase 11 (US9 - Offline/PWA) -- needs final file list
13. Phase 14 (Polish)

### Parallel Opportunities

Within Phase 2 (Foundational):
```
Parallel group A: T005, T006, T007, T008, T009 (all data files)
Parallel group B: T014, T015, T016, T017 (all CSS files)
Sequential: T010 → T011 → T012 → T013 → T018 (core modules, each may import prior)
```

Within Phase 3 (US1):
```
Sequential: T019 (session orchestrator) first
Then parallel: T021, T022, T023, T024 (all practice modes, different files)
Then: T025 (results screen, needs modes complete)
T020 can run after T019
```

Within Phase 4 + Phase 12 (US2):
```
Parallel: T026, T043 (CSS files)
Then: T027 (home.js), T028 (nav.js), T044 (grid.js)
Then: T045 (word detail overlay, needs session.js)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 6: US4 (Migration) -- ensures data safety
4. Complete Phase 7: US5 (Spaced repetition) -- enables smart word selection
5. Complete Phase 4: US2 (Home screen) -- visible landing
6. Complete Phase 3: US1 (Session + modes) -- core learning loop
7. Complete Phase 5: US3 (Writing mode) -- writing practice
8. Complete Phase 12: US2 continued (Mastery grid)
9. **STOP and VALIDATE**: Full session flow works, data migrates, mastery decays

### Incremental Delivery

After MVP validation:
10. Add US8 (Engagement) -- XP, badges, animations
11. Add US7 (Themes) -- color themes with unlocks
12. Add US6 (Progress) -- streaks and calendar
13. Add US10/11 (Polish) -- transitions, keyboard, touch targets
14. Add US9 (PWA) -- offline + auto-update
15. Final polish and deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The 60 new Week 2B context sentences (T006) require careful content authoring -- budget extra time
- Writing mode (T029) has no digital input validation -- it's purely TTS + reveal + self-report
- Service worker precache list (T054) must be updated last once all files are finalized
