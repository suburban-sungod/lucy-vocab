import { registerMode } from './mode-registry.js';
import { SENTENCES } from '../data/sentences.js';
import { WORDS } from '../data/words.js';
import { updateWordMastery } from '../mastery.js';

registerMode('context', {
  name: 'Context',

  setup(container, { questionCount = 10, onComplete, onAnswer }) {
    let currentQ = 0;
    let timer = null;
    const results = [];

    const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, questionCount);

    function pickDistractors(correct, count = 3) {
      const others = WORDS.filter(w => w.hanzi !== correct).sort(() => Math.random() - 0.5);
      return others.slice(0, count).map(w => w.hanzi);
    }

    function renderQuestion() {
      if (currentQ >= questions.length) {
        clearInterval(timer);
        onComplete(results);
        return;
      }

      const q = questions[currentQ];
      const distractors = pickDistractors(q.answer);
      const options = [q.answer, ...distractors].sort(() => Math.random() - 0.5);
      let timeLeft = 15;

      const sentenceHTML = q.sentence.replace('_____', '<span class="inline-block min-w-[60px] border-b-[3px] border-accent mx-1">&nbsp;</span>');

      container.innerHTML = `
        <div class="flex gap-1.5 justify-center py-3">
          ${Array.from({ length: questionCount }, (_, i) => {
            let cls = 'bg-surface2';
            if (i < currentQ) cls = results[i] ? 'bg-green' : 'bg-red';
            else if (i === currentQ) cls = 'bg-accent animate-pulse';
            return `<div class="w-2.5 h-2.5 rounded-full ${cls}"></div>`;
          }).join('')}
        </div>
        <div class="max-w-[400px] mx-auto w-full h-1 bg-surface2 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-accent rounded-full timer-fill" id="timer-fill" style="width:100%"></div>
        </div>
        <div class="text-xl text-center py-5 px-4 leading-relaxed min-h-[80px] flex items-center justify-center">${sentenceHTML}</div>
        <div class="grid grid-cols-2 gap-3 py-4 max-w-[400px] mx-auto w-full">
          ${options.map(opt => `<button class="quiz-opt min-h-[56px] p-3 rounded-2xl bg-surface text-txt text-lg font-medium text-center flex items-center justify-center border-2 border-transparent active:scale-[0.97] transition-all" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;

      const timerFill = container.querySelector('#timer-fill');
      const optBtns = container.querySelectorAll('.quiz-opt');

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft -= 0.1;
        const pct = (timeLeft / 15) * 100;
        timerFill.style.width = pct + '%';
        if (timeLeft <= 3) {
          timerFill.className = 'h-full rounded-full timer-fill bg-red';
        } else if (timeLeft <= 5) {
          timerFill.className = 'h-full rounded-full timer-fill bg-gold';
        }

        if (timeLeft <= 0) {
          clearInterval(timer);
          handleAnswer(null, q, optBtns);
        }
      }, 100);

      optBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          clearInterval(timer);
          handleAnswer(btn.dataset.answer, q, optBtns);
        });
      });
    }

    function handleAnswer(selected, q, optBtns) {
      const correct = selected === q.answer;
      results.push(correct);

      optBtns.forEach(btn => {
        btn.classList.add('pointer-events-none', 'opacity-50');
        if (btn.dataset.answer === q.answer) {
          btn.classList.remove('opacity-50', 'bg-surface', 'border-transparent');
          btn.classList.add('bg-green', 'text-black', 'border-green');
        }
        if (selected && btn.dataset.answer === selected && !correct) {
          btn.classList.remove('opacity-50', 'bg-surface', 'border-transparent');
          btn.classList.add('bg-red', 'text-white', 'border-red', 'animate-shake');
        }
      });

      const word = WORDS.find(w => w.hanzi === q.answer);
      updateWordMastery(q.answer, correct);
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
