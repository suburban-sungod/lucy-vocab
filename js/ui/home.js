import { getState } from '../state.js';
import { getMasterySummary } from '../mastery.js';
import { getAllModes } from '../modes/mode-registry.js';

let setupVisible = false;
let selectedSet = null;
let selectedModes = new Set(['flashcard', 'match', 'context', 'pairs', 'writing']);

const SET_LABELS = {
  '3A4B': 'Week 3A-4B',
  '2B': 'Week 2B'
};

export function renderHome(container, { onStartSession }) {
  const state = getState();
  const summary = getMasterySummary();
  const isBonus = state.sessionsToday >= 3;

  setupVisible = false;

  container.innerHTML = `
    <div class="home-content ${isBonus ? 'home-celebration' : ''}">
      <div class="home-greeting">Lucy's Chinese Vocab</div>

      <button class="home-start-btn ${isBonus ? 'bonus' : ''}" id="home-start">
        &#x25B6;
      </button>
      <div class="home-start-label">${isBonus ? 'Bonus Session' : 'Start Session'}</div>

      <div class="home-sessions">
        <div class="home-session-dots">
          ${[0, 1, 2].map(i => `<div class="home-session-dot ${i < state.sessionsToday ? 'done' : ''}"></div>`).join('')}
        </div>
        <span><span class="count">${Math.min(state.sessionsToday, 3)}</span> of 3 done</span>
      </div>

      <div class="home-streak">
        <span class="flame">&#x1F525;</span>
        <span class="streak-num">${state.dailyStreak}</span>
        <span>day streak</span>
      </div>

      <div class="home-mastery-summary">
        <div class="home-mastery-item">
          <div class="home-mastery-count mastered">${summary.mastered}</div>
          <div class="home-mastery-label">Mastered</div>
        </div>
        <div class="home-mastery-item">
          <div class="home-mastery-count learning">${summary.learning + summary.fading + summary.needsReview}</div>
          <div class="home-mastery-label">Learning</div>
        </div>
        <div class="home-mastery-item">
          <div class="home-mastery-count new">${summary.unseen}</div>
          <div class="home-mastery-label">New</div>
        </div>
      </div>
    </div>

    <div class="setup-overlay" id="setup-overlay" style="display:none">
      <div class="setup-panel">
        <div class="setup-title">Set up your session</div>

        <div class="setup-section">
          <div class="setup-label">Words</div>
          <div class="setup-chips" id="set-chips">
            <button class="setup-chip active" data-set="">All</button>
            ${Object.entries(SET_LABELS).map(([key, label]) =>
              `<button class="setup-chip" data-set="${key}">${label}</button>`
            ).join('')}
          </div>
        </div>

        <div class="setup-section">
          <div class="setup-label">Exercises</div>
          <div class="setup-chips" id="mode-chips"></div>
        </div>

        <button class="setup-go-btn" id="setup-go">Go!</button>
        <button class="setup-cancel-btn" id="setup-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Render mode chips from registry
  const modeChips = container.querySelector('#mode-chips');
  const allModes = getAllModes();
  const modeLabels = { flashcard: 'Flashcard', match: 'Match', context: 'Fill in Blank', pairs: 'Pairs', writing: 'Writing' };
  allModes.forEach(m => {
    const label = modeLabels[m.id] || m.name || m.id;
    const btn = document.createElement('button');
    btn.className = `setup-chip${selectedModes.has(m.id) ? ' active' : ''}`;
    btn.dataset.mode = m.id;
    btn.textContent = label;
    modeChips.appendChild(btn);
  });

  // Start button -> show setup
  container.querySelector('#home-start').addEventListener('click', () => {
    container.querySelector('#setup-overlay').style.display = 'flex';
  });

  // Word set selection
  container.querySelector('#set-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-set]');
    if (!chip) return;
    selectedSet = chip.dataset.set || null;
    container.querySelectorAll('#set-chips .setup-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });

  // Mode selection (toggle)
  container.querySelector('#mode-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-mode]');
    if (!chip) return;
    const mode = chip.dataset.mode;
    if (selectedModes.has(mode)) {
      if (selectedModes.size > 1) {
        selectedModes.delete(mode);
        chip.classList.remove('active');
      }
    } else {
      selectedModes.add(mode);
      chip.classList.add('active');
    }
  });

  // Go
  container.querySelector('#setup-go').addEventListener('click', () => {
    container.querySelector('#setup-overlay').style.display = 'none';
    if (onStartSession) onStartSession({
      wordSet: selectedSet,
      modes: [...selectedModes]
    });
  });

  // Cancel
  container.querySelector('#setup-cancel').addEventListener('click', () => {
    container.querySelector('#setup-overlay').style.display = 'none';
  });
}
