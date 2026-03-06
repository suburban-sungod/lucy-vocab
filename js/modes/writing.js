import { registerMode } from './mode-registry.js';
import { speakChinese, hasTTS } from '../audio.js';
import { updateWordMastery } from '../mastery.js';

registerMode('writing', {
  name: 'Writing Practice',

  setup(container, { words, onComplete, onAnswer }) {
    const results = [];
    // Single pass through shuffled words; "needs practice" words get re-queued
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
        <div class="writing-prompt">
          <div class="writing-instruction">Write this character on paper</div>
          <button class="writing-replay-btn" id="writing-replay">&#x1f50a;</button>
          ${!hasTTS() ? `<div style="font-size:1.5rem;color:var(--accent);margin-bottom:16px;">${word.pinyin}</div>` : ''}
          <div class="writing-attempt-counter">${currentIndex + 1} of ${queue.length}</div>
          <button class="writing-reveal-btn" id="writing-reveal">Show Answer</button>
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
        <div class="writing-prompt">
          <div class="writing-answer">
            <div class="writing-answer-hanzi">${word.hanzi}</div>
            <div class="writing-answer-pinyin">${word.pinyin}</div>
          </div>
          <div class="card-actions">
            <button class="btn-need-practice" id="writing-wrong">Practice more</button>
            <button class="btn-got-it" id="writing-correct">Got it!</button>
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
        // Re-queue this word at the end
        queue.push(word);
        currentIndex++;
        renderPrompt();
      });
    }

    renderPrompt();
  },

  cleanup() {}
});
