# NextProblemSuggestionMultiStep v2.0

## Przegląd

**NextProblemSuggestionMultiStep** to zaawansowany system rekomendacji zadań matematycznych, który łączy analizę wzorców wyboru ucznia z performance tracking z zadań MultiStep (interactive_choice). To ewolucja oryginalnego NextProblemSuggestion bazująca na dokumentacji z `jakdziala_sugerowanienastepnego2.md`.

## 🎯 Kluczowe Innowacje

### 1. **Dual-Metric Adaptive Engine**
Łączy dwie metryki w inteligentny system adaptacyjny:
- **Choice Patterns (60%):** jakie zadania wybiera uczeń (comfort/current/challenge)
- **MultiStep Performance (40%):** jak sobie radzi z interactive_choice steps

```javascript
adaptiveOffset = (choiceBasedOffset * 0.6) + (performanceBasedOffset * 0.4)
```

### 2. **Hybrid Learner Profiles**
4 nowe profile bazujące na kombinacji wyboru + performance:

| Profil | Wybory | Performance | Adaptive Offset | Opis |
|--------|--------|-------------|----------------|------|
| **Overconfident Challenger** | challenge >50% | <40% | -0.7 | Wybiera trudne, ale słabo rozwiązuje |
| **Modest High-Performer** | comfort >60% | >80% | +0.3 | Wybiera łatwe, ale radzi się świetnie |
| **Balanced Achiever** | current >60% | 60-80% | 0 | Idealny balans |
| **Struggling Avoider** | comfort >50% | <50% | -0.8 | Unika trudności i ma problemy |

### 3. **Enhanced Performance Tracking**
```javascript
// Przykład trackowanej struktury
{
  timestamp: Date.now(),
  problemId: "elevator_combinatorics",
  suggestionType: "current",
  currentDifficulty: 3,

  // NOWE - MultiStep Performance Data
  multistepScore: {
    totalSteps: 5,
    correctSteps: 3,
    scorePercentage: 60,
    stepDetails: [
      { step: 1, correct: true, timeSpent: 45000 },
      { step: 2, correct: false, timeSpent: 120000 },
      // ...
    ]
  },
  completionTime: 180000,
  hintsUsed: 2,
  completed: true
}
```

## 🚀 Jak Używać

### Basic Usage

```jsx
import NextProblemSuggestionMultiStep from './components/NextProblemSuggestionMultiStep';

<NextProblemSuggestionMultiStep
  currentProblem={currentProblem}
  completedProblems={completedProblems}
  onSelectProblem={handleSelectProblem}
  problems={allProblems}
  compact={true}
  showPerformanceIndicators={true}
/>
```

### Advanced Usage with Callbacks

```jsx
<NextProblemSuggestionMultiStep
  currentProblem={currentProblem}
  completedProblems={completedProblems}
  onSelectProblem={handleSelectProblem}
  problems={allProblems}

  // MultiStep specific props
  onTrackMultiStepChoice={(choiceData) => {
    // Callback when user makes a choice
    console.log('User chose:', choiceData);
    analyticsService.track('suggestion_chosen', choiceData);
  }}

  // UI customization
  compact={true}
  showPerformanceIndicators={true}
  showReasoningDetails={false} // Enable for debugging
/>
```

### Passing MultiStep Performance Data

Gdy uczeń kończy zadanie MultiStep, przekaż dane performance:

```javascript
const handleProblemComplete = (problemData, multistepResults) => {
  // multistepResults z MultiStepChoice komponentu
  const multistepData = {
    totalSteps: multistepResults.totalSteps,
    correctSteps: multistepResults.correctAnswers,
    scorePercentage: (multistepResults.correctAnswers / multistepResults.totalSteps) * 100,
    stepDetails: multistepResults.stepDetails,
    completionTime: multistepResults.totalTime,
    hintsUsed: multistepResults.hintsUsed,
    completed: true
  };

  // Komponent automatycznie pobierze te dane gdy user wybierze następne zadanie
  setCurrentProblem(nextProblem);
};
```

## 📊 Props API

