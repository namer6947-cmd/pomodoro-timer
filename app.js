const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// DOM Elements
const timerEl = document.getElementById('timer');
const statusText = document.getElementById('status-text');
const mainBtn = document.getElementById('main-btn');
const cancelBtn = document.getElementById('cancel-btn');
const chips = document.querySelectorAll('.chip');
const progressRing = document.querySelector('circle.progress');
const finishSound = document.getElementById('finish-sound');

let timer = null;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;

// Progress Ring Calculation
const radius = 110;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    // Update Ring
    const percent = (timeLeft / totalTime) * 100;
    setProgress(percent);
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    mainBtn.textContent = "Пауза";
    cancelBtn.classList.remove('hidden');
    statusText.textContent = "Сфокусируйся!";
    document.getElementById('duration-selector').classList.add('hidden');
    
    // Haptic feedback
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            finishSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
    mainBtn.textContent = "Продолжить";
    statusText.textContent = "Перерыв?";
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = totalTime;
    updateDisplay();
    mainBtn.textContent = "Начать Фокус";
    cancelBtn.classList.add('hidden');
    statusText.textContent = "Готов к фокусу?";
    document.getElementById('duration-selector').classList.remove('hidden');
}

function finishSession() {
    isRunning = false;
    // Play sound
    finishSound.play().catch(e => console.log("Sound blocked"));
    
    // Haptic
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    statusText.textContent = "Отличная работа! 🎉";
    mainBtn.textContent = "Готово";
    
    // Optional: Send data back to bot
    // tg.sendData(JSON.stringify({action: "finished", duration: totalTime/60}));
    
    setTimeout(() => {
        tg.close();
    }, 3000);
}

// Event Listeners
mainBtn.addEventListener('click', () => {
    if (statusText.textContent.includes("Отличная работа")) {
        tg.close();
        return;
    }
    
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

cancelBtn.addEventListener('click', () => {
    resetTimer();
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        if (isRunning) return;
        
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        const mins = parseInt(chip.getAttribute('data-mins'));
        totalTime = mins * 60;
        timeLeft = totalTime;
        updateDisplay();
        
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
});

// Initial load
updateDisplay();
