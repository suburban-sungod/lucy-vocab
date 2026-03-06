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
      const shuffled = others.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
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

      let promptHTML, correctAnswer;
      let options;

      if (dir === 'cn-en') {
        if (audioOnly) {
          promptHTML = '<button class="audio-btn" id="match-audio" style="font-size:2rem;width:64px;height:64px;">&#x1f50a;</button>';
        } else {
          promptHTML = `<span style="font-size:2rem;font-weight:700">${word.hanzi}</span>`;
        }
        correctAnswer = word.english;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.english);
      } else if (dir === 'en-cn') {
        promptHTML = `<span>${word.english}</span>`;
        correctAnswer = word.hanzi;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.hanzi);
      } else {
        promptHTML = `<span style="font-size:1.3rem">${word.pinyin}</span>`;
        correctAnswer = word.english;
        options = [word, ...distractors].sort(() => Math.random() - 0.5).map(w => w.english);
      }

      let timeLeft = 10;

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
        <div class="quiz-prompt">${promptHTML}</div>
        <div class="quiz-options">
          ${options.map((opt, i) => `<button class="quiz-option" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;

      if (audioOnly) {
        // Short delay to ensure DOM is ready — helps iOS autoplay
        setTimeout(() => speakChinese(word.hanzi), 150);
        const audioBtn = container.querySelector('#match-audio');
        if (audioBtn) audioBtn.addEventListener('click', () => speakChinese(word.hanzi));
      }

      const timerFill = container.querySelector('#timer-fill');
      const optBtns = container.querySelectorAll('.quiz-option');

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft -= 0.1;
        const pct = (timeLeft / 10) * 100;
        timerFill.style.width = pct + '%';
        if (timeLeft <= 3) timerFill.className = 'timer-bar-fill danger';
        else if (timeLeft <= 5) timerFill.className = 'timer-bar-fill warning';

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
        btn.classList.add('disabled');
        if (btn.dataset.answer === correctAnswer) btn.classList.add('correct');
        if (selected && btn.dataset.answer === selected && !correct) btn.classList.add('wrong');
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
