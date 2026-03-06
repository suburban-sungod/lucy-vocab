# Lucy's Chinese Vocab

PWA for a 7-year-old learning 45 Chinese vocabulary words. Deployed to GitHub Pages, works offline, stores progress in localStorage.

## Key constraints
- No build tools, no npm, no bundlers
- Vanilla JS with ES modules
- Mobile-first (iPhone, 7-year-old user)
- GitHub Pages deployment with service worker auto-update
- All state in localStorage under `lucyVocab` key

## Architecture
- Entry point: `js/app.js`
- State: `js/state.js` (persistence + v1 migration)
- Session flow: `js/session.js` (flashcard -> 3 practice rounds -> writing)
- Modes register via `js/modes/mode-registry.js`
- Themes via CSS custom properties + `data-theme` attribute

## Spec-driven development
This project uses Spec Kit. Design artifacts in `specs/001-v2-rebuild/`.
Constitution at `.specify/memory/constitution.md`.
