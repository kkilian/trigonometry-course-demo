# Jak działa algorytm sugerowania następnego zadania

## Przegląd
System używa zaawansowanego algorytmu łączącego analizę semantyczną (TF-IDF + Cosine Similarity) z inteligentną progresją trudności opartą na **5-poziomowej skali trudności** z manualnych ocen JSON i wydajności ucznia.

## 1. Określenie trudności zadań

### PRZED zmianami (stary system):
```javascript
// Tylko liczba kroków
const estimateDifficulty = (problem) => {
  const stepsCount = problem.steps?.length || 0;
  if (stepsCount <= 3) return 1; // Easy
  if (stepsCount <= 6) return 2; // Medium
  return 3; // Hard
};
```

### PO zmianach (nowy system):
```javascript
// Manualne difficulty z JSON + fallback (5-poziomowy)
const estimateDifficulty = (problem) => {
  // PRIORYTET: Manualne difficulty z JSON
  if (problem.difficulty !== undefined && problem.difficulty !== null) {
    return problem.difficulty; // 1, 2, 3, 4, lub 5
  }
  
  // FALLBACK: Rozszerzony system (liczba kroków)
  const stepsCount = problem.steps?.length || 0;
  if (stepsCount <= 3) return 1;  // Easy
  if (stepsCount <= 6) return 2;  // Medium
  if (stepsCount <= 9) return 3;  // Hard
  if (stepsCount <= 12) return 4; // Very hard
  return 5; // Expert
};
```

### Rozkład trudności w basics-13-uklady-rownan.json (5-poziomowy):

- **Poziom 1 (Łatwe):**
  - `derivative_constant_7` - pochodna stałej
  - `derivative_linear_x` - pochodna x
  - `derivative_x_squared` - pochodna x²

- **Poziom 2 (Średnie):**
  - Wielomiany podstawowe (derivative_polynomial_basic)
  - Iloczyny proste (product_rule_basic)
  - Pierwiastki (derivative_sqrt_x)
  - Funkcje wykładnicze (exponential_derivative_example)

- **Poziom 3 (Trudne):**
  - Ilorazy (derivative_quotient_rule)
  - Złożone funkcje (derivative_composite_square)
  - Logarytmy (derivative_ln_composite)

- **Poziom 4 (Bardzo trudne):**
  - Zaawansowane ilorazy (derivative_quotient_product)
  - Kompleksowe funkcje złożone (derivative_composite_exponential)
  - Kombinacje wielu reguł

- **Poziom 5 (Eksperckie):**
  - Najbardziej zaawansowane kombinacje
  - Wielokrotne aplikacje reguł
  - Funkcje odwrotne z kompozycjami

## 2. Analiza wydajności ucznia

```javascript
const getTargetDifficulty = (currentDifficulty, solveDuration) => {
  if (!solveDuration) return currentDifficulty; // Brak danych → ten sam poziom
  
  // Oczekiwane czasy rozwiązywania (5-poziomowy):
  const avgTimeByDifficulty = { 
    1: 60,   // 1 minuta dla łatwych
    2: 180,  // 3 minuty dla średnich  
    3: 420,  // 7 minut dla trudnych
    4: 600,  // 10 minut dla bardzo trudnych
    5: 900   // 15 minut dla eksperckich
  };
  
  const expectedTime = avgTimeByDifficulty[currentDifficulty] || 300;
  
  if (solveDuration < expectedTime * 0.7) {
    // Szybko rozwiązał (< 70%) → sugeruj trudniejsze
    return Math.min(currentDifficulty + 1, 5);
  } else if (solveDuration > expectedTime * 1.5) {
    // Wolno rozwiązał (> 150%) → sugeruj łatwiejsze  
    return Math.max(currentDifficulty - 1, 1);
  }
  
  return currentDifficulty; // Normalnie → ten sam poziom
};
```

### Przykłady:
- **Zadanie difficulty=2, rozwiązane w 100s:** 100 < 180×0.7=126 → target=3
- **Zadanie difficulty=2, rozwiązane w 300s:** 300 > 180×1.5=270 → target=1
- **Zadanie difficulty=2, rozwiązane w 200s:** 126 ≤ 200 ≤ 270 → target=2
- **Zadanie difficulty=4, rozwiązane w 400s:** 400 < 600×0.7=420 → target=5
- **Zadanie difficulty=5, rozwiązane w 1400s:** 1400 > 900×1.5=1350 → target=4

## 3. Analiza semantyczna (TF-IDF + Cosine Similarity)

### Krok 1: Preprocessing tekstów matematycznych
```javascript
const documents = problems.map(problem => 
  preprocessMathText(problem.statement) // Normalizacja LaTeX, tokenizacja
);
```

### Krok 2: Tworzenie wektorów TF-IDF
```javascript
const tfidf = new TFIDFProcessor();
const vectors = tfidf.fitTransform(documents);
// Każde zadanie → wektor liczb reprezentujący jego zawartość matematyczną
```

### Krok 3: Obliczanie podobieństwa cosinusowego
```javascript
const calculator = new SimilarityCalculator('cosine');
calculator.setVectors(vectors);

const similar = calculator.getMostSimilar(currentIndex, 20) // Top 20 podobnych
  .filter(({ index, similarity }) => {
    const problem = problems[index];
    return similarity > 0.1 &&                    // Min podobieństwo 10%
           !completedProblems.has(problem.id) &&  // Nie ukończone
           index !== currentIndex;                 // Nie to samo zadanie
  });
```

