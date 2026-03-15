import { getState } from '../state.js';
import { getMasterySummary } from '../mastery.js';
import { getAllModes } from '../modes/mode-registry.js';

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

  container.innerHTML = `
    <div class="flex-1 flex flex-col items-center justify-center gap-8 text-center py-6 px-2">
      <div class="text-2xl font-bold text-txt">Lucy's Chinese Vocab</div>

      <div class="card p-6 w-full max-w-[280px] flex flex-col items-center gap-4">
        <button class="w-16 h-16 rounded-full ${isBonus ? 'bg-accent' : 'bg-accent'} text-white text-2xl flex items-center justify-center shadow-card animate-pulse active:scale-95 active:animate-none transition-transform" id="home-start">
          &#x25B6;
        </button>
        <div class="text-sm font-medium text-txt2">${isBonus ? 'Bonus Session' : 'Start Session'}</div>

        <div class="flex items-center gap-2.5 text-sm text-txt">
          <div class="flex gap-1.5">
            ${[0, 1, 2].map(i => `<div class="w-3 h-3 rounded-full transition-colors ${i < state.sessionsToday ? 'bg-green' : 'bg-surface2'}"></div>`).join('')}
          </div>
          <span><span class="font-bold text-accent">${Math.min(state.sessionsToday, 3)}</span> of 3 done</span>
        </div>
      </div>

      <div class="card-sm px-5 py-3 flex items-center gap-2">
        <span class="text-xl">&#x1F525;</span>
        <span class="font-bold text-txt text-lg">${state.dailyStreak}</span>
        <span class="text-sm text-txt2">day streak</span>
      </div>

      <div class="flex gap-3 w-full max-w-[320px]">
        <div class="card-sm flex-1 p-3 text-center">
          <div class="text-2xl font-bold text-green">${summary.mastered}</div>
          <div class="text-[0.65rem] text-txt2 uppercase tracking-wider font-medium">Mastered</div>
        </div>
        <div class="card-sm flex-1 p-3 text-center">
          <div class="text-2xl font-bold text-accent">${summary.learning + summary.fading + summary.needsReview}</div>
          <div class="text-[0.65rem] text-txt2 uppercase tracking-wider font-medium">Learning</div>
        </div>
        <div class="card-sm flex-1 p-3 text-center">
          <div class="text-2xl font-bold text-txt2">${summary.unseen}</div>
          <div class="text-[0.65rem] text-txt2 uppercase tracking-wider font-medium">New</div>
        </div>
      </div>
    </div>

    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn" id="setup-overlay" style="display:none">
      <div class="card p-7 w-[min(340px,90vw)] flex flex-col gap-5">
        <div class="text-xl font-bold text-txt text-center">Set up your session</div>

        <div class="flex flex-col gap-2.5">
          <div class="text-xs text-txt2 uppercase tracking-wider font-semibold">Words</div>
          <div class="flex flex-wrap gap-2" id="set-chips">
            <button class="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-card-sm transition-all" data-set="">All</button>
            ${Object.entries(SET_LABELS).map(([key, label]) =>
              `<button class="px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium transition-all" data-set="${key}">${label}</button>`
            ).join('')}
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="text-xs text-txt2 uppercase tracking-wider font-semibold">Exercises</div>
          <div class="flex flex-wrap gap-2" id="mode-chips"></div>
        </div>

        <button class="w-full py-3.5 rounded-2xl bg-accent text-white text-lg font-bold mt-1 active:scale-[0.97] transition-transform shadow-card" id="setup-go">Go!</button>
        <button class="w-full py-2.5 bg-transparent text-txt2 text-sm" id="setup-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Render mode chips from registry
  const modeChips = container.querySelector('#mode-chips');
  const allModes = getAllModes();
  const modeLabels = { flashcard: 'Flashcard', match: 'Match', context: 'Fill in Blank', pairs: 'Pairs', writing: 'Writing' };
  allModes.forEach(m => {
    const label = modeLabels[m.id] || m.name || m.id;
    const isSelected = selectedModes.has(m.id);
    const btn = document.createElement('button');
    btn.className = `px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isSelected ? 'bg-accent text-white shadow-card-sm' : 'bg-surface2 text-txt2'}`;
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
    container.querySelectorAll('#set-chips button').forEach(c => {
      c.className = 'px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium transition-all';
    });
    chip.className = 'px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-card-sm transition-all';
  });

  // Mode selection (toggle)
  container.querySelector('#mode-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-mode]');
    if (!chip) return;
    const mode = chip.dataset.mode;
    if (selectedModes.has(mode)) {
      if (selectedModes.size > 1) {
        selectedModes.delete(mode);
        chip.className = 'px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium transition-all';
      }
    } else {
      selectedModes.add(mode);
      chip.className = 'px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shadow-card-sm transition-all';
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
