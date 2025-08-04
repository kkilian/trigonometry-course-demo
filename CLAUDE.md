# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run development server on http://localhost:3000
- `npm run build` - Build production bundle to `build/` folder
- `npm test` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- --watchAll=false` - Run tests once without watch mode

## Architecture

This is a single-page React application for an online trigonometry course with 194 step-by-step problems.

### Core Components Structure

The app uses a hierarchical component structure:
- `App.js` → `TrigonometryCourse` → `ProblemList` | `ProblemView`
- All math rendering flows through `MathRenderer` which handles LaTeX parsing and KaTeX rendering

### Data Flow

- Problems data (`src/data/problems.json`) contains 194 trigonometry problems with steps, hints, expressions, and solutions
- User progress is stored in localStorage as a Set of completed problem IDs
- No backend required - entirely client-side application

### Math Rendering Pipeline

`MathRenderer.jsx` implements a sophisticated LaTeX parsing system:
1. Dynamically loads KaTeX from CDN to reduce bundle size
2. Parses mixed text/math content using regex patterns for `\text{}`, `$...$`, and `\(...\)` delimiters
3. Uses memoization cache to avoid re-parsing identical content
4. Renders math segments with KaTeX, text segments as plain text

### State Management

- Local component state for UI interactions (current problem, revealed steps)
- localStorage for persistence (completed problems)
- No global state management library needed

### Styling

Custom CSS in `App.css` with:
- Dark theme optimized for math content
- Progress bars and completion indicators
- Responsive layout with max-width container
- KaTeX style overrides for better dark theme integration

## Deployment

The app is deployed to Vercel from GitHub:
- Repository: https://github.com/kkilian/trigonometry-course-demo
- Auto-deploys on push to main branch
- Build output in `build/` folder
- No environment variables required