# Research: v2 Rebuild

**Branch**: `001-v2-rebuild` | **Date**: 2026-03-06

## R1: ES Module Loading Without Build Tools

**Decision**: Use native ES modules with `<script type="module">` in index.html. Single entry point (`js/app.js`) imports all other modules.

**Rationale**: Browser support for ES modules is universal in our target browsers (Safari 16+, Chrome). No bundler needed. Module scripts are deferred by default, so load order is handled automatically. The `import`/`export` syntax provides clean dependency management.

**Alternatives considered**:
- Script tags with IIFE pattern: Simpler but no dependency management, ordering is manual, global namespace pollution.
- Import maps: Supported in Safari 16.4+ but adds complexity without benefit for this small project.

## R2: Service Worker Caching Strategy for Multi-File PWA

**Decision**: Network-first strategy with a versioned cache name. Service worker maintains a precache list of all app files. On install, precache all files. On fetch, try network first, fall back to cache.

**Rationale**: v1 already uses this pattern successfully. The multi-file structure means more entries in the precache list but the total payload is small (~100KB). Bumping `CACHE_VERSION` on deploy triggers the install event, which precaches the new files and triggers auto-reload.

**Alternatives considered**:
- Cache-first with network update: Faster loads but stale content risk. Not worth it for an app this small.
- Workbox: Excellent library but violates zero-dependency principle.

## R3: Practice Mode Registry Pattern

**Decision**: A mode registry module (`mode-registry.js`) exports a `registerMode(id, config)` function. Each mode module calls `registerMode` with its ID and a config object containing `setup()`, `render()`, `handleAnswer()` and `cleanup()` methods. The session orchestrator queries the registry to get available modes.

**Rationale**: This pattern lets new modes be added by creating a single file and importing it in `app.js`. No existing mode files need to change. The registry is the stable interface that constitution Principle IX requires.

**Alternatives considered**:
- Dynamic imports (`import()`): Would allow auto-discovery but adds async complexity and makes the precache list harder to maintain. Overkill for 5 modes.
- Event-based system: More decoupled but harder to debug and test for a small app.

## R4: v1 Data Migration Strategy

**Decision**: On first load, `state.js` reads the `lucyVocab` key, checks for a `schemaVersion` field (absent in v1). If missing, runs migration: adds new fields with defaults (`sessionsToday`, `lastSessionDate`, `schemaVersion`), preserves all existing fields. Writes back to same key.

**Rationale**: v1's `loadState()` already does field-level migration (checking for undefined fields and adding defaults). v2 formalizes this with a schema version number so future migrations can be chained. Same key means no data duplication or orphan risk.

**Alternatives considered**:
- New key with copy: Adds complexity and risk of reading stale data from old key.
- Export/import: Too manual for a 7-year-old's device.

**v1 state schema** (fields to preserve):
```
xp, streak, bestStreak, sessions, totalCorrect, totalAnswered,
lastLogin, speedHighScore, words (per-hanzi mastery),
dailyHistory, dailyStreak, bestDailyStreak, dailyRewards,
badges, unlockedThemes, activeTheme, lastPerfectRound,
_perfectMatch, _perfectContext, _lightningPairs, activeStatsTab
```

**v2 additions**:
```
schemaVersion (number), sessionsToday (number), lastSessionDate (string)
```

## R5: Writing Mode UX Flow

**Decision**: Three-phase per-word flow: (1) TTS speaks the word, screen shows "Write this character on paper" prompt with a replay button, (2) Lucy taps "Show Answer" to reveal the character large and centered, (3) Lucy taps "Got it" or "Practice more" to self-report. This repeats 3 times per word, 5 words total = 15 interactions.

**Rationale**: No digital input means no handwriting recognition complexity. The honour system is appropriate for a 7-year-old practicing at home. The flow mirrors classroom dictation exercises. TTS replay button lets her hear the word again before revealing.

**Alternatives considered**:
- Canvas drawing with stroke matching: Technically possible but massive complexity, fragile on mobile, and unnecessary when she has paper right there.
- Photo capture for parent review: Interesting but scope creep and privacy concerns.

## R6: CSS Architecture for Theming

**Decision**: All theme-variable colors defined in `:root` and overridden via `[data-theme="name"]` selectors in `themes.css`. Component CSS files reference only CSS custom properties, never hard-coded colors. Theme switching sets the `data-theme` attribute on `<html>`.

**Rationale**: v1 already uses this pattern successfully. Separating theme definitions into their own CSS file keeps component styles clean and makes adding new themes trivial (add a new `[data-theme]` block). `color-mix()` for transparent variants is supported in Safari 16.2+.

**Alternatives considered**:
- CSS classes per theme: More verbose, requires touching every component file.
- JS-driven inline styles: Harder to maintain, flash of unstyled content risk.

## R7: Session Orchestrator Design

**Decision**: `session.js` manages the 3-step flow as a state machine: FLASHCARD_REVIEW → PRACTICE_ROUNDS → WRITING → RESULTS. It tracks which step is active, which round (1-3) within practice, and which mode each round uses. Mode rotation cycles through match → context → pairs across rounds (wrapping). The orchestrator calls mode lifecycle methods via the registry.

**Rationale**: A state machine keeps the flow predictable and debuggable. The orchestrator owns the step transitions but delegates rendering and interaction to individual modes. This keeps modes decoupled from session structure.

**Alternatives considered**:
- Promise chain: Simpler for linear flow but harder to handle "Again" (restart) and mid-session exit.
- Event-driven: More flexible but harder to enforce step ordering for a sequential flow.

## R8: Content Sentence Expansion

**Decision**: 60 new context sentences need to be authored for the Week 2B word set (2 per word, 30 words). These will follow the same format as existing 3A4B sentences: Chinese sentence with `_____` blank, answer hanzi, English translation. Stored in `js/data/sentences.js`.

**Rationale**: The spec requires 90 total sentences (2 per word for all 45 words). v1 has 30 sentences covering only 3A4B. The sentences must be age-appropriate and use vocabulary/grammar a 7-year-old Chinese learner would understand.

**Alternatives considered**:
- AI-generated sentences at runtime: Violates offline-first principle, adds API dependency.
- Fewer sentences: Reduces Context mode variety and makes it less useful for 2B words.
