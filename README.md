# Neon Tetra

A high-performance Tetris clone built with HTML5 Canvas and Vanilla JavaScript.

## Features

*   **Core Mechanics:** 10x20 grid, 7 classic Tetrominos with accurate SRS (Super Rotation System) wall kicks.
*   **Performance:** Smooth 60FPS lockstep game loop using `requestAnimationFrame`.
*   **Visuals & Juice:** Neon stroke rendering, Ghost Piece for targeting, hard drop screen shake, and custom particle explosions on line clears.
*   **Zen Vibe:** A shifting gradient background with a pulsing red warning grid when the stack gets dangerously high.
*   **Glitch Vibe:** Every 10 levels, the board tilts in 3D space, and the controls are inverted for 5 seconds.
*   **Combo System:** Consecutive line clears stack a multiplier and trigger floating text animations.

## How to Play

*   **Left/Right Arrows or A/D:** Move piece left/right
*   **Down Arrow or S:** Soft drop
*   **Up Arrow or W:** Rotate CW
*   **Z Key:** Rotate CCW
*   **Spacebar:** Hard drop

## How to Run Locally

This game is built with pure Vanilla JavaScript, HTML, and CSS. **No server is required!** 

Simply open the `index.html` file directly in any modern web browser (e.g., by double-clicking the file or dragging it into your browser window) to play.
