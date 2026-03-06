// Mode Registry - extensibility point for practice modes.
// To add a new mode:
//   1. Create js/modes/my-mode.js
//   2. Import registerMode from this file
//   3. Call registerMode('my-mode', { name, setup(container, options), cleanup() })
//   4. Import your mode file in js/app.js

const modes = new Map();

export function registerMode(id, config) {
  modes.set(id, config);
}

export function getMode(id) {
  return modes.get(id);
}

export function getAllModes() {
  return [...modes.entries()].map(([id, config]) => ({ id, ...config }));
}
