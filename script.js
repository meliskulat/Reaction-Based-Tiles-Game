document.addEventListener('DOMContentLoaded', () => {
    const coverScreen = document.getElementById('coverpage');
    const countdownEl = document.getElementById('countdown');
    const gameScreen = document.getElementById('game-screen');
    const highScoreEl = document.getElementById('high-score');
    const currentScoreEl = document.getElementById('current-score');
    const timerEl = document.getElementById('timer');
    const tiles = document.querySelectorAll('.tile');
    const pointbarEl = document.getElementById('pointbar');
    const tapMessageEl = document.getElementById('tap-message');
    const gameArea = document.getElementById('game-area');
    const endGameContainer = document.getElementById('end-game-container');

    let countdownStarted = false;
    let highScore = Number(localStorage.getItem("highScore") || 0);
    let currentScore = 0;
    let timeLeft = 10;
    let timerInterval = null;
    let pointInterval = null;
    let currentPoints = 10;
    let messageHidden = false;
    let gameReady = false;

    highScoreEl.textContent = highScore;

 
    coverScreen.addEventListener('click', () => {
        if (countdownStarted) return;
        countdownStarted = true;
        startCountdown();
    });

    function startCountdown() {
        let current = 3;
        countdownEl.textContent = current;
        countdownEl.classList.remove('hidden');
        const interval = setInterval(() => {
            current--;
            if (current > 0) {
                countdownEl.textContent = current;
            } else {
                clearInterval(interval);
                countdownEl.classList.add('hidden');
                finishIntro();
            }
        }, 1000);
    }

    function finishIntro() {
        coverScreen.style.display = 'none';
        gameScreen.classList.remove('hidden');
        startGame();
    }

    function startGame() {
        gameReady = false;
        messageHidden = false;
        tapMessageEl.classList.remove('hide');
        endGameContainer.innerHTML = "";
        currentScore = 0;
        timeLeft = 10;
        currentScoreEl.textContent = currentScore;
        timerEl.textContent = timeLeft;

        setTimeout(() => {
            gameReady = true;
            for (let i = 0; i < 3; i++) spawnSingleTile();
            startTimer();
        }, 500);
    }

    function startPointCycle() {
        if (pointInterval) clearInterval(pointInterval);
        currentPoints = 10;
        pointbarEl.style.width = "100%";
        pointInterval = setInterval(() => {
            currentPoints--;
            if (currentPoints < 0) currentPoints = 0;
            pointbarEl.style.width = (currentPoints * 10) + "%";
            if (currentPoints === 0) clearInterval(pointInterval);
        }, 100);
    }

    function spawnSingleTile() {
        if (timeLeft <= 0) return;
        const emptyTiles = Array.from(tiles).filter(tile => !tile.classList.contains('black'));
        if (emptyTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const targetTile = emptyTiles[randomIndex];
            targetTile.classList.add('black');
            startPointCycle();
            targetTile.onclick = () => handleTileClick(targetTile);
        }
    }

    function handleTileClick(clickedTile) {
        if (!gameReady || timeLeft <= 0) return;
        
        
        if (!messageHidden) {
            tapMessageEl.classList.add('hide');
            messageHidden = true;
        }

        const awarded = currentPoints;
        clickedTile.classList.remove('black');
        clickedTile.onclick = null;
        if (pointInterval) clearInterval(pointInterval);

        currentScore += awarded;
        currentScoreEl.textContent = currentScore;


        clickedTile.classList.add('correct');
        const p = document.createElement("div");
        p.className = "points-float";
        p.textContent = `+${awarded}`;
        clickedTile.appendChild(p);

        setTimeout(() => p.classList.add("fade"), 120);
        setTimeout(() => clickedTile.classList.remove('correct'), 200);

        setTimeout(() => {
            if (p.parentNode) p.remove();
            if (timeLeft > 0) spawnSingleTile();
        }, 450);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        gameReady = false;
        if (pointInterval) clearInterval(pointInterval);
        tiles.forEach(tile => {
            tile.classList.remove('black');
            tile.onclick = null;
        });

        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-msg-container';

        
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreEl.textContent = highScore;
            localStorage.setItem("highScore", highScore);

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6}
            })


            statusContainer.innerHTML = `<div class="new-hiscore-text">New<br>High Score</div>`;
        } else {
            statusContainer.innerHTML = `<div class="time-is-up-text">Time is up</div>`;
        }

        gameArea.appendChild(statusContainer);
        endGameContainer.innerHTML = `<div class="f5-play-again">F5 to play again</div>`;
    }
    
});
