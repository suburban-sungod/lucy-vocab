# Lucy Vocab v2 Constitution

## Core Principles

### I. PWA-First
The app is a Progressive Web App deployed to GitHub Pages. It MUST work offline, install to home screen, and auto-update via service worker. No app store distribution.

### II. Zero Dependencies
No build tools, no npm, no bundlers. Vanilla HTML, CSS and JavaScript only. The app MUST run by opening index.html in a browser. Third-party libraries are allowed only via CDN with integrity hashes and MUST have a zero-dependency fallback.

### III. Single User, Local Data
All data persists in localStorage. No server, no database, no accounts. Data migration from v1 MUST be seamless (read existing `lucyVocab` key and upgrade schema in place).

### IV. Mobile-First Design
Primary device is an iPhone used by a 7-year-old. Touch targets MUST be minimum 44x44px. Viewport range: 320-480px. All interactions MUST work with touch only (no hover-dependent UI).

**iOS layout rules** (learned the hard way):
- `#app` MUST use `height: 100dvh` (not `min-height`) to constrain the flex container to the viewport. Using `min-height` allows content to push siblings (like bottom nav) off-screen.
- Scrollable screens inside a flex column MUST have `min-height: 0` — without this, flex children won't respect `overflow-y: auto` and will expand to fit content instead of scrolling.
- Fixed/floating navbars MUST NOT be used. Navigation MUST be a static flex child within the app layout so it never overlaps content.
- Safe area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) MUST be applied to the top bar and bottom nav respectively, not to the `#app` container.
- Any `position: fixed` elements (toasts, popups) MUST account for `env(safe-area-inset-top)` to avoid rendering behind the Dynamic Island/notch.

### V. Component Separation
Unlike v1 (single 3,500-line HTML file), v2 MUST use a clean file structure: separate CSS, JS modules, and HTML. ES modules with `type="module"` for script loading. No build step required.

### VI. Preserve What Works
v1's game mechanics, mastery system, word list and engagement features are validated with a real user. The rebuild preserves all v1 functionality unless explicitly scoped out in a spec. The spaced repetition algorithm, XP system, streak mechanics, theme system and practice modes MUST carry over.

### VII. Accessibility
TTS pronunciation and speech recognition MUST remain. Sufficient color contrast in all themes. Focus states for any keyboard/switch navigation. No reliance on color alone for mastery state (use icons or labels as secondary indicator).

### VIII. Content Separation
Word lists, context sentences and other learning content MUST live in dedicated data files, separate from UI and logic code. Adding a new word set MUST require only creating or editing a data file and registering it -- no changes to practice modes, UI components or core systems.

### IX. Extensible by Design
The architecture MUST support adding new practice modes (e.g. character writing) without modifying existing mode files. Each mode MUST be a self-contained module that registers itself with the practice system. Core systems (data, UI shell, engagement) MUST expose stable interfaces that new modules can consume.

## Tech Stack

- **Language**: Vanilla JavaScript (ES2022+), CSS3 with custom properties, HTML5
- **Hosting**: GitHub Pages (suburban-sungod/lucy-vocab, main branch)
- **Offline**: Service worker with network-first caching strategy
- **Audio**: Web Speech API (zh-CN TTS, webkitSpeechRecognition)
- **Data**: localStorage with JSON serialization
- **Icons/Assets**: Inline SVG preferred, base64 for photos

## Deployment

- Push to `main` triggers GitHub Pages rebuild
- Bump `CACHE_VERSION` in service worker with every deploy
- Service worker auto-reloads the app on the user's device when new version detected
- Registration code MUST call `reg.update()` on load and poll every 60s so homescreen PWA picks up deploys without manual cache clearing
- Service worker MUST listen for `SKIP_WAITING` message to activate immediately

## Governance

- Constitution is checked at every spec phase. Specs, plans and tasks that violate these principles MUST be flagged
- Amendments require updating this file and noting the change in the sync impact report

**Version**: 1.3.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
