let state = null;
let persistenceAvailable = true;

function defaultState() {
  return {
    schemaVersion: 3,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    sessions: 1,
    totalCorrect: 0,
    totalAnswered: 0,
    lastLogin: new Date().toDateString(),
    speedHighScore: 0,
    words: {},
    dailyHistory: [],
    dailyStreak: 0,
    bestDailyStreak: 0,
    dailyRewards: {},
    badges: {},
    unlockedThemes: ['default'],
    activeTheme: 'default',
    lastPerfectRound: 0,
    _perfectMatch: false,
    _perfectContext: false,
    _lightningPairs: false,
    activeStatsTab: 'progress',
    sessionsToday: 0,
    lastSessionDate: '',
    purchasedItems: [],
    equippedSkin: null,
    equippedCelebration: null
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem('lucyVocab');
    if (raw) {
      state = JSON.parse(raw);
      migrateState();
    } else {
      state = defaultState();
    }
  } catch (e) {
    persistenceAvailable = false;
    state = defaultState();
    showPersistenceWarning();
  }

  // Daily reset
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastSessionDate !== today) {
    state.sessionsToday = 0;
    state.lastSessionDate = today;
  }

  saveState();
  return state;
}

function migrateState() {
  // v1 → v2 migration
  if (!state.schemaVersion) {
    state.schemaVersion = 2;
    state.sessionsToday = 0;
    state.lastSessionDate = '';
  }

  // v2 → v3 migration
  if (state.schemaVersion === 2) {
    state.schemaVersion = 3;
    state.purchasedItems = [];
    state.equippedSkin = null;
    state.equippedCelebration = null;
  }

  // Backfill any missing fields
  const defaults = defaultState();
  for (const key of Object.keys(defaults)) {
    if (state[key] === undefined) {
      state[key] = defaults[key];
    }
  }

  // Boolean fields that need explicit undefined check
  if (state._perfectMatch === undefined) state._perfectMatch = false;
  if (state._perfectContext === undefined) state._perfectContext = false;
  if (state._lightningPairs === undefined) state._lightningPairs = false;
}

export function saveState() {
  if (!persistenceAvailable) return;
  try {
    localStorage.setItem('lucyVocab', JSON.stringify(state));
  } catch (e) {
    persistenceAvailable = false;
    showPersistenceWarning();
  }
}

export function getState() {
  return state;
}

export function resetState() {
  state = defaultState();
  saveState();
  return state;
}

function showPersistenceWarning() {
  const existing = document.querySelector('.persistence-toast');
  if (existing) return;

  const toast = document.createElement('div');
  toast.className = 'persistence-toast';
  toast.style.cssText = `
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
    background: var(--surface2); color: var(--text); padding: 12px 20px;
    border-radius: 12px; font-size: 0.85rem; z-index: 300;
    box-shadow: var(--shadow-lg);
  `;
  toast.textContent = "Progress won't be saved this session";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