| Prop | Type | Default | Opis |
|------|------|---------|------|
| `currentProblem` | Object | - | Aktualnie rozwiązywane zadanie |
| `completedProblems` | Set | - | Set ID ukończonych zadań |
| `onSelectProblem` | Function | - | Callback gdy user wybierze zadanie |
| `problems` | Array | `[]` | Lista wszystkich dostępnych zadań |
| `compact` | Boolean | `false` | Compact mode dla header |
| `showPerformanceIndicators` | Boolean | `true` | Czy pokazywać performance indicators |
| `showReasoningDetails` | Boolean | `false` | Czy pokazywać debug reasoning |
| `onTrackMultiStepChoice` | Function | - | Callback dla tracking wyboru |
| `solveDuration` | Number | `null` | Czas rozwiązania (compatibility) |

## 🎨 UI Modes

### 1. Compact Mode (dla header)
```jsx
<NextProblemSuggestionMultiStep
  compact={true}
  showPerformanceIndicators={true}
/>
```

**Cechy:**
- Jeden przycisk "Następne" z performance ring
- Hover tooltip z 3 poziomami trudności
- Profile badge i trend indicator
- Performance analytics footer
- Szerokość: 500px tooltip

### 2. Full Mode
```jsx
<NextProblemSuggestionMultiStep compact={false} />
```

**Cechy:**
- Grid layout z kartami sugestii
- Pełne metryki na każdej karcie
- Profile badge w header
- Responsive design (1 kolumna → 3 kolumny)

### 3. Debug Mode
```jsx
<NextProblemSuggestionMultiStep
  showReasoningDetails={true}
/>
```

**Dodatkowo pokazuje:**
- Debug header z statistics
- Adaptive reasoning details
- Method explanations
- Confidence scores

## 📈 Performance Metrics

System oblicza następujące metryki:

### Choice Patterns
- `comfortRate`: % wyborów "Powtórka"
- `currentRate`: % wyborów "Dalej"
- `challengeRate`: % wyborów "Wyzwanie"

### MultiStep Performance
- `avgMultistepScore`: Średni % poprawnych odpowiedzi
- `consistencyScore`: Jak stabilne są wyniki (0-1)
- `timeEfficiency`: Jak szybko rozwiązuje (0-1, 2min/step = 1.0)
- `hintDependency`: Jak często używa podpowiedzi (0-1)
- `completionRate`: % rozpoczętych zadań ukończonych
- `trend`: "improving" | "declining" | "stable"

### Expected Performance (dla sugestii)
- `fit`: % dopasowania do profilu ucznia (40-100%)
- `estimatedTime`: Przewidywany czas rozwiązania (min)
- `successRate`: Przewidywany % sukcesu (40-95%)
- `reasoning`: Wyjaśnienie obliczeń

## 🔧 Advanced Features

### 1. **localStorage Integration**
```javascript
// Enhanced choice tracking
'learning-patterns-choices-multistep' // Last 50 enhanced choices

// Performance data
'multistep-performance-history'       // Performance metrics

// Debug exports
'learning-data-export-multistep'      // Full system state

// Module-specific caches
'kombinatoryka-suggested-problems'    // Cached for kombinatoryka module
```

### 2. **Debug Console Functions**
```javascript
// In browser console:
window.exportLearningDataMultiStep(); // Export all data for analysis

// Console logging includes:
// 🧠 NextProblemSuggestionMultiStep Analytics v2.0
// 📋 Current State
// 📊 Choice Patterns
// 🎯 Performance Analysis
// 👤 Hybrid Profile
// ⚖️ Adaptive Offset Calculation
// ✨ Enhanced Suggestions
```

### 3. **Fallback Strategy**
System ma 4-poziomowy fallback:

1. **Full MultiStep System** - idealne warunki (choice + performance data)
2. **Choice-Only System** - fallback do v2.0 logic gdy brak performance data
3. **Sequential System** - kolejne zadanie gdy brak podobieństwa
4. **Emergency Fallback** - zawsze zwraca coś (pierwszy dostępny)

### 4. **Data Validation**
Automatyczna walidacja danych:
- Score percentages (0-100%)
- Time ranges (10s - 60min)
- Step consistency
- Problem ID validation

## 🧪 Testing & Debugging

### Development Mode
```jsx
<NextProblemSuggestionMultiStep
  showReasoningDetails={true}
  onTrackMultiStepChoice={(data) => console.log('Choice tracked:', data)}
/>
```

