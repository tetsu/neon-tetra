class Game {
    constructor() {
        this.renderer = new Renderer('game-canvas', 'next-canvas');
        this.COLS = 10;
        this.ROWS = 20;
        this.grid = this.createGrid();

        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 0;

        this.bag = [];
        this.activePiece = null;
        this.nextPiece = null;

        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.isGameOver = false;
        this.isGlitching = false;
        this.hasStarted = false;

        this.bindInputs();
        this.updateScoreBoard();

        // Loop bound to instance
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    createGrid() {
        return Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
    }

    generateBag() {
        let types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        // Shuffle
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        return types;
    }

    spawnPiece() {
        if (this.bag.length === 0) {
            this.bag = this.generateBag();
        }

        if (!this.nextPiece) {
            this.nextPiece = new Piece(this.bag.pop());
        }

        this.activePiece = this.nextPiece;

        if (this.bag.length === 0) {
            this.bag = this.generateBag();
        }
        this.nextPiece = new Piece(this.bag.pop());
        this.renderer.drawNextPiece(this.nextPiece);

        // Check game over on spawn
        if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.shape)) {
            this.gameOver();
        }
    }

    checkCollision(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    let newX = x + c;
                    let newY = y + r;

                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return true;
                    }
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    moveDown() {
        if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.shape)) {
            this.activePiece.y++;
        } else {
            this.lockPiece();
        }
    }

    move(dir) {
        if (!this.checkCollision(this.activePiece.x + dir, this.activePiece.y, this.activePiece.shape)) {
            this.activePiece.x += dir;
        }
    }

    rotate(dir) {
        if (this.activePiece.type === 'O') return; // O piece doesn't rotate in SRS

        let originalShape = this.activePiece.shape;
        let originalRot = this.activePiece.rotationState;

        this.activePiece.rotate(dir);
        let newRot = this.activePiece.rotationState;

        if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.shape)) {
            // SRS Wall Kicks
            const kickMapName = `${originalRot}->${newRot}`;
            const kickData = this.activePiece.type === 'I' ? WALL_KICKS_I[kickMapName] : WALL_KICKS_NORMAL[kickMapName];

            let kicked = false;

            if (kickData) {
                // Test each of the 5 offset pairs
                for (let i = 0; i < kickData.length; i++) {
                    let dx = kickData[i][0];
                    let dy = kickData[i][1];

                    // In SRS, positive Y is UP (mathematical), but in canvas positive Y is DOWN.
                    // The standard tables assume +Y is UP. We must invert dy for canvas coordinates.
                    if (!this.checkCollision(this.activePiece.x + dx, this.activePiece.y - dy, this.activePiece.shape)) {
                        this.activePiece.x += dx;
                        this.activePiece.y -= dy;
                        kicked = true;
                        break; // Found a valid placement
                    }
                }
            }

            if (!kicked) {
                // Revert rotation if all 5 tests fail
                this.activePiece.shape = originalShape;
                this.activePiece.rotationState = originalRot;
            }
        }
    }

    hardDrop() {
        let dropY = this.getGhostY();
        this.activePiece.y = dropY;
        this.renderer.triggerShake();
        this.lockPiece();
    }

    getGhostY() {
        let dropY = this.activePiece.y;
        while (!this.checkCollision(this.activePiece.x, dropY + 1, this.activePiece.shape)) {
            dropY++;
        }
        return dropY;
    }

    lockPiece() {
        for (let r = 0; r < this.activePiece.shape.length; r++) {
            for (let c = 0; c < this.activePiece.shape[r].length; c++) {
                if (this.activePiece.shape[r][c]) {
                    let y = this.activePiece.y + r;
                    let x = this.activePiece.x + c;
                    if (y >= 0) {
                        this.grid[y][x] = { color: this.activePiece.color, glow: this.activePiece.glow };
                    }
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesClearedNow = 0;
        let rowsToClear = [];

        for (let r = this.ROWS - 1; r >= 0; r--) {
            let isFull = true;
            for (let c = 0; c < this.COLS; c++) {
                if (!this.grid[r][c]) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                rowsToClear.push(r);
                this.renderer.createExplosion(r, this.COLS);
            }
        }

        if (rowsToClear.length > 0) {
            linesClearedNow = rowsToClear.length;

            // Remove full rows and add empty ones at the top
            rowsToClear.forEach(r => {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(this.COLS).fill(0));
            });

            this.linesCleared += linesClearedNow;
            this.combo++;

            if (this.combo > 1) {
                this.showComboFloat(this.combo);
            }

            // Score calculation (simple version)
            const scores = [0, 40, 100, 300, 1200];
            this.score += scores[linesClearedNow] * this.level * this.combo;

            // Level up
            if (this.linesCleared >= this.level * 10) {
                this.level++;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

                // Glitch Event (every 10 levels)
                if (this.level % 10 === 0) {
                    this.triggerGlitch();
                }
            }

            this.updateScoreBoard();
        } else {
            this.combo = 0; // Reset combo if no lines cleared
        }
    }

    showComboFloat(comboValue) {
        const overlay = document.getElementById('game-container');
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-text';
        comboEl.innerText = `COMBO x${comboValue}`;
        // Position it roughly near the board center
        comboEl.style.left = '50px';
        comboEl.style.top = '250px';
        overlay.appendChild(comboEl);

        setTimeout(() => {
            overlay.removeChild(comboEl);
        }, 1000);
    }

    triggerGlitch() {
        const glitchText = document.getElementById('glitch-overlay');
        const gameCanvas = document.getElementById('game-canvas');

        this.isGlitching = true;
        glitchText.classList.remove('hidden');
        gameCanvas.classList.add('glitch-tilt');

        setTimeout(() => {
            this.isGlitching = false;
            glitchText.classList.add('hidden');
            gameCanvas.classList.remove('glitch-tilt');
        }, 5000);
    }

    updateScoreBoard() {
        document.getElementById('score').innerText = this.score;
        document.getElementById('level').innerText = this.level;
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('final-score').innerText = this.score;
    }

    bindInputs() {
        document.addEventListener('keydown', (e) => {
            if (!this.hasStarted) {
                if (e.code === 'Space') {
                    this.hasStarted = true;
                    document.getElementById('title-screen-overlay').classList.add('hidden');
                    this.spawnPiece();
                    this.lastDropTime = performance.now();
                }
                return;
            }

            if (this.isGameOver) {
                if (e.code === 'Space') {
                    // Reset game
                    this.grid = this.createGrid();
                    this.score = 0;
                    this.level = 1;
                    this.linesCleared = 0;
                    this.combo = 0;
                    this.dropInterval = 1000;
                    this.isGameOver = false;
                    document.getElementById('game-over-overlay').classList.add('hidden');
                    this.updateScoreBoard();
                    this.bag = [];
                    this.nextPiece = null;
                    this.spawnPiece();
                    this.lastDropTime = performance.now();
                }
                return;
            }

            let cmdLeft = this.isGlitching ? 'ArrowRight' : 'ArrowLeft';
            let cmdRight = this.isGlitching ? 'ArrowLeft' : 'ArrowRight';
            let cmdUp = this.isGlitching ? 'ArrowDown' : 'ArrowUp';
            let cmdDown = this.isGlitching ? 'ArrowUp' : 'ArrowDown';

            if (e.code === cmdLeft || e.code === (this.isGlitching ? 'KeyD' : 'KeyA')) {
                this.move(-1);
            } else if (e.code === cmdRight || e.code === (this.isGlitching ? 'KeyA' : 'KeyD')) {
                this.move(1);
            } else if (e.code === cmdDown || e.code === (this.isGlitching ? 'KeyW' : 'KeyS')) {
                this.moveDown();
            } else if (e.code === cmdUp || e.code === (this.isGlitching ? 'KeyS' : 'KeyW')) {
                this.rotate(1); // CW
            } else if (e.code === 'KeyZ') {
                this.rotate(-1); // CCW
            } else if (e.code === 'Space') {
                this.hardDrop();
            }
        });
    }

    loop(timestamp) {
        if (!this.hasStarted) {
            this.renderer.clear();
            this.renderer.drawBoard(this.grid); // just to draw the empty board
            requestAnimationFrame(this.loop);
            return;
        }

        if (!this.lastDropTime) this.lastDropTime = timestamp;

        if (!this.isGameOver) {
            const deltaTime = timestamp - this.lastDropTime;

            if (deltaTime > this.dropInterval) {
                this.moveDown();
                this.lastDropTime = timestamp;
            }

            this.renderer.clear();
            this.renderer.drawBoard(this.grid);

            if (this.activePiece) {
                const ghostY = this.getGhostY();
                this.renderer.drawGhostPiece(this.activePiece, ghostY);
                this.renderer.drawPiece(this.activePiece);
            }

            this.renderer.updateAndDrawParticles();
        }

        requestAnimationFrame(this.loop);
    }
}

// Start immediately
window.onload = () => {
    new Game();
};
