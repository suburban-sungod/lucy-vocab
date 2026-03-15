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
    <div class="flex flex-col items-center gap-6 py-5">
      <div class="text-center">
        <div class="text-6xl font-extrabold text-accent leading-none">${state.dailyStreak}</div>
        <div class="text-base text-txt2 flex items-center justify-center gap-1.5 mt-1">
          <span class="text-lg">&#x1F525;</span> day streak
        </div>
        <div class="text-sm text-txt2 mt-1">Best: ${state.bestDailyStreak} days</div>
      </div>

      <div class="w-full">
        <div class="text-xs text-txt2 uppercase tracking-wider mb-2 font-semibold">Last 5 weeks</div>
        <div class="grid grid-cols-7 gap-1.5">
          ${calendarDays.map(d => `
            <div class="aspect-square rounded-lg flex items-center justify-center text-xs
              ${d.practiced ? 'bg-accent text-white' : 'bg-surface text-txt2'}
              ${d.isToday ? 'ring-2 ring-accent' : ''}">
              ${d.day}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="w-full">
        <div class="text-xs text-txt2 uppercase tracking-wider mb-2 font-semibold">Daily streak prizes</div>
        <div class="flex flex-col gap-2">
          ${prizes.map(p => {
            const claimed = state.dailyRewards[p.days];
            const highlighted = !claimed && state.dailyStreak >= p.days;
            return `
              <div class="flex items-center gap-3 p-3 rounded-xl bg-surface ${claimed ? 'opacity-60' : ''} ${highlighted ? 'ring-2 ring-gold' : ''}">
                <div class="font-bold text-accent min-w-[40px]">${p.label}</div>
                <div class="font-bold text-gold">${p.amount}</div>
                <div class="ml-auto text-sm text-txt2">${claimed ? 'Claimed' : state.dailyStreak >= p.days ? 'Ready!' : `${p.days - state.dailyStreak} days to go`}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
