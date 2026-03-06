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

      const sentenceHTML = q.sentence.replace('_____', '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>');

      container.innerHTML = `
        <div class="progress-dots">
          ${Array.from({ length: questionCount }, (_, i) => {
            let cls = '';
            if (i < currentQ) cls = results[i] ? 'correct' : 'wrong';
            else if (i === currentQ) cls = 'active';
            return `<div class="progress-dot ${cls}"></div>`;
          }).join('')}
        </div>
        <div class="timer-bar"><div class="timer-bar-fill" id="timer-fill" style="width:100%"></div></div>
        <div class="quiz-prompt">${sentenceHTML}</div>
        <div class="quiz-options">
          ${options.map(opt => `<button class="quiz-option" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;

      const timerFill = container.querySelector('#timer-fill');
      const optBtns = container.querySelectorAll('.quiz-option');

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft -= 0.1;
        const pct = (timeLeft / 15) * 100;
        timerFill.style.width = pct + '%';
        if (timeLeft <= 3) timerFill.className = 'timer-bar-fill danger';
        else if (timeLeft <= 5) timerFill.className = 'timer-bar-fill warning';

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
        btn.classList.add('disabled');
        if (btn.dataset.answer === q.answer) btn.classList.add('correct');
        if (selected && btn.dataset.answer === selected && !correct) btn.classList.add('wrong');
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
