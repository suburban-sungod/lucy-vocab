import { registerMode } from './mode-registry.js';
import { speakChinese, hasTTS } from '../audio.js';
import { updateWordMastery } from '../mastery.js';

registerMode('writing', {
  name: 'Writing Practice',

  setup(container, { words, onComplete, onAnswer }) {
    const results = [];
    const queue = [...words].sort(() => Math.random() - 0.5);
    let currentIndex = 0;

    function renderPrompt() {
      if (currentIndex >= queue.length) {
        onComplete(results);
        return;
      }

      const word = queue[currentIndex];

      if (hasTTS()) {
        speakChinese(word.hanzi);
      }

      container.innerHTML = `
        <div class="text-center py-8 px-4 flex flex-col items-center">
          <div class="text-lg text-txt2 mb-6">Write this character on paper</div>
          <button class="w-20 h-20 rounded-full bg-accent text-white text-3xl flex items-center justify-center mb-6 active:scale-95 transition-transform" id="writing-replay">&#x1f50a;</button>
          ${!hasTTS() ? `<div class="text-2xl text-accent mb-4">${word.pinyin}</div>` : ''}
          <div class="text-sm text-txt2 mb-4">${currentIndex + 1} of ${queue.length}</div>
          <button class="min-w-[200px] min-h-[56px] px-8 py-4 rounded-3xl bg-surface2 text-txt text-lg font-semibold active:scale-95 transition-transform" id="writing-reveal">Show Answer</button>
        </div>
      `;

      container.querySelector('#writing-replay').addEventListener('click', () => {
        speakChinese(word.hanzi);
      });

      container.querySelector('#writing-reveal').addEventListener('click', () => {
        renderReveal(word);
      });
    }

    function renderReveal(word) {
      container.innerHTML = `
        <div class="text-center py-8 px-4 flex flex-col items-center">
          <div class="animate-pop">
            <div class="text-6xl font-bold mb-2">${word.hanzi}</div>
            <div class="text-xl text-txt2 mb-6">${word.pinyin}</div>
          </div>
          <div class="flex gap-4 justify-center">
            <button class="min-w-[44px] min-h-[44px] px-6 py-3 rounded-3xl bg-red text-white font-semibold active:scale-95 transition-transform" id="writing-wrong">Practice more</button>
            <button class="min-w-[44px] min-h-[44px] px-6 py-3 rounded-3xl bg-green text-black font-semibold active:scale-95 transition-transform" id="writing-correct">Got it!</button>
          </div>
        </div>
      `;

      container.querySelector('#writing-correct').addEventListener('click', () => {
        updateWordMastery(word.hanzi, true);
        results.push(true);
        if (onAnswer) onAnswer(true, word);
        currentIndex++;
        renderPrompt();
      });

      container.querySelector('#writing-wrong').addEventListener('click', () => {
        updateWordMastery(word.hanzi, false);
        results.push(false);
        if (onAnswer) onAnswer(false, word);
        queue.push(word);
        currentIndex++;
        renderPrompt();
      });
    }

    renderPrompt();
  },

  cleanup() {}
});
