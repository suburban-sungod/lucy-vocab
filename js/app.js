import { loadState, getState, saveState } from './state.js';
import { WORDS } from './data/words.js';
import './modes/flashcard.js';
import './modes/match.js';
import './modes/context.js';
import './modes/pairs.js';
import './modes/writing.js';
import { getMode } from './modes/mode-registry.js';
import { renderHome } from './ui/home.js';
import { renderGrid } from './ui/grid.js';
import { renderProgress } from './ui/progress.js';
import { renderNav, hideNav, showNav } from './ui/nav.js';
import { renderResults, renderThemePicker, clearOverlays } from './ui/overlays.js';
import { startSession, getSession, advanceStep, getCurrentStepInfo, endSession, recordAnswer, setSessionEndCallback } from './session.js';
import { handleCorrectAnswer, handleWrongAnswer, checkDailyRewards, checkAnswerStreakRewards, addXP } from './engagement.js';
import { spawnCoins, spawnConfetti, showSadie, showBadgeToast, showXPPopup, showReward } from './animations.js';

let currentScreen = 'home';

document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();

  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.activeTheme);

  // Daily login bonus
  const today = new Date().toDateString();
  if (state.lastLogin !== today) {
    state.sessions++;
    state.lastLogin = today;
    addXP(10);
    showXPPopup('+10 daily bonus!');
    saveState();
  }

  // Set up nav
  renderNav({
    onNavigate: (screen) => showScreen(screen),
    onThemePicker: () => renderThemePicker({ onClose: () => refreshScreen() })
  });

  // Render initial screen
  showScreen('home');

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
});

export function showScreen(name) {
  currentScreen = name;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const screen = document.getElementById(`screen-${name}`);
  if (screen) {
    screen.classList.add('active');
  }

  showNav();
  refreshScreen();
}

function refreshScreen() {
  const container = document.getElementById(`screen-${currentScreen}`);
  if (!container) return;

  switch (currentScreen) {
    case 'home':
      renderHome(container, {
        onStartSession: () => beginSession()
      });
      break;
    case 'grid':
      renderGrid(container, {
        onPracticeWord: (word) => beginMiniDrill(word)
      });
      break;
    case 'progress':
      renderProgress(container);
      break;
  }
}

function beginSession() {
  startSession();
  hideNav();
  runSessionStep();
}

function beginMiniDrill(word) {
  startSession(word);
  hideNav();
  runSessionStep();
}

function runSessionStep() {
  const session = getSession();
  if (!session) return;

  const practiceScreen = document.getElementById('screen-practice');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  practiceScreen.classList.add('active');

  const info = getCurrentStepInfo();
  if (!info) return;

  practiceScreen.innerHTML = `
    <div class="step-indicator">${info.label}</div>
    <div id="practice-content"></div>
  `;

  const content = practiceScreen.querySelector('#practice-content');

  if (info.step === 'flashcard') {
    const words = session.type === 'mini-drill' ? [session.word] : session.flashcardWords;
    const mode = getMode('flashcard');
    mode.setup(content, {
      words,
      onComplete: () => {
        advanceStep();
        runSessionStep();
      }
    });
  } else if (info.step === 'practice') {
    if (session.type === 'mini-drill') {
      // Mini-drill: 3-4 match questions for this word
      const mode = getMode('match');
      mode.setup(content, {
        words: [session.word, ...getRandomWords(3, [session.word.hanzi])],
        questionCount: 4,
        onComplete: () => {
          advanceStep();
          runSessionStep();
        },
        onAnswer: (correct, word) => processAnswer(correct, word)
      });
    } else {
      const modeId = session.modeRotation[session.currentRound];
      const mode = getMode(modeId);
      mode.setup(content, {
        questionCount: 10,
        onComplete: (roundResults) => {
          // Check for perfect round
          if (roundResults && roundResults.every(r => r)) {
            const state = getState();
            if (modeId === 'match') state._perfectMatch = true;
            if (modeId === 'context') state._perfectContext = true;
            state.lastPerfectRound = Date.now();
            saveState();
          }
          advanceStep();
          runSessionStep();
        },
        onAnswer: (correct, word) => processAnswer(correct, word)
      });
    }
  } else if (info.step === 'writing') {
    const words = session.type === 'mini-drill' ? [session.word] : session.writingWords;
    const mode = getMode('writing');
    mode.setup(content, {
      words,
      onComplete: () => {
        advanceStep();
        runSessionStep();
      },
      onAnswer: (correct, word) => processAnswer(correct, word)
    });
  } else if (info.step === 'results') {
    const results = endSession();
    showNav();
    showScreen('home');

    // Check daily rewards
    const dailyRewards = checkDailyRewards();
    dailyRewards.forEach(r => {
      setTimeout(() => showReward(r.amount, 'Daily Streak Reward!', `${r.days}-day streak`), 500);
    });

    renderResults(results, {
      onDone: () => showScreen('home'),
      onAgain: () => beginSession()
    });

    if (results.correct > 0 && results.total > 0) {
      const pct = results.correct / results.total;
      if (pct >= 0.8) spawnConfetti(20);
    }
  }
}

function processAnswer(correct, word) {
  if (correct) {
    const result = handleCorrectAnswer();
    recordAnswer(true, null);

    // Update session XP tracking
    const session = getSession();
    if (session) session.results.xpEarned += result.xp;

    // Animations
    spawnCoins(5);
    if (result.mystery) showXPPopup('2x XP!');
    if (result.levelUp) showXPPopup(`Level up: ${result.levelName}!`);
    result.badges.forEach(b => showBadgeToast(b));
    if (result.streak > 0 && result.streak % 10 === 0) showSadie();

    // Check answer streak rewards
    const streakReward = checkAnswerStreakRewards();
    if (streakReward) {
      setTimeout(() => showReward(streakReward.amount, 'Answer Streak Reward!', `${streakReward.streak} correct in a row`), 500);
    }
  } else {
    handleWrongAnswer();
    recordAnswer(false, word);
  }
}

function getRandomWords(count, exclude = []) {
  const excludeSet = new Set(exclude);
  const pool = WORDS.filter(w => !excludeSet.has(w.hanzi));
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

function handleKeyboard(e) {
  const session = getSession();
  if (!session) return;

  const info = getCurrentStepInfo();
  if (!info) return;

  if (info.step === 'flashcard') {
    if (e.code === 'Space') {
      e.preventDefault();
      const card = document.querySelector('#flashcard');
      if (card) card.click();
    } else if (e.code === 'ArrowRight') {
      const btn = document.querySelector('#fc-got');
      if (btn) btn.click();
    } else if (e.code === 'ArrowLeft') {
      const btn = document.querySelector('#fc-need');
      if (btn) btn.click();
    }
  } else if (info.step === 'practice') {
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
      const idx = parseInt(e.code.slice(5)) - 1;
      const options = document.querySelectorAll('.quiz-option:not(.disabled)');
      if (options[idx]) options[idx].click();
    }
  } else if (info.step === 'writing') {
    if (e.code === 'Space') {
      e.preventDefault();
      const reveal = document.querySelector('#writing-reveal');
      if (reveal) reveal.click();
    } else if (e.code === 'ArrowRight') {
      const btn = document.querySelector('#writing-correct');
      if (btn) btn.click();
    } else if (e.code === 'ArrowLeft') {
      const btn = document.querySelector('#writing-wrong');
      if (btn) btn.click();
    }
  }

  if (e.code === 'Escape' && session) {
    if (confirm('Exit session? Progress for this session will be lost.')) {
      showNav();
      showScreen('home');
    }
  }
}