### Performance Testing
```javascript
// Generate mock data for testing
const mockChoices = Array(20).fill().map((_, i) => ({
  timestamp: Date.now() - (i * 3600000), // 1 hour intervals
  problemId: `test_problem_${i}`,
  suggestionType: ['comfort', 'current', 'challenge'][i % 3],
  multistepScore: {
    scorePercentage: 60 + Math.random() * 30,
    totalSteps: 5,
    correctSteps: 3 + Math.floor(Math.random() * 2)
  }
}));

localStorage.setItem('learning-patterns-choices-multistep', JSON.stringify(mockChoices));
```

## 🔬 Algorithm Details

### Adaptive Offset Calculation
```javascript
// Hybrid Profile Method (preferred)
if (hybridProfile.adaptiveOffset !== undefined) {
  return hybridProfile.adaptiveOffset; // -0.8 to +0.5
}

// Weighted Combination Method (fallback)
const choiceWeight = performanceData ? 0.6 : 1.0;
const performanceWeight = performanceData ? 0.4 : 0.0;

finalOffset = Math.max(-1.0, Math.min(1.0,
  (choiceOffset * choiceWeight) + (performanceOffset * performanceWeight)
));
```

### Performance Prediction
```javascript
// Fit Calculation
const difficultyDifference = Math.abs(problem.difficulty - targetLevel);
const baseFit = Math.max(50, 100 - (difficultyDifference * 15));
const performanceFit = avgScore > 70 ? baseFit + 10 : baseFit - 10;

// Success Rate Adjustment
let successRate = avgScore;
if (targetLevel < problemLevel) successRate -= 15; // Harder
if (targetLevel > problemLevel) successRate += 10; // Easier

// Time Estimation
const baseTimePerStep = timeEfficiency > 0.7 ? 2 : timeEfficiency > 0.4 ? 4 : 6;
const estimatedTime = (problemSteps * baseTimePerStep);
```

## 📋 Migration Guide

### From Original NextProblemSuggestion

1. **Replace import:**
```javascript
// Old
import NextProblemSuggestion from './NextProblemSuggestion';

// New
import NextProblemSuggestionMultiStep from './NextProblemSuggestionMultiStep';
```

2. **Update props (all existing props are compatible):**
```javascript
// Add MultiStep specific props
<NextProblemSuggestionMultiStep
  // ... existing props
  onTrackMultiStepChoice={handleChoiceTracking}
  showPerformanceIndicators={true}
/>
```

3. **Optional: Add performance data tracking**
```javascript
// In your MultiStepChoice completion handler
const handleMultiStepComplete = (results) => {
  // Store results in component state or context
  // NextProblemSuggestionMultiStep will automatically use them
};
```

## 🚦 Compatibility

- ✅ Drop-in replacement dla NextProblemSuggestion
- ✅ Wszystkie existing props are supported
- ✅ Graceful degradation gdy brak MultiStep data
- ✅ localStorage backward compatibility
- ✅ Same TF-IDF + similarity algorithm core
- ✅ Same fallback behavior when needed

## 🏆 Success Metrics

System śledzi następujące metryki sukcesu:

### Primary Metrics
- **Suggestion Accuracy:** >75% (users choose suggested vs random)
- **Adaptive Effectiveness:** >80% (correct difficulty predictions)
- **Completion Rate:** >85% (started problems get finished)

### Secondary Metrics
- **Time in Flow:** >70% session time in appropriate difficulty
- **System Confidence:** >0.7 average confidence score
- **Fallback Usage:** <20% (most users get full system benefits)

---

## 📚 Related Documentation

- [jakdziala_sugerowanienastepnego2.md](./jakdziala_sugerowanienastepnego2.md) - Oryginalna dokumentacja systemu v2.0
- [NextProblemSuggestion.jsx](./src/components/NextProblemSuggestion.jsx) - Oryginalny komponent
- [KombinatorykStartHere.jsx](./src/components/KombinatorykStartHere.jsx) - Inspiracja UI design

## 🤖 Generated with Claude Code

Ten komponent został w pełni wygenerowany przez [Claude Code](https://claude.ai/code) bazując na istniejącym systemie i requirements z dokumentacji.

**Co-Authored-By: Claude <noreply@anthropic.com>**