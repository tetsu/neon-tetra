# Neon Tetra

![Live Demo](https://img.shields.io/badge/Play-Live_Demo-brightgreen?style=for-the-badge&logo=github)
**Play the game here:** [https://tetsu.github.io/neon-tetra](https://tetsu.github.io/neon-tetra)

[GitHub Repository](https://github.com/tetsu/neon-tetra)

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

Simply open the `index.html` file directly in any modern web browser to play.

## How to Host on GitHub

Because this game relies purely on front-end code (HTML/JS/CSS), it can be hosted for free directly on GitHub using **GitHub Pages**!

To enable it:
1. Go to your repository on GitHub.
2. Click on the **Settings** tab.
3. On the left sidebar, click on **Pages**.
4. Under the "Build and deployment" section, find "Source" and select **Deploy from a branch**.
5. Under "Branch", select your main branch (e.g., `main` or `master`) and keep the folder as `/ (root)`.
6. Click **Save**.

After a minute or two, GitHub will provide you with a live URL (e.g., `https://yourusername.github.io/neon-tetra`) where anyone can play your game!
