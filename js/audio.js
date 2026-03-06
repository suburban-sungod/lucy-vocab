let zhVoice = null;

function findChineseVoice() {
  if (zhVoice) return zhVoice;
  const voices = speechSynthesis.getVoices();
  zhVoice = voices.find(v => v.lang.startsWith('zh')) || null;
  return zhVoice;
}

export function hasTTS() {
  return typeof speechSynthesis !== 'undefined';
}

export function hasRecognition() {
  return typeof webkitSpeechRecognition !== 'undefined' || typeof SpeechRecognition !== 'undefined';
}

export function speakChinese(text) {
  if (!hasTTS()) return;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;

  const voice = findChineseVoice();
  if (voice) utterance.voice = voice;

  speechSynthesis.speak(utterance);
}

export function initSpeechRecognition(onResult) {
  if (!hasRecognition()) return null;

  const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecog();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = () => {};

  return recognition;
}

// Preload voices
if (hasTTS()) {
  speechSynthesis.addEventListener('voiceschanged', findChineseVoice);
  findChineseVoice();
}
