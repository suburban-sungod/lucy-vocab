# Implementation Plan: v2 Rebuild

**Branch**: `001-v2-rebuild` | **Date**: 2026-03-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-v2-rebuild/spec.md`

## Summary

Rebuild Lucy's Chinese vocabulary app from a single 3,500-line HTML file into a modular ES module architecture. Preserve all v1 functionality (mastery grid, 5 practice modes including new writing mode, spaced repetition, themes, streaks, XP, achievements) with a restructured session flow (flashcard review + 3 single-mode rounds + writing practice) and a session-focused home screen. Migrate v1 localStorage data in place. Deploy as PWA to GitHub Pages.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2022+), CSS3 with custom properties, HTML5
**Primary Dependencies**: None (zero-dependency per constitution). Web Speech API for TTS/recognition.
**Storage**: localStorage with JSON serialization (`lucyVocab` key)
**Testing**: Manual testing via local HTTP server (`python3 -m http.server`). No test framework (zero-dependency constraint).
**Target Platform**: Safari on iOS (primary), Chrome (secondary). PWA via service worker.
**Project Type**: Progressive Web App (single-page, client-only)
**Performance Goals**: <1s home screen load, <100ms theme switch, 60fps animations
**Constraints**: No build tools, no npm, no bundlers. Offline-capable. <25 files total. 320-480px viewport. 44px minimum touch targets.
**Scale/Scope**: Single user, 45 words, 90 context sentences, 5 practice modes, 3 screens + overlays

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. PWA-First | PASS | Service worker with network-first caching, manifest.json, offline support (FR-046/047/048) |
| II. Zero Dependencies | PASS | Vanilla JS/CSS/HTML only, no npm/bundlers (FR-051). Web Speech API is a browser built-in. |
| III. Single User, Local Data | PASS | localStorage under `lucyVocab` key, in-place schema upgrade (FR-042/043) |
| IV. Mobile-First Design | PASS | 44px touch targets (FR-053), 320-480px viewport, touch-only interactions |
| V. Component Separation | PASS | ES modules with separate files per concern (FR-049) |
| VI. Preserve What Works | PASS | All v1 modes preserved + writing mode added. Same spaced repetition, XP, streaks, themes, achievements |
| VII. Accessibility | PASS | TTS (FR-025), speech recognition (FR-026), color + secondary indicators for mastery (FR-005) |
| VIII. Content Separation | PASS | Word lists and sentences in dedicated data files (FR-052) |
| IX. Extensible by Design | PASS | Practice mode registration system (FR-050), self-contained modules |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-v2-rebuild/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
index.html                  # App shell, loads modules
manifest.json               # PWA manifest
sw.js                       # Service worker (network-first, auto-update)
css/
├── base.css                # Reset, typography, layout, animations
├── themes.css              # 6 theme definitions via CSS custom properties
├── home.css                # Home screen + session launcher styles
├── grid.css                # Mastery grid styles
├── progress.css            # Progress screen styles
├── practice.css            # Shared practice mode styles (cards, quiz, timers)
└── overlays.css            # Word detail, theme picker, results overlays
js/
├── app.js                  # Entry point, router, screen management
├── data/
│   ├── words.js            # 45 vocabulary items (static data)
│   ├── sentences.js        # 90 context sentences (static data)
│   ├── badges.js           # 16 achievement definitions (static data)
│   └── themes.js           # 6 theme definitions (static data)
├── state.js                # localStorage read/write, v1 migration, schema management
├── mastery.js              # Spaced repetition algorithm, word selection, decay calculations
├── session.js              # Session orchestrator (3-step flow), mode rotation
├── modes/
│   ├── mode-registry.js    # Mode registration system (extensibility point)
│   ├── flashcard.js        # Flashcard review mode
│   ├── match.js            # Multiple choice matching mode
│   ├── context.js          # Fill-in-the-blank mode
│   ├── pairs.js            # Pair matching mode
│   └── writing.js          # Listen-write-reveal mode (new)
├── engagement.js           # XP, streaks, achievements, rewards, animations
├── audio.js                # TTS wrapper, speech recognition manager
├── ui/
│   ├── home.js             # Home screen rendering (session launcher)
│   ├── grid.js             # Mastery grid rendering
│   ├── progress.js         # Progress screen rendering (streaks, calendar)
│   ├── nav.js              # Bottom nav pill + top bar
│   └── overlays.js         # Word detail, theme picker, results overlays
└── animations.js           # Coin burst, confetti, Sadie, effects
assets/
├── sadie.js                # Base64-encoded Sadie photo as JS export
├── apple-touch-icon.png    # PWA icon
├── favicon.png             # Browser tab icon
└── icon-1024.png           # High-res PWA icon
```

**Structure Decision**: Flat module structure at repository root (no `src/` wrapper) to keep paths short and GitHub Pages serving simple. CSS and JS are separated by concern. Practice modes are in a `modes/` subdirectory with a registry pattern for extensibility. Data files are isolated in `js/data/`. Total: ~24 files (excluding assets), within the 25-file budget.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