## 4. Inteligentne scorowanie (Hybrid Algorithm)

```javascript
const calculateProgressionScore = (similarity, problemDifficulty, targetDifficulty) => {
  const similarityWeight = 0.6;  // 60% wagi na podobieństwo tematyczne
  const difficultyWeight = 0.4;  // 40% wagi na progresję trudności
  
  // Składnik podobieństwa (0-1)
  const simScore = similarity;
  
  // Składnik dopasowania trudności (1=perfect match, 0=worst)
  // Dzielenie przez 4 dla zakresu 1-5 (max różnica = 4)
  const diffScore = 1 - Math.abs(problemDifficulty - targetDifficulty) / 4;
  
  return similarityWeight * simScore + difficultyWeight * diffScore;
};
```

### Przykład scorowania:
**Aktualne:** `derivative_linear_x` (diff=1), **Target:** diff=2

**Kandydaci:**
1. `derivative_constant_7` (similarity=0.8, diff=1):
   - simScore = 0.8
   - diffScore = 1 - |1-2|/4 = 1 - 0.25 = 0.75  
   - **Score = 0.6×0.8 + 0.4×0.75 = 0.78**

2. `derivative_polynomial_basic` (similarity=0.6, diff=2):
   - simScore = 0.6
   - diffScore = 1 - |2-2|/4 = 1 - 0 = 1.0
   - **Score = 0.6×0.6 + 0.4×1.0 = 0.76**

3. `derivative_composite_square` (similarity=0.4, diff=4):
   - simScore = 0.4  
   - diffScore = 1 - |4-2|/4 = 1 - 0.5 = 0.5
   - **Score = 0.6×0.4 + 0.4×0.5 = 0.44**

**Wynik:** `derivative_constant_7` wygrywa z najwyższym score 0.78 (wysokie podobieństwo + nieduża różnica trudności)

## 5. Finalny ranking i selekcja

```javascript
const bestMatches = similar
  .map(problem => ({
    ...problem,
    progressionScore: calculateProgressionScore(
      problem.similarity,
      problem.estimatedDifficulty, 
      targetDifficulty
    )
  }))
  .sort((a, b) => b.progressionScore - a.progressionScore) // Najlepsze pierwsze
  .slice(0, 3); // Top 3 sugestie
```

## 6. Zapisywanie do localStorage

System zapisuje sugestie dla różnych modułów:

```javascript
// Dla modułu trygonometrii
if (currentProblem.id && currentProblem.id.includes('tex_problem')) {
  const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
  localStorage.setItem('trigonometry-suggested-problems', JSON.stringify(suggestedIds));
}

// Dla modułu układów równań/pochodnych  
if (currentProblem.id && (currentProblem.id.includes('derivative') || currentProblem.id.includes('uklady_rownan'))) {
  const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
  localStorage.setItem('systems-of-equations-suggested-problems', JSON.stringify(suggestedIds));
}
```

## 7. Kompletny przykład działania

**Sytuacja:** Student rozwiązuje `derivative_x_squared` (diff=1) w czasie 40 sekund

### Krok po kroku:
1. **Określenie target difficulty:**
   - Current: 1, Expected time: 60s
   - Actual: 40s < 60×0.7=42s → target = min(1+1, 5) = 2

2. **Znajdowanie podobnych zadań (TF-IDF):**
   - `derivative_linear_x` (sim=0.85, diff=1)
   - `derivative_constant_7` (sim=0.75, diff=1) 
   - `derivative_polynomial_basic` (sim=0.65, diff=2)
   - `product_rule_basic` (sim=0.45, diff=4)

3. **Scorowanie (z nowym algorytmem /4):**
   - `derivative_linear_x`: 0.6×0.85 + 0.4×0.75 = 0.81
   - `derivative_constant_7`: 0.6×0.75 + 0.4×0.75 = 0.75
   - `derivative_polynomial_basic`: 0.6×0.65 + 0.4×1.0 = **0.79** 
   - `product_rule_basic`: 0.6×0.45 + 0.4×0.5 = 0.47

4. **Finalny ranking:**
   1. `derivative_linear_x` (score=0.81) ← **TOP**
   2. `derivative_polynomial_basic` (score=0.79)
   3. `derivative_constant_7` (score=0.75)

**Wynik:** System sugeruje `derivative_linear_x` - bardzo podobne tematycznie, ale lekko trudniejsze (przejście od x² do funkcji liniowych jako kolejny krok).

## Korzyści nowego 5-poziomowego systemu

1. **Precyzyjna kontrola trudności** - 5-poziomowa skala difficulty zamiast zgadywania po krokach
2. **Adaptywna progresja** - dostosowanie do wydajności ucznia z szerszym zakresem (1-5)
3. **Balans tematyczny** - 60% podobieństwo + 40% progresja
4. **Matematyczna semantyka** - TF-IDF rozumie kontekst matematyczny
5. **Rozszerzona granularność** - więcej poziomów dla lepszego dopasowania
6. **Scaling czasowy** - realistyczne czasy dla każdego poziomu (1min → 15min)
7. **Fallback safety** - rozszerzony system kroków jako backup

## Pliki zaangażowane

- `src/components/NextProblemSuggestion.jsx` - główny algorytm
- `src/data/basics-13-uklady-rownan.json` - dane z manualnymi difficulty
- `src/utils/similarity/textProcessor.js` - preprocessing LaTeX
- `src/utils/similarity/tfidf.js` - TF-IDF implementation
- `src/utils/similarity/cosineSimilarity.js` - Cosine similarity calculator