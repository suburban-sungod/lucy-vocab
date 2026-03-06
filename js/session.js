import { getState, saveState } from './state.js';
import { selectPriorityWords } from './mastery.js';
import { getMode } from './modes/mode-registry.js';

const MODES_ROTATION = ['match', 'context', 'pairs'];

let session = null;
let onSessionEnd = null;

export function getSession() {
  return session;
}

export function setSessionEndCallback(cb) {
  onSessionEnd = cb;
}

export function startSession(miniDrill = null) {
  if (miniDrill) {
    session = {
      type: 'mini-drill',
      word: miniDrill,
      step: 'flashcard',
      results: { correct: 0, total: 0, mistakes: [], xpEarned: 0 }
    };
    return session;
  }

  const flashcardWords = selectPriorityWords(5);
  const flashcardHanzi = flashcardWords.map(w => w.hanzi);
  const writingWords = selectPriorityWords(5, flashcardHanzi);

  session = {
    type: 'full',
    step: 'flashcard',
    flashcardWords,
    writingWords,
    modeRotation: [...MODES_ROTATION],
    currentRound: 0,
    practiceRounds: [{}, {}, {}],
    writingAttempts: {},
    results: { correct: 0, total: 0, mistakes: [], xpEarned: 0 }
  };

  return session;
}

export function getCurrentStepInfo() {
  if (!session) return null;

  if (session.type === 'mini-drill') {
    const steps = { flashcard: 'Flashcard Review', practice: 'Practice', writing: 'Writing Practice' };
    return { label: steps[session.step] || session.step, step: session.step };
  }

  if (session.step === 'flashcard') {
    return { label: 'Step 1 of 3: Flashcard Review', step: 'flashcard' };
  }
  if (session.step === 'practice') {
    const mode = session.modeRotation[session.currentRound];
    const modeConfig = getMode(mode);
    const modeName = modeConfig ? modeConfig.name : mode;
    return {
      label: `Round ${session.currentRound + 1} of 3: ${modeName}`,
      step: 'practice',
      mode,
      round: session.currentRound
    };
  }
  if (session.step === 'writing') {
    return { label: 'Step 3 of 3: Writing Practice', step: 'writing' };
  }
  if (session.step === 'results') {
    return { label: 'Results', step: 'results' };
  }

  return null;
}

export function advanceStep() {
  if (!session) return null;

  if (session.type === 'mini-drill') {
    if (session.step === 'flashcard') {
      session.step = 'practice';
    } else if (session.step === 'practice') {
      session.step = 'writing';
    } else {
      session.step = 'results';
    }
    return session.step;
  }

  if (session.step === 'flashcard') {
    session.step = 'practice';
    session.currentRound = 0;
  } else if (session.step === 'practice') {
    session.currentRound++;
    if (session.currentRound >= 3) {
      session.step = 'writing';
    }
  } else if (session.step === 'writing') {
    session.step = 'results';
  }

  return session.step;
}

export function recordAnswer(correct, wordData) {
  if (!session) return;

  session.results.total++;
  if (correct) {
    session.results.correct++;
  } else if (wordData) {
    session.results.mistakes.push(wordData);
  }
}

export function endSession() {
  if (!session) return;

  const state = getState();

  if (session.type === 'full') {
    state.sessionsToday++;

    // Check daily streak: 3 sessions = practiced day
    const today = new Date().toISOString().slice(0, 10);
    if (state.sessionsToday >= 3 && !state.dailyHistory.includes(today)) {
      state.dailyHistory.push(today);
      recalcDailyStreak();
    }
  }

  saveState();

  const results = session.results;
  session = null;

  if (onSessionEnd) onSessionEnd(results);

  return results;
}

function recalcDailyStreak() {
  const state = getState();
  const history = [...state.dailyHistory].sort().reverse();

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < history.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (history[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  state.dailyStreak = streak;
  if (streak > state.bestDailyStreak) {
    state.bestDailyStreak = streak;
  }
}
