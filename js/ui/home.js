import { getState } from '../state.js';
import { getMasterySummary } from '../mastery.js';

export function renderHome(container, { onStartSession }) {
  const state = getState();
  const summary = getMasterySummary();
  const isBonus = state.sessionsToday >= 3;

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
  `;

  container.querySelector('#home-start').addEventListener('click', () => {
    if (onStartSession) onStartSession();
  });
}
