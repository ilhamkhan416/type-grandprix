// Ganti dengan URL dari Render setelah deployment jika koneksi bermasalah
// const socket = io("https://nama-proyek-anda.onrender.com");
// Tapi untuk sekarang, biarkan kosong, biasanya ini sudah cukup
const socket = io();

const textDisplayElement = document.getElementById('text-display');
const typingInputElement = document.getElementById('typing-input');
const playerCarElement = document.getElementById('player-car');
const opponentCarElement = document.getElementById('opponent-car');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');

const quotes = [
    "Cara terbaik untuk memulai adalah dengan berhenti berbicara dan mulai melakukan.",
    "Waktu Anda terbatas, jadi jangan sia-siakan dengan menjalani hidup orang lain.",
    "Belajar dari kemarin, hidup untuk hari ini, berharap untuk besok."
];
let currentQuote = '';
let quoteCharacters = [];
let playerInput = '';
let startTime;
let errors = 0;

function startNewGame() {
    errors = 0; startTime = null;
    typingInputElement.value = '';
    typingInputElement.disabled = false;
    typingInputElement.focus();
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    textDisplayElement.innerHTML = '';
    quoteCharacters = currentQuote.split('');
    quoteCharacters.forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        textDisplayElement.appendChild(charSpan);
    });
    updateCarPosition();
    opponentCarElement.style.left = '0%';
    wpmElement.innerText = "WPM: 0";
    accuracyElement.innerText = "Akurasi: 100%";
}
function handleInput() {
    if (!startTime) { startTime = new Date(); }
    playerInput = typingInputElement.value;
    const playerInputArray = playerInput.split('');
    errors = 0;
    quoteCharacters.forEach((char, index) => {
        const typedChar = playerInputArray[index];
        const charSpan = textDisplayElement.childNodes[index];
        if (typedChar == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (typedChar === char) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
            errors++;
        }
    });
    updateCarPosition();
    updateStats();
    if (playerInput.length === currentQuote.length && errors === 0) {
        typingInputElement.disabled = true;
        alert(`Balapan Selesai!`);
    }
}
function updateCarPosition() {
    const correctChars = playerInput.length - errors;
    const progress = (correctChars / currentQuote.length) * 100;
    playerCarElement.style.left = `${progress}%`;
    socket.emit('playerProgress', { progress: progress });
}
function updateStats() {
    if (startTime) {
        const elapsedTime = (new Date() - startTime) / 1000 / 60;
        const typedWords = playerInput.length / 5;
        const currentWPM = Math.round(typedWords / elapsedTime) || 0;
        wpmElement.innerText = `WPM: ${currentWPM}`;
        const accuracy = Math.round(((playerInput.length - errors) / playerInput.length) * 100) || 100;
        accuracyElement.innerText = `Akurasi: ${accuracy}%`;
    }
}
socket.on('connect', () => {
    console.log("Terhubung ke server dengan ID:", socket.id);
    startNewGame();
});
socket.on('opponentProgress', (data) => {
  opponentCarElement.style.left = `${data.progress}%`;
});
socket.on('playerDisconnected', (data) => {
    console.log('Pemain lawan dengan ID', data.id, 'telah keluar.');
    opponentCarElement.style.left = '0%';
});
const style = document.createElement('style');
style.innerHTML = `.correct { color: #28a745; } .incorrect { color: #dc3545; text-decoration: underline; }`;
document.head.appendChild(style);
typingInputElement.addEventListener('input', handleInput);
