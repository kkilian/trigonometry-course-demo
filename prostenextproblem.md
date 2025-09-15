# Proste Sugerowanie Następnego Zadania - Dokumentacja

## Przegląd
Uproszczony system sugerowania następnego zadania w `NextProblemSuggestion.jsx` zawsze proponuje dokładnie **3 zadania** w różnych poziomach trudności, używając **TF-IDF + cosine similarity** do znajdowania najbardziej podobnych zadań.

## Jak to działa

### 1. Analiza podobieństwa zadań
```javascript
// Preprocessing wszystkich treści zadań
const documents = problems.map(problem =>
  preprocessMathText(problem.statement)
);

// Tworzenie wektorów TF-IDF
const tfidf = new TFIDFProcessor();
const vectors = tfidf.fitTransform(documents);

// Obliczanie podobieństwa cosine
const calculator = new SimilarityCalculator('cosine');
const similar = calculator.getMostSimilar(currentIndex, 20)
```

### 2. System 3 poziomów trudności

#### **ŁATWE** (difficulty 1-2)
```javascript
const easySuggestion = similar.find(p =>
  (p.estimatedDifficulty === 1 || p.estimatedDifficulty === 2) &&
  !usedProblemIds.has(p.id)
);
```
- Zadania z poziomem trudności 1 lub 2
- Najbardziej podobne do aktualnego zadania
- Etykieta: "Łatwe" (zielona)

#### **PODOBNE** (ta sama trudność)
```javascript
const sameSuggestion = similar.find(p =>
  p.estimatedDifficulty === currentDifficulty &&
  !usedProblemIds.has(p.id)
);
```
- Zadania z tym samym poziomem trudności co aktualne
- Najbardziej podobne tematycznie
- Etykieta: "Podobne" (żółta)

#### **TRUDNE** (wyższa trudność)
```javascript
const hardSuggestion = similar.find(p =>
  p.estimatedDifficulty > currentDifficulty &&
  !usedProblemIds.has(p.id)
);
```
- Zadania trudniejsze niż aktualne
- Wyzwanie dla ucznia
- Etykieta: "Trudne" (pomarańczowa)

### 3. Ocena trudności zadań
```javascript
const estimateDifficulty = (problem) => {
  // Najpierw sprawdź ręczną trudność z JSON
  if (problem.difficulty !== undefined && problem.difficulty !== null) {
    return problem.difficulty;
  }

  // Fallback: ocena na podstawie liczby kroków
  const stepsCount = problem.steps?.length || 0;
  if (stepsCount <= 3) return 1; // Easy
  if (stepsCount <= 6) return 2; // Medium
  if (stepsCount <= 9) return 3; // Hard
  if (stepsCount <= 12) return 4; // Very hard
  return 5; // Expert
};
```

### 4. Fallback Logic
```javascript
// Jeśli brakuje kategorii, wypełnij pozostałymi podobnymi zadaniami
const missingCategories = ['easy', 'same', 'hard'].filter(category => !suggestions[category]);
const remainingProblems = similar.filter(p => !usedProblemIds.has(p.id));

missingCategories.forEach((category, index) => {
  if (remainingProblems[index]) {
    suggestions[category] = {
      ...remainingProblems[index],
      levelConfig: difficultyLevels[category],
      suggestionType: category
    };
  }
});
```

## Interfejs użytkownika

### Kompaktowy tryb (compact={true})
- **Przycisk "Następne"** - pulsujący przycisk z pomarańczową ramką
- **Hover tooltip** - 420px szerokości z 3 opcjami
- **Animacje** - fadeInScale, pulse-border, smooth transitions

### Struktura tooltip'a
```javascript
<div className="absolute top-full right-0 mt-2 w-[420px] bg-white border border-stone-200 rounded-lg shadow-xl">
  <div className="p-3 border-b border-stone-100">
    <h4>Wybierz poziom trudności</h4>
  </div>
  <div className="space-y-1">
    {['easy', 'same', 'hard'].map((type) => {
      // Renderowanie każdej opcji z preview zadania
    })}
  </div>
</div>
```

## Gdzie działa

### Lokalizacja w kodzie
- **Komponent**: `src/components/NextProblemSuggestion.jsx`
- **Używany w**: `src/components/ProblemView.jsx` (linie 222-229)
- **Warunki wyświetlania**: `showSolution && problems.length > 0`

### Działy aplikacji
Działa we **wszystkich działach** które używają ProblemView:
- ✅ Kombinatoryka
- ✅ Układy równań
- ✅ Funkcje homograficzne
- ✅ Ułamki elementarne
- ✅ Wielomiany
- ✅ Podstawy matematyki
- ✅ Wszystkie inne moduły

## Dane localStorage

System zapisuje sugerowane zadania dla konkretnych modułów:

```javascript
// Kombinatoryka
if (currentProblem.id.includes('combinatorics') || currentProblem.id.includes('kombinatoryka')) {
  localStorage.setItem('kombinatoryka-suggested-problems', JSON.stringify(suggestedIds));
}

// Układy równań
if (currentProblem.id.includes('derivative') || currentProblem.id.includes('uklady_rownan')) {
  localStorage.setItem('systems-of-equations-suggested-problems', JSON.stringify(suggestedIds));
}

// Funkcje homograficzne
if (currentProblem.id.includes('homographic')) {
  localStorage.setItem('homographic-functions-suggested-problems', JSON.stringify(suggestedIds));
}

// Ułamki elementarne
if (currentProblem.id.includes('fraction_')) {
  localStorage.setItem('elementary-fractions-suggested-problems', JSON.stringify(suggestedIds));
}
```

## Filtrowanie zadań

### Wykluczane zadania:
- ❌ Już rozwiązane (`!completedProblems.has(problem.id)`)
- ❌ Aktualne zadanie (`index !== currentIndex`)
- ❌ Za słabe podobieństwo (`similarity <= 0.1`)
- ❌ Już użyte w innych kategoriach (`!usedProblemIds.has(p.id)`)

### Uwzględniane zadania:
- ✅ Podobieństwo > 0.1
- ✅ Nierozwiązane
- ✅ Różne od aktualnego
- ✅ Pasujące do poziomu trudności

## Fallback dla braku sugestii

Jeśli nie ma inteligentnych sugestii, system pokazuje **następne sekwencyjne zadanie**:

```javascript
const nextProblem = problems.find(p =>
  !completedProblems.has(p.id) &&
  p.id !== currentProblem.id
);
```

## Algorytm w skrócie

1. **Preprocessing** - Czyści treści matematyczne zadań
2. **TF-IDF** - Tworzy wektory częstości słów
3. **Cosine Similarity** - Znajduje 20 najbardziej podobnych zadań
4. **Filtrowanie** - Usuwa rozwiązane/aktualne/za słabe podobieństwo
5. **Kategoryzacja** - Dzieli na Easy/Same/Hard według trudności
6. **Fallback** - Wypełnia brakujące kategorie
7. **UI** - Wyświetla w kompaktowym tooltip'ie
8. **localStorage** - Zapisuje dla modułów specjalnych

## Klucze techniczne

- **Podobieństwo**: Cosine similarity na wektorach TF-IDF
- **Preprocessing**: `preprocessMathText()` - normalizuje tekst matematyczny
- **Wydajność**: Cachowanie w useMemo, max 20 kandydatów
- **UX**: Hover tooltip, animacje, responsive design
- **Dostępność**: Semantic HTML, keyboard navigation