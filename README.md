# Vanilla CartController (TypeScript dev, JS deliverable)

**Goal:** Adaptive grid (~12 product cards) with quantity controls and a full cart block.
**Tech:** Final deliverable is pure HTML/CSS/JS. TypeScript is used **only during development**; reviewers open `public/index.html` without installing anything.

## Quick start (developer)

1. Install Node.js (only for TypeScript compile, not required by reviewers).
2. `npm i`
3. Dev compile: `npm run watch`
4. Open `public/index.html` (or run `npm run serve` and open http://localhost:5173).

## Build once

- `npm run build` emits JS into `public/dist`. Commit/ship `public` folder so the page runs without tools.

## Notes

- Currency BYN formatted via Intl.NumberFormat.
- All money logic uses integer cents to avoid floating-point issues.
- No persistence between reloads (per the assignment).
- A11y: semantic landmarks, aria-live for cart updates, visible :focus-visible states.
