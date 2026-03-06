import { getState } from '../state.js';

export function renderProgress(container) {
  const state = getState();

  // Build 5-week calendar (35 days)
  const today = new Date();
  const calendarDays = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const practiced = state.dailyHistory.includes(dateStr);
    const isToday = i === 0;
    calendarDays.push({ dateStr, practiced, isToday, day: d.getDate() });
  }

  // Daily prize milestones
  const prizes = [
    { days: 7, amount: '$3', label: '7 days' },
    { days: 14, amount: '$5', label: '14 days' },
    { days: 30, amount: '$10', label: '30 days' }
  ];

  container.innerHTML = `
    <div class="progress-content">
      <div class="progress-streak-display">
        <div class="progress-streak-number">${state.dailyStreak}</div>
        <div class="progress-streak-label">
          <span class="flame">&#x1F525;</span> day streak
        </div>
        <div class="progress-best-streak">Best: ${state.bestDailyStreak} days</div>
      </div>

      <div class="progress-calendar">
        <div class="progress-calendar-title">Last 5 weeks</div>
        <div class="progress-calendar-grid">
          ${calendarDays.map(d => `
            <div class="progress-calendar-day ${d.practiced ? 'practiced' : ''} ${d.isToday ? 'today' : ''}">
              ${d.day}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="progress-prizes">
        <div class="progress-prizes-title">Daily streak prizes</div>
        <div class="progress-prize-list">
          ${prizes.map(p => {
            const claimed = state.dailyRewards[p.days];
            const highlighted = !claimed && state.dailyStreak >= p.days;
            return `
              <div class="progress-prize ${claimed ? 'claimed' : ''} ${highlighted ? 'highlighted' : ''}">
                <div class="progress-prize-days">${p.label}</div>
                <div class="progress-prize-amount">${p.amount}</div>
                <div class="progress-prize-status">${claimed ? 'Claimed' : state.dailyStreak >= p.days ? 'Ready!' : `${p.days - state.dailyStreak} days to go`}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
