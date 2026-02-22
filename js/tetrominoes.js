// Tetromino definitions and SRS (Super Rotation System) Wall Kicks

const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#0ff', // Cyan
        glow: 'rgba(0, 255, 255, 0.8)'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0088ff', // Blue
        glow: 'rgba(0, 136, 255, 0.8)'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#ff8800', // Orange
        glow: 'rgba(255, 136, 0, 0.8)'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ff0', // Yellow
        glow: 'rgba(255, 255, 0, 0.8)'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#0f0', // Green
        glow: 'rgba(0, 255, 0, 0.8)'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#f0f', // Purple
        glow: 'rgba(255, 0, 255, 0.8)'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00', // Red
        glow: 'rgba(255, 0, 0, 0.8)'
    }
};

// SRS Wall Kick Data format: [ [dx, dy], ... ] for each of the 5 tests
// Index represents state transition: 0: 0->R, 1: R->0, 2: R->2, 3: 2->R, 4: 2->L, 5: L->2, 6: L->0, 7: 0->L
// To keep it simple, we use a slightly simplified but standard approach: Tests depend on current rotation and next rotation.
// Instead of full SRS map, we can map (currentRot, nextRot) -> test array
const WALL_KICKS_NORMAL = {
    '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
};

const WALL_KICKS_I = {
    '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
};

class Piece {
    constructor(type, isNext = false) {
        this.type = type;
        this.shape = TETROMINOES[type].shape;
        this.color = TETROMINOES[type].color;
        this.glow = TETROMINOES[type].glow;

        // I and O pieces spawn differently in standard Tetris, but generally center top
        this.x = 3;
        if (type === 'O') this.x = 4;
        this.y = 0;
        this.rotationState = 0; // 0, 1, 2, 3 mapped to 0, 90, 180, 270 deg
    }

    clone() {
        let p = new Piece(this.type);
        p.shape = this.shape.map(row => [...row]);
        p.x = this.x;
        p.y = this.y;
        p.rotationState = this.rotationState;
        return p;
    }

    rotate(dir) {
        let rows = this.shape.length;
        let cols = this.shape[0].length;
        let newShape = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (dir > 0) { // CW
                    newShape[c][rows - 1 - r] = this.shape[r][c];
                } else { // CCW
                    newShape[cols - 1 - c][r] = this.shape[r][c];
                }
            }
        }

        this.shape = newShape;
        this.rotationState = (this.rotationState + dir + 4) % 4;
    }
}
