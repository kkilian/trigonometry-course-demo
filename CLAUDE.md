# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent UI Improvements and Patterns

### 1. Premium Badge Implementation & Disabled Modules
- **Premium modules**: Gray border-2, subtle gray "Premium" label in top-right corner
- **Disabled modules**: Glass effect with `bg-white/40 backdrop-blur-sm opacity-60`
- Wygaszone kolory dla tekstu, ikon i badge'ów (opacity 70%)
- Position: `absolute top-1 right-4` with border and padding
- Shows alert when clicked: "Ta funkcja jest dostępna w wersji Premium"
- Example: "Wielomiany" moduł ma disabled glass effect

### 2. Progress Bars in BasicsTopics
- Each topic card shows individual progress based on localStorage data
- Progress bar: h-1.5 with gradient (blue for in-progress, green for completed)
- Shows "X z Y zadań" and percentage
- Calculated from completedBasicsXProblems in localStorage

### 3. Next Problem Suggestion in Header
- Single "Następne" button in header (orange border with pulse animation)
- Hover reveals tooltip with 2 suggested problems: "Główne" and "Alternatywa"
- Smart algorithm: cosine similarity + difficulty progression based on solve time
- Each suggestion shows full problem preview, difficulty level, steps count
- Only shows when problem is completed (showSolution === true)
- Hidden on mobile (hidden md:block)
- Implementation: NextProblemSuggestion component with compact={true} prop

### 4. Smaller Solution Card
- Reduced padding: p-4 md:p-5 (from p-6 md:p-8)
- Smaller font sizes: title text-sm md:text-base, content text-base md:text-lg
- Reduced border radius: rounded-lg (from rounded-xl)
- Tighter spacing between elements

### 5. Improved Next Problem Button Visibility
- Minimalist design with pulsing border animation to catch attention
- Automatic scroll to top when problem is completed (500ms delay)
- Custom CSS animations: pulseBorder with color transitions and box-shadow
- Two variants: orange border for suggested problems, blue for fallback
- Animation classes: animate-fadeInScale for entrance, animate-pulse-border for attention
- Compact button: transparent background, colored border that pulses

### 6. AI Chat Integration (Claude Haiku 3.5)
- **Menu tile**: Pink gradient border with animate-pulse-pink animation (clean "AI" badge without emojis)
- **Chat interface**: Full-screen layout with sticky header and input area
- **Messages**: User messages in pink gradient, AI responses in white with "Asystent" label (no emojis)
- **Features**: Minimalist typing indicator ("Pisze..."), auto-scroll, responsive design
- **API Integration**: Claude Haiku 3.5 via local proxy server (port 3003) due to CORS restrictions
- **Architecture**: Express proxy server handles Anthropic API calls, frontend uses localhost:3003/api/chat
- **Component**: AIChat.jsx with message history, LaTeX rendering support, clean UI design

## Commands

- `npm start` - Run development server on http://localhost:3000
- `npm run server` - Run AI Chat proxy server on http://localhost:3003 (requires ANTHROPIC_API_KEY in .env)
- `npm run build` - Build production bundle to `build/` folder
- `npm test` - Run tests in watch mode
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- --watchAll=false` - Run tests once without watch mode
- `npm run latex-checker` - Run LaTeX checker tool on port 3001
- `npm run solution-reviewer` - Run solution reviewer tool on port 3002

## Architecture

This is a React 19.1.1 multi-app educational platform built with Create React App 5.0.1 and styled with Tailwind CSS 3.4.17. The platform includes:
- **Main Course App**: Interactive trigonometry and sequences courses with step-by-step problem solving
- **LaTeX Checker**: Development tool for validating LaTeX rendering across all problems
- **Solution Reviewer**: Tool for reviewing problem solutions and checking completeness

The app mode is determined by the `REACT_APP_MODE` environment variable in `src/index.js`.

### Component Hierarchy

```
index.js (mode router based on REACT_APP_MODE)
├── App.js → TrigonometryCourse (default mode)
│   ├── WelcomeScreen (course selection menu)
│   ├── QuizSelector (toggle between course/quiz modes)
│   ├── ProblemList (course mode - lists all problems)
│   │   └── MathRenderer (LaTeX rendering)
│   ├── ProblemView (individual problem with step-by-step revelation)
│   │   └── MathRenderer
│   └── TrigonometryQuiz (quiz mode with 10 random questions)
│       ├── StudentReport (performance analysis and recommendations)
│       └── MathRenderer
├── LaTeXCheckerApp.js (checker mode)
│   └── LaTeXChecker (validates LaTeX rendering)
└── SolutionReviewerApp.js (reviewer mode)
    └── SolutionReviewer (reviews problem solutions)
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

### Course Content

The platform contains three problem sets:
- **Trigonometry** (`problems.json`): 175 problems covering basic to advanced trigonometry
- **Sequences** (`sequences-problems.json`): 27 problems on mathematical sequences
- **Sequences Introduction** (`sequences-intro-problems.json`): 32 introductory sequence problems

Total: 234 interactive problems across all courses

### Data Structures

**Problems** (JSON format):
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
- **Persistence**: localStorage stores completed problems separately for each course:
  - Trigonometry problems: tracked in `completedTrigProblems`
  - Sequences problems: tracked in `completedSeqProblems`
  - Sequences intro problems: tracked in `completedSeqIntroProblems`
- **No Global State**: Simple prop drilling sufficient for app size
- **Mode Switching**: Handled by `TrigonometryCourse` component with states: 'welcome', 'trigonometry', 'sequences', 'sequences-intro', 'quiz'

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
- nie uzywaj emotek