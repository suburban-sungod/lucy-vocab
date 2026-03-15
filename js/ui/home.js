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
    <div class="flex-1 flex flex-col items-center justify-center gap-7 text-center py-5">
      <div class="text-2xl font-semibold text-txt2">Lucy's Chinese Vocab</div>

      <button class="w-20 h-20 rounded-full ${isBonus ? 'bg-accent' : 'bg-gold'} text-black text-3xl flex items-center justify-center shadow-lg animate-pulse active:scale-95 active:animate-none transition-transform" id="home-start">
        &#x25B6;
      </button>
      <div class="text-sm text-txt2 -mt-3">${isBonus ? 'Bonus Session' : 'Start Session'}</div>

      <div class="flex items-center gap-2.5 text-lg text-txt">
        <div class="flex gap-2">
          ${[0, 1, 2].map(i => `<div class="w-3.5 h-3.5 rounded-full transition-colors ${i < state.sessionsToday ? 'bg-green' : 'bg-surface2'}"></div>`).join('')}
        </div>
        <span><span class="font-bold text-accent">${Math.min(state.sessionsToday, 3)}</span> of 3 done</span>
      </div>

      <div class="flex items-center gap-2 text-txt2">
        <span class="text-2xl">&#x1F525;</span>
        <span class="font-bold text-txt text-xl">${state.dailyStreak}</span>
        <span>day streak</span>
      </div>

      <div class="flex gap-6 justify-center">
        <div class="text-center">
          <div class="text-3xl font-bold text-green">${summary.mastered}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">Mastered</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-accent">${summary.learning + summary.fading + summary.needsReview}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">Learning</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-txt2">${summary.unseen}</div>
          <div class="text-xs text-txt2 uppercase tracking-wider">New</div>
        </div>
      </div>
    </div>

    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn" id="setup-overlay" style="display:none">
      <div class="bg-surface rounded-2xl p-7 w-[min(340px,90vw)] flex flex-col gap-5">
        <div class="text-xl font-bold text-txt text-center">Set up your session</div>

        <div class="flex flex-col gap-2.5">
          <div class="text-xs text-txt2 uppercase tracking-wider font-semibold">Words</div>
          <div class="flex flex-wrap gap-2" id="set-chips">
            <button class="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium border-2 border-accent transition-all" data-set="">All</button>
            ${Object.entries(SET_LABELS).map(([key, label]) =>
              `<button class="px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium border-2 border-transparent transition-all" data-set="${key}">${label}</button>`
            ).join('')}
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="text-xs text-txt2 uppercase tracking-wider font-semibold">Exercises</div>
          <div class="flex flex-wrap gap-2" id="mode-chips"></div>
        </div>

        <button class="w-full py-3.5 rounded-2xl bg-gold text-black text-lg font-bold mt-1 active:scale-[0.97] transition-transform" id="setup-go">Go!</button>
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
    btn.className = `px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${isSelected ? 'bg-accent text-white border-accent' : 'bg-surface2 text-txt2 border-transparent'}`;
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
      c.className = 'px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium border-2 border-transparent transition-all';
    });
    chip.className = 'px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium border-2 border-accent transition-all';
  });

  // Mode selection (toggle)
  container.querySelector('#mode-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-mode]');
    if (!chip) return;
    const mode = chip.dataset.mode;
    if (selectedModes.has(mode)) {
      if (selectedModes.size > 1) {
        selectedModes.delete(mode);
        chip.className = 'px-4 py-2.5 rounded-xl bg-surface2 text-txt2 text-sm font-medium border-2 border-transparent transition-all';
      }
    } else {
      selectedModes.add(mode);
      chip.className = 'px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium border-2 border-accent transition-all';
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
