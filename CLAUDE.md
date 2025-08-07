# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run development server on http://localhost:3000
- `npm run build` - Build production bundle to `build/` folder
- `npm test` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- --watchAll=false` - Run tests once without watch mode

## Architecture

This is a React 19.1.1 application for an online trigonometry course featuring 194 step-by-step problems and 93 quiz questions. Built with Create React App 5.0.1 and styled with Tailwind CSS 3.4.17.

### Component Hierarchy

```
App.js
└── TrigonometryCourse (main container, manages mode switching)
    ├── QuizSelector (toggle between course/quiz modes)
    ├── ProblemList (course mode - lists all problems)
    │   └── MathRenderer (LaTeX rendering)
    ├── ProblemView (individual problem with step-by-step revelation)
    │   └── MathRenderer
    └── TrigonometryQuiz (quiz mode with 10 random questions)
        ├── StudentReport (performance analysis and recommendations)
        └── MathRenderer
```

### Math Rendering System

The `MathRenderer.jsx` component implements a sophisticated LaTeX parsing pipeline:
- **Dynamic Loading**: KaTeX loaded from CDN on demand (reduces bundle by ~100KB)
- **Mixed Content Parsing**: Handles `\text{}`, `$...$`, and `\(...\)` delimiters
- **Performance**: LRU cache (100 items max) prevents re-parsing identical content
- **Error Handling**: Graceful fallback to plain text if rendering fails
- **Cleanup**: Proper unmount handling to prevent memory leaks

### Progressive Problem Revelation

`ProblemView` implements a 3-click interaction pattern per step:
1. First click: Reveals hint (yellow glow animation)
2. Second click: Shows mathematical expression and explanation
3. Third click: Marks step as completed
- Auto-reveals solution when all steps are completed
- Progress tracked in localStorage as Set of problem IDs

### Quiz System Architecture

- **Quiz Generator** (`quizGenerator.js`): Stratified sampling (3 questions from levels 1-2, 4 from level 3, total 10)
- **Quiz Analyzer** (`quizAnalyzer.js`): Categorizes performance across 6 knowledge areas, generates study recommendations
- **Timed Mode**: 30-minute timer with auto-submission
- **Detailed Reporting**: Shows correct/incorrect answers with explanations

### Data Structures

**Problems** (`src/data/problems.json` - 194 items):
```json
{
  "id": "tex_problem_1",
  "topic": "Topic name",
  "statement": "LaTeX problem statement",
  "steps": [{
    "hint": "Optional hint",
    "expression": "LaTeX expression",
    "explanation": "Step explanation"
  }],
  "solutions": ["Solution array"]
}
```

**Quiz Questions** (`src/data/quiz-questions.json` - 93 items):
```json
{
  "level": 1,  // 1=basic, 2=medium, 3=advanced
  "content": "LaTeX question",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correctAnswer": "a",
  "explanation": "LaTeX explanation",
  "tags": ["category", "topic"]
}
```

### State Management

- **Component State**: React hooks for UI interactions (current problem, revealed steps, quiz answers)
- **Persistence**: localStorage for completed problems (survives browser sessions)
- **No Global State**: Simple prop drilling sufficient for app size

### Performance Optimizations

- **Lazy KaTeX Loading**: CDN loading reduces initial bundle size
- **Memoized Parsing**: Caches parsed LaTeX content
- **React Optimization**: `useMemo` for expensive computations
- **DOM Efficiency**: Document fragments for batch updates

## Deployment

The app is deployed to Vercel from GitHub:
- Repository: https://github.com/kkilian/trigonometry-course-demo
- Auto-deploys on push to main branch
- Build output in `build/` folder
- No environment variables required
- Fully static - suitable for CDN deployment