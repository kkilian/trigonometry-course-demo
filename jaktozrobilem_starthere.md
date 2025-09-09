# Jak to zrobiliśmy: Ekran "Start Here" dla Trygonometrii

## Koncepcja

Przekształciliśmy standardową listę zadań w module Trygonometria na inteligentny ekran "zacznij tutaj", który:
- Przy pierwszej wizycie pokazuje jeden kafelek z pierwszym zadaniem
- Przy kolejnych wizytach pokazuje dwa kafelki z zadaniami sugerowanymi przez AI podczas ostatniej sesji
- Eliminuje potrzebę przewijania przez długą listę zadań
- Używa NextProblemSuggestion do płynnej nawigacji między zadaniami

## 1. Utworzenie nowego komponentu TrigonometryStartHere.jsx

### Główne funkcjonalności:
```jsx
const TrigonometryStartHere = ({ 
  problems, 
  onSelectProblem, 
  completedProblems = new Set(), 
  onBack 
}) => {
```

### Logika wyświetlania problemów:
```jsx
// Determine which problems to show based on progress
const problemsToShow = useMemo(() => {
  if (!problems || problems.length === 0) return [];

  // First visit - no completed problems
  if (completedProblems.size === 0) {
    return [problems[0]]; // Show only the first problem
  }

  // Return visit - show suggested problems if available
  if (suggestedProblems.length > 0) {
    return suggestedProblems;
  }

  // Fallback - find next uncompleted problems
  const uncompleted = problems
    .filter(p => !completedProblems.has(p.id))
    .slice(0, 2);
  
  return uncompleted.length > 0 ? uncompleted : [problems[0]];
}, [problems, completedProblems, suggestedProblems]);
```

### Ładowanie sugerowanych zadań z localStorage:
```jsx
// Load suggested problems from localStorage
useEffect(() => {
  const savedSuggestions = localStorage.getItem('trigonometry-suggested-problems');
  if (savedSuggestions) {
    try {
      const suggestions = JSON.parse(savedSuggestions);
      // Validate that these problems still exist and aren't completed
      const validSuggestions = suggestions
        .map(id => problems?.find(p => p.id === id))
        .filter(p => p && !completedProblems.has(p.id))
        .slice(0, 2);
      setSuggestedProblems(validSuggestions);
    } catch (e) {
      console.error('Error loading suggested problems:', e);
    }
  }
}, [problems, completedProblems]);
```

## 2. Modyfikacja TrigonometryCourse.jsx

### Dodanie importu:
```jsx
import TrigonometryStartHere from './TrigonometryStartHere';
```

### Zmiana renderowania dla modułu 'powers':
```jsx
// Render course mode (powers, polynomial topics, etc)
return (
  <>
    {currentProblem ? (
      <ProblemView
        problem={currentProblem}
        onBack={handleBack}
        onComplete={handleComplete}
        onSelectProblem={handleSelectProblem}
        completedProblems={getCurrentCompleted()}
        problems={problems}
      />
    ) : mode === 'powers' ? (
      // Special handling for trigonometry - show start here screen instead of problem list
      <TrigonometryStartHere
        problems={problems}
        onSelectProblem={handleSelectProblem}
        completedProblems={getCurrentCompleted()}
        onBack={handleBackToWelcome}
      />
    ) : (
      <ProblemList
        problems={problems}
        onSelectProblem={handleSelectProblem}
        completedProblems={getCurrentCompleted()}
        title={sectionInfo.title}
        subtitle={sectionInfo.subtitle}
        onBack={
          mode.startsWith('polynomial-') ? handleBackToPolynomialTopics : 
          mode.startsWith('basics-') ? handleBackToBasicsTopics :
          handleBackToWelcome
        }
      />
    )}
  </>
);
```

## 3. Modyfikacja NextProblemSuggestion.jsx

### Dodanie zapisywania sugestii do localStorage:
```jsx
// Save suggested problems to localStorage for trigonometry module
if (currentProblem.id && currentProblem.id.includes('tex_problem')) {
  const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
  localStorage.setItem('trigonometry-suggested-problems', JSON.stringify(suggestedIds));
  console.log('Saved suggested problems for trigonometry:', suggestedIds);
}
```

## 4. Stylowanie kafelków

