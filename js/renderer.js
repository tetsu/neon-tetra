class Renderer {
    constructor(canvasId, nextCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById(nextCanvasId);
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.COLS = 10;
        this.ROWS = 20;
        this.BLOCK_SIZE = this.canvas.width / this.COLS;
        this.particles = [];
        this.shakeTimer = 0;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoard(grid) {
        // High stack warning (Zen Vibe)
        let highestBlock = this.ROWS;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (grid[r][c]) {
                    highestBlock = Math.min(highestBlock, r);
                }
            }
        }

        let isDanger = highestBlock <= 5;
        let pulseAlpha = isDanger ? (0.2 + Math.abs(Math.sin(Date.now() / 200)) * 0.3) : 0.05;

        // Draw grid lines (subtle or pulsing)
        this.ctx.strokeStyle = isDanger ? `rgba(255, 0, 0, ${pulseAlpha})` : `rgba(255, 255, 255, 0.05)`;
        this.ctx.lineWidth = 1;

        for (let r = 0; r <= this.ROWS; r++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, r * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, r * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let c = 0; c <= this.COLS; c++) {
            this.ctx.beginPath();
            this.ctx.moveTo(c * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(c * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw placed blocks
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (grid[r][c]) {
                    this.drawBlock(this.ctx, c, r, grid[r][c].color, grid[r][c].glow);
                }
            }
        }
    }

    drawPiece(piece, offsetX = 0, offsetY = 0) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlock(this.ctx, piece.x + c + offsetX, piece.y + r + offsetY, piece.color, piece.glow);
                }
            }
        }
    }

    drawGhostPiece(piece, dropY) {
        this.ctx.globalAlpha = 0.2;
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlock(this.ctx, piece.x + c, dropY + r, piece.color, piece.glow, true);
                }
            }
        }
        this.ctx.globalAlpha = 1.0;
    }

    drawNextPiece(piece) {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!piece) return;

        // Center the piece
        const bs = 25; // Block size for next canvas
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * bs) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * bs) / 2;

        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    this.drawBlockDirect(this.nextCtx, offsetX + c * bs, offsetY + r * bs, bs, piece.color, piece.glow);
                }
            }
        }
    }

    drawBlock(ctx, x, y, color, glow, isGhost = false) {
        const px = x * this.BLOCK_SIZE;
        const py = y * this.BLOCK_SIZE;
        const size = this.BLOCK_SIZE;
        this.drawBlockDirect(ctx, px, py, size, color, glow, isGhost);
    }

    drawBlockDirect(ctx, px, py, size, color, glow, isGhost = false) {
        const padding = 1;

        ctx.fillStyle = '#0a0a14'; // Dark core
        ctx.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (!isGhost) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
        } else {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = color;
            ctx.fillStyle = glow;
            ctx.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2);
        }

        ctx.strokeRect(px + padding, py + padding, size - padding * 2, size - padding * 2);
        ctx.shadowBlur = 0; // Reset
    }

    // Particle logic
    createExplosion(yRow, gridWidth) {
        for (let c = 0; c < gridWidth; c++) {
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: c * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
                    y: yRow * this.BLOCK_SIZE + this.BLOCK_SIZE / 2,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 1.0,
                    color: '#fff' // Flash white
                });
            }
        }
    }

    updateAndDrawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, 4, 4);
                this.ctx.globalAlpha = 1.0;
            }
        }
    }

    triggerShake() {
        const canvasElement = document.getElementById('game-canvas');
        canvasElement.classList.add('shake-active');
        setTimeout(() => {
            canvasElement.classList.remove('shake-active');
        }, 200);
    }
}
