import { getState, saveState } from './state.js';
import { WORDS } from './data/words.js';

const DAY_MS = 86400000;

export function getMasteryState(wordMastery) {
  if (!wordMastery || wordMastery.seen === 0) return 'unseen';
  if (!wordMastery.mastered) return 'learning';

  const daysSince = wordMastery.lastCorrect
    ? (Date.now() - wordMastery.lastCorrect) / DAY_MS
    : Infinity;

  if (daysSince >= 14) return 'needs-review';
  if (daysSince >= 7) return 'fading';
  return 'mastered';
}

export function getWordState(hanzi) {
  const state = getState();
  if (!state.words[hanzi]) {
    state.words[hanzi] = {
      correct: 0,
      streak: 0,
      mastered: false,
      seen: 0,
      wrong: 0,
      lastCorrect: 0
    };
  }
  return state.words[hanzi];
}

export function updateWordMastery(hanzi, correct) {
  const word = getWordState(hanzi);
  word.seen++;

  if (correct) {
    word.correct++;
    word.streak++;
    word.lastCorrect = Date.now();
    if (word.streak >= 3) {
      word.mastered = true;
    }
  } else {
    word.wrong++;
    word.streak = 0;
  }

  saveState();
  return word;
}

export function selectPriorityWords(count, exclude = []) {
  const state = getState();
  const excludeSet = new Set(exclude);

  const scored = WORDS
    .filter(w => !excludeSet.has(w.hanzi))
    .map(w => {
      const mastery = state.words[w.hanzi];
      const masteryState = getMasteryState(mastery);
      let score = 0;

      if (masteryState === 'unseen') {
        score = 1000;
      } else if (masteryState === 'needs-review') {
        const days = mastery.lastCorrect ? (Date.now() - mastery.lastCorrect) / DAY_MS : 30;
        score = 500 + days;
      } else if (masteryState === 'fading') {
        const days = mastery.lastCorrect ? (Date.now() - mastery.lastCorrect) / DAY_MS : 10;
        score = 300 + days;
      } else if (masteryState === 'learning') {
        const wrongRatio = mastery.seen > 0 ? mastery.wrong / mastery.seen : 0;
        score = 100 + wrongRatio * 50;
      } else {
        score = 10;
      }

      return { word: w, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.word);
}

export function getMasterySummary() {
  const state = getState();
  const summary = { mastered: 0, fading: 0, needsReview: 0, learning: 0, unseen: 0 };

  for (const w of WORDS) {
    const mastery = state.words[w.hanzi];
    const s = getMasteryState(mastery);
    if (s === 'mastered') summary.mastered++;
    else if (s === 'fading') summary.fading++;
    else if (s === 'needs-review') summary.needsReview++;
    else if (s === 'learning') summary.learning++;
    else summary.unseen++;
  }

  return summary;
}