### Pierwsza wizyta - jeden duży kafelek:
```jsx
{problemsToShow.length === 1 ? (
  // First visit - single problem card
  <div className="px-4 md:px-8">
    <button
      onClick={() => handleStartProblem(problemsToShow[0])}
      className={`w-full text-left p-6 md:p-10 rounded-xl transition-all group relative ${
        completedProblems.has(problemsToShow[0].id) 
          ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300 shadow-lg shadow-orange-200/40' 
          : 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 animate-pulse-border'
      }`}
    >
```

### Kolejne wizyty - dwa kafelki:
```jsx
) : (
  // Return visit - two suggested problems
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-2">{getHeaderText()}</h3>
      <p className="text-stone-600 text-sm">Możesz też zacząć od jednego z tych zadań</p>
    </div>
    <div className="space-y-4 px-4 md:px-8">
      {problemsToShow.map((problem, index) => (
        <button
          key={problem.id}
          onClick={() => handleStartProblem(problem)}
          className={`w-full text-left p-6 md:p-8 rounded-xl transition-all group relative ${
            completedProblems.has(problem.id) 
              ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300 shadow-lg shadow-orange-200/40' 
              : index === 0
                ? 'bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 animate-pulse-border'
                : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
```

## 5. Pasek postępu z gradientem

### Usunięcie tekstu i dodanie paska:
```jsx
{/* Header */}
<header>
  <h1 className="text-2xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
    Trygonometria
  </h1>
  {/* Progress Bar */}
  {problems && problems.length > 0 && (
    <div className="w-full bg-stone-200 rounded-full h-1.5">
      <div 
        className="h-1.5 rounded-full transition-all duration-300"
        style={{
          background: 'linear-gradient(to right, #facc15, #f97316)',
          width: `${problems.length > 0 ? (completedProblems.size / problems.length) * 100 : 0}%`
        }}
      />
    </div>
  )}
</header>
```

## 6. Efekt pulsacji

### Użycie istniejącej animacji CSS:
```css
.animate-pulse-border {
  animation: pulseBorder 2s ease-in-out infinite;
}

@keyframes pulseBorder {
  0%, 100% {
    border-color: rgb(251 146 60);
    box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.4);
  }
  50% {
    border-color: rgb(254 215 170);
    box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1);
  }
}
```

### Zastosowanie do pierwszego kafelka:
- Pierwsza wizyta: jedyny kafelek pulsuje jeśli nie jest ukończony
- Kolejne wizyty: pierwszy z dwóch kafelków pulsuje jeśli nie jest ukończony

## 7. Flow użytkownika

### Pierwszy raz:
1. Użytkownik wchodzi w "Trygonometria"
2. Widzi jeden duży kafelek z pierwszym zadaniem (tex_problem_1)
3. Kafelek pulsuje pomarańczowym obramowaniem
4. Kliknięcie otwiera ProblemView

### Podczas rozwiązywania:
1. W ProblemView działa NextProblemSuggestion
2. AI generuje sugestie na podstawie podobieństwa i trudności
3. Sugestie zapisywane do `trigonometry-suggested-problems` w localStorage

### Powrót do modułu:
1. Użytkownik wraca do modułu Trygonometria
2. TrigonometryStartHere odczytuje sugestie z localStorage
3. Pokazuje dwa kafelki z sugerowanymi zadaniami
4. Pierwszy kafelek pulsuje, drugi jest normalny

## 8. Kluczowe pliki

### Utworzone:
- `src/components/TrigonometryStartHere.jsx` - główny komponent

### Zmodyfikowane:
- `src/components/TrigonometryCourse.jsx` - routing do nowego komponentu
- `src/components/NextProblemSuggestion.jsx` - zapisywanie sugestii
- (CSS już istniał) - animacje pulsacji

## 9. localStorage Integration

### Klucze używane:
- `trigonometry-suggested-problems` - array ID-ów sugerowanych zadań
- `completedPowersProblems` - Set ukończonych zadań (już istniejący)

### Mechanizm:
1. NextProblemSuggestion zapisuje top 2 sugestie
2. TrigonometryStartHere odczytuje i waliduje sugestie
3. Pokazuje tylko nieukończone i istniejące zadania

## Podsumowanie

Udało się stworzyć inteligentny, adaptacyjny interfejs, który:
- Eliminuje overwhelm długiej listy zadań
- Używa AI do personalizacji doświadczenia
- Zapewnia spójność wizualną z resztą aplikacji
- Zachowuje stan między sesjami
- Wizualnie wyróżnia ważne elementy (pulsacja)
- Ma elegancki pasek postępu z gradientem

System jest w pełni kompatybilny z istniejącą infrastrukturą i może być łatwo rozszerzony na inne moduły.