import { registerMode } from './mode-registry.js';
import { WORDS } from '../data/words.js';
import { speakChinese, hasTTS } from '../audio.js';
import { updateWordMastery } from '../mastery.js';

registerMode('match', {
  name: 'Match',

  setup(container, { words, questionCount = 10, onComplete, onAnswer }) {
    const pool = words || WORDS;
    let currentQ = 0;
    let timer = null;
    const results = [];

    function pickDistractors(correct, count = 3) {
      const others = pool.filter(w => w.hanzi !== correct.hanzi);
      return others.sort(() => Math.random() - 0.5).slice(0, count);
    }

    function renderQuestion() {
      if (currentQ >= questionCount) {
        clearInterval(timer);
        onComplete(results);
        return;
      }

      const word = pool[currentQ % pool.length];
      const distractors = pickDistractors(word);
      const directions = ['cn-en', 'en-cn', 'pinyin-en'];
      const dir = directions[currentQ % directions.length];
      const audioOnly = dir === 'cn-en' && hasTTS() && Math.random() < 0.5;

      let promptHTML, correctAnswer, options;

      if (dir === 'cn-en') {
        if (audioOnly) {
          promptHTML = '<button class="w-16 h-16 rounded-full bg-surface2 text-txt text-2xl flex items-center justify-center mx-auto active:bg-accent transition-colors shadow-card-sm" id="match-audio">&#x1f50a;</button>';
        } else {
          promptHTML = `<span class="text-3xl font-bold">${word.hanzi}</span>`;
        }
        correctAnswer = word.english;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.english);
      } else if (dir === 'en-cn') {
        promptHTML = `<span>${word.english}</span>`;
        correctAnswer = word.hanzi;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.hanzi);
      } else {
        promptHTML = `<span class="text-xl">${word.pinyin}</span>`;
        correctAnswer = word.english;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.english);
      }

      let timeLeft = 10;

      container.innerHTML = `
        <div class="flex gap-1.5 justify-center py-3">
          ${Array.from({ length: questionCount }, (_, i) => {
            let cls = 'bg-surface2';
            if (i < currentQ) cls = results[i] ? 'bg-green' : 'bg-red';
            else if (i === currentQ) cls = 'bg-accent animate-pulse';
            return `<div class="w-2.5 h-2.5 rounded-full ${cls}"></div>`;
          }).join('')}
        </div>
        <div class="max-w-[400px] mx-auto w-full h-1.5 bg-surface2 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-accent rounded-full timer-fill" id="timer-fill" style="width:100%"></div>
        </div>
        <div class="text-xl text-center py-5 px-4 leading-relaxed min-h-[80px] flex items-center justify-center">${promptHTML}</div>
        <div class="grid grid-cols-2 gap-3 py-4 max-w-[400px] mx-auto w-full">
          ${options.map(opt => `<button class="quiz-opt min-h-[56px] p-3 rounded-2xl bg-[var(--surface)] shadow-card-sm text-txt text-lg font-medium text-center flex items-center justify-center border border-[var(--border)] active:scale-[0.97] transition-all" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;

      if (audioOnly) {
        setTimeout(() => speakChinese(word.hanzi), 150);
        const audioBtn = container.querySelector('#match-audio');
        if (audioBtn) audioBtn.addEventListener('click', () => speakChinese(word.hanzi));
      }

      const timerFill = container.querySelector('#timer-fill');
      const optBtns = container.querySelectorAll('.quiz-opt');

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft -= 0.1;
        const pct = (timeLeft / 10) * 100;
        timerFill.style.width = pct + '%';
        if (timeLeft <= 3) timerFill.className = 'h-full rounded-full timer-fill bg-red';
        else if (timeLeft <= 5) timerFill.className = 'h-full rounded-full timer-fill bg-gold';

        if (timeLeft <= 0) {
          clearInterval(timer);
          handleAnswer(null, word, correctAnswer, optBtns);
        }
      }, 100);

      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          clearInterval(timer);
          handleAnswer(btn.dataset.answer, word, correctAnswer, optBtns);
        });
      });
    }

    function handleAnswer(selected, word, correctAnswer, optBtns) {
      const correct = selected === correctAnswer;
      results.push(correct);

      optBtns.forEach(btn => {
        btn.classList.add('pointer-events-none', 'opacity-50');
        if (btn.dataset.answer === correctAnswer) {
          btn.classList.remove('opacity-50', 'border-[var(--border)]');
          btn.classList.add('bg-green', 'text-white', 'border-green');
          btn.style.background = 'var(--green)';
          btn.style.color = 'white';
        }
        if (selected && btn.dataset.answer === selected && !correct) {
          btn.classList.remove('opacity-50', 'border-[var(--border)]');
          btn.classList.add('bg-red', 'text-white', 'border-red', 'animate-shake');
          btn.style.background = 'var(--red)';
          btn.style.color = 'white';
        }
      });

      updateWordMastery(word.hanzi, correct);
      if (onAnswer) onAnswer(correct, word);

      setTimeout(() => {
        currentQ++;
        renderQuestion();
      }, correct ? 600 : 1200);
    }

    renderQuestion();
  },

  cleanup() {}
});
