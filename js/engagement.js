import { getState, saveState } from './state.js';
import { WORDS } from './data/words.js';
import { BADGES } from './data/badges.js';
import { THEMES } from './data/themes.js';
import { getWordState } from './mastery.js';

const LEVELS = [
  { name: 'Beginner', xp: 0 },
  { name: 'Explorer', xp: 100 },
  { name: 'Scholar', xp: 300 },
  { name: 'Advanced', xp: 600 },
  { name: 'Master', xp: 1000 }
];

export function getLevel(xp) {
  let level = LEVELS[0];
  let nextLevel = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      level = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
    }
  }
  return { ...level, nextLevel };
}

export function addXP(amount) {
  const state = getState();
  const oldLevel = getLevel(state.xp);
  state.xp += amount;
  const newLevel = getLevel(state.xp);
  saveState();

  if (newLevel.name !== oldLevel.name) {
    return { levelUp: true, level: newLevel.name };
  }
  return { levelUp: false };
}

export function purchaseItem(item) {
  const state = getState();
  if (state.xp < item.price) return { success: false, reason: 'not-enough-xp' };
  if (state.purchasedItems.includes(item.id)) return { success: false, reason: 'already-owned' };

  state.xp -= item.price;
  state.purchasedItems.push(item.id);

  // If it's a theme, also unlock it
  if (item.themeId && !state.unlockedThemes.includes(item.themeId)) {
    state.unlockedThemes.push(item.themeId);
  }

  saveState();
  return { success: true, remainingXP: state.xp };
}

export function equipItem(item) {
  const state = getState();
  if (item.category === 'skins') state.equippedSkin = item.cssClass;
  if (item.category === 'celebrations') state.equippedCelebration = item.effectId;
  if (item.category === 'themes') {
    state.activeTheme = item.themeId;
    document.documentElement.setAttribute('data-theme', item.themeId);
  }
  saveState();
}

export function unequipItem(category) {
  const state = getState();
  if (category === 'skins') state.equippedSkin = null;
  if (category === 'celebrations') state.equippedCelebration = null;
  if (category === 'themes') {
    state.activeTheme = 'default';
    document.documentElement.setAttribute('data-theme', 'default');
  }
  saveState();
}

export function isItemOwned(item) {
  const state = getState();
  // Owned via purchase
  if (state.purchasedItems.includes(item.id)) return true;
  // Themes also unlockable via badges
  if (item.themeId && state.unlockedThemes.includes(item.themeId)) return true;
  return false;
}

export function isItemEquipped(item) {
  const state = getState();
  if (item.category === 'skins') return state.equippedSkin === item.cssClass;
  if (item.category === 'celebrations') return state.equippedCelebration === item.effectId;
  if (item.category === 'themes') return state.activeTheme === item.themeId;
  return false;
}

export function checkBadges() {
  const state = getState();
  const newBadges = [];

  const tests = {
    firstSteps: () => state.totalCorrect >= 1,
    wordWatcher: () => WORDS.some(w => getWordState(w.hanzi).mastered),
    halfwayThere: () => WORDS.filter(w => getWordState(w.hanzi).mastered).length >= Math.ceil(WORDS.length / 2),
    wordMaster: () => WORDS.every(w => getWordState(w.hanzi).mastered),
    speedDemon: () => state.speedHighScore >= 15,
    perfectMatch: () => state._perfectMatch,
    perfectContext: () => state._perfectContext,
    lightningPairs: () => state._lightningPairs,
    onFire: () => state.bestStreak >= 10,
    blazing: () => state.bestStreak >= 25,
    unstoppable: () => state.bestStreak >= 50,
    weekWarrior: () => (state.bestDailyStreak || 0) >= 7,
    fortnightStrong: () => (state.bestDailyStreak || 0) >= 14,
    monthOfMastery: () => (state.bestDailyStreak || 0) >= 30,
    xpHunter: () => state.xp >= 500,
    xpLegend: () => state.xp >= 1000
  };

  for (const badge of BADGES) {
    if (!state.badges[badge.id] && tests[badge.id] && tests[badge.id]()) {
      state.badges[badge.id] = Date.now();
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    checkThemeUnlocks();
    saveState();
  }

  return newBadges;
}

export function checkThemeUnlocks() {
  const state = getState();

  for (const theme of THEMES) {
    if (theme.badge && state.badges[theme.badge] && !state.unlockedThemes.includes(theme.id)) {
      state.unlockedThemes.push(theme.id);
    }
  }
}

export function handleCorrectAnswer() {
  const state = getState();
  state.totalCorrect++;
  state.totalAnswered++;
  state.streak++;
  if (state.streak > state.bestStreak) {
    state.bestStreak = state.streak;
  }

  // XP: base 10, mystery 2x ~15% chance
  let xpAmount = 10;
  let mystery = false;
  if (Math.random() < 0.15) {
    xpAmount = 20;
    mystery = true;
  }

  const levelResult = addXP(xpAmount);
  const badges = checkBadges();

  saveState();

  return {
    xp: xpAmount,
    mystery,
    levelUp: levelResult.levelUp,
    levelName: levelResult.level,
    badges,
    streak: state.streak
  };
}

export function handleWrongAnswer() {
  const state = getState();
  state.totalAnswered++;
  state.streak = 0;
  saveState();
}

export function checkDailyRewards() {
  const state = getState();
  const milestones = [
    { days: 7, amount: '$3' },
    { days: 14, amount: '$5' },
    { days: 30, amount: '$10' }
  ];

  const newRewards = [];

  for (const m of milestones) {
    if (state.dailyStreak >= m.days && !state.dailyRewards[m.days]) {
      state.dailyRewards[m.days] = Date.now();
      newRewards.push(m);
    }
  }

  if (newRewards.length > 0) saveState();
  return newRewards;
}

export function checkAnswerStreakRewards() {
  const state = getState();
  const milestones = [
    { streak: 20, amount: '$2' },
    { streak: 30, amount: '$5' },
    { streak: 40, amount: '$10' }
  ];

  for (const m of milestones) {
    if (state.streak === m.streak) {
      return m;
    }
  }
  return null;
}
