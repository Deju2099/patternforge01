# Patternforge NVR

Foundations for a greyscale Non-Verbal Reasoning (NVR) practice app built with Angular, Tailwind CSS, and lightweight Angular Material primitives (reserved for future UI polish). The current build focuses on a classic timed mode with a best-fit sequence puzzle generator and renderer.

## Getting started

1. Install dependencies (requires npm access):

```bash
npm install
```

2. Run the development server:

```bash
npm start
```

3. Open `http://localhost:4200/` and begin solving puzzles.

> Note: If package downloads are blocked in your environment, you can still browse the code to review the modular architecture and renderer logic.

## Project highlights

- **Greyscale motif engine**: 80x80 canvas renderer with reusable motifs (bar stacks, staircase, double frame, dot grid, isometric cube, arrow ring) and discrete shade buckets.
- **Puzzle generation**: Best-fit sequence puzzles built from motif property patterns with tier-aware property budgets.
- **Game loop**: Classic timed mode with scoring, streaks, and lightweight HUD plus answer grid.
- **Stats**: LocalStorage-backed stats service tracking total puzzles, correct answers, best streak, and difficult solves.
- **Tailwind styling**: Glassy cell treatment, dark shell, and responsive layouts tuned for desktop/tablet first.

## Future improvements

- Wire additional game modes (survival, mastery) and richer Puzzle Labs controls for live motif tweaking.
- Add persistence via an HTTP API for profile sync and motif unlocks.
- Swap the canvas renderer for PixiJS if motif complexity or performance demands grow.
- Optional colour overlay strictly for UI chrome while keeping puzzle logic greyscale.
