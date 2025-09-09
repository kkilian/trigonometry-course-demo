# Jak działa algorytm sugerowania następnego zadania

## Przegląd
System używa zaawansowanego algorytmu łączącego analizę semantyczną (TF-IDF + Cosine Similarity) z inteligentną progresją trudności opartą na manualnych ocenach i wydajności ucznia.

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
// Manualne difficulty z JSON + fallback
const estimateDifficulty = (problem) => {
  // PRIORYTET: Manualne difficulty z JSON
  if (problem.difficulty !== undefined && problem.difficulty !== null) {
    return problem.difficulty; // 1, 2, lub 3
  }
  
  // FALLBACK: Stary system (liczba kroków)
  const stepsCount = problem.steps?.length || 0;
  if (stepsCount <= 3) return 1;
  if (stepsCount <= 6) return 2;
  return 3;
};
```

### Rozkład trudności w JSON:
- **Poziom 1 (Łatwe) - 6 zadań:**
  - `derivative_constant` - pochodna stałej
  - `derivative_linear` - pochodna x
  - `linear_derivative_example` - pochodna 3x + 5
  - `derivative_x_squared` - pochodna x²
  - `derivative_x_cubed` - pochodna x³
  - `power_rule_example` - pochodna 4x⁵

- **Poziom 2 (Średnie) - 10 zadań:**
  - Wielomiany (derivative_polynomial_basic, polynomial_derivative)
  - Iloczyny proste (product_derivative_example, derivative_product_example)
  - Pierwiastki (derivative_sqrt_x, derivative_power_negative)
  - Proste funkcje złożone (derivative_composite_square, derivative_sqrt_composite)
  - Funkcje wykładnicze (exponential_derivative_example)
  - Podstawowe trygonometria (derivative_sin_3x)

- **Poziom 3 (Trudne) - 13 zadań:**
  - Ilorazy (derivative_quotient_rule, derivative_quotient_sqrt, derivative_quotient_product)
  - Złożone funkcje trygonometryczne (derivative_composite_cos, derivative_tan_composite, composite_trig_derivative)
  - Logarytmy złożone (derivative_ln_composite, derivative_ln_sqrt)
  - Kombinacje funkcji (derivative_exponential_logarithm, derivative_product_trig)
  - Funkcje odwrotne (arctan_composite_derivative)
  - Zaawansowane złożone (derivative_composite_exponential)

## 2. Analiza wydajności ucznia

```javascript
const getTargetDifficulty = (currentDifficulty, solveDuration) => {
  if (!solveDuration) return currentDifficulty; // Brak danych → ten sam poziom
  
  // Oczekiwane czasy rozwiązywania:
  const avgTimeByDifficulty = { 
    1: 120,  // 2 minuty dla łatwych
    2: 300,  // 5 minut dla średnich  
    3: 600   // 10 minut dla trudnych
  };
  
  const expectedTime = avgTimeByDifficulty[currentDifficulty] || 300;
  
  if (solveDuration < expectedTime * 0.7) {
    // Szybko rozwiązał (< 70%) → sugeruj trudniejsze
    return Math.min(currentDifficulty + 1, 3);
  } else if (solveDuration > expectedTime * 1.5) {
    // Wolno rozwiązał (> 150%) → sugeruj łatwiejsze  
    return Math.max(currentDifficulty - 1, 1);
  }
  
  return currentDifficulty; // Normalnie → ten sam poziom
};
```

### Przykłady:
- **Zadanie difficulty=2, rozwiązane w 180s:** 180 < 300×0.7=210 → target=3
- **Zadanie difficulty=2, rozwiązane w 500s:** 500 > 300×1.5=450 → target=1
- **Zadanie difficulty=2, rozwiązane w 320s:** 210 ≤ 320 ≤ 450 → target=2

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
  const diffScore = 1 - Math.abs(problemDifficulty - targetDifficulty) / 2;
  
  return similarityWeight * simScore + difficultyWeight * diffScore;
};
```

### Przykład scorowania:
**Aktualne:** `derivative_linear` (diff=1), **Target:** diff=2

**Kandydaci:**
1. `linear_derivative_example` (similarity=0.8, diff=1):
   - simScore = 0.8
   - diffScore = 1 - |1-2|/2 = 1 - 0.5 = 0.5  
   - **Score = 0.6×0.8 + 0.4×0.5 = 0.68**

2. `derivative_polynomial_basic` (similarity=0.6, diff=2):
   - simScore = 0.6
   - diffScore = 1 - |2-2|/2 = 1 - 0 = 1.0
   - **Score = 0.6×0.6 + 0.4×1.0 = 0.76** ← **WYGRYWA**

3. `derivative_composite_square` (similarity=0.4, diff=2):
   - simScore = 0.4  
   - diffScore = 1.0
   - **Score = 0.6×0.4 + 0.4×1.0 = 0.64**

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

**Sytuacja:** Student rozwiązuje `derivative_x_squared` (diff=1) w czasie 80 sekund

### Krok po kroku:
1. **Określenie target difficulty:**
   - Current: 1, Expected time: 120s
   - Actual: 80s < 120×0.7=84s → target = min(1+1, 3) = 2

2. **Znajdowanie podobnych zadań (TF-IDF):**
   - `derivative_x_cubed` (sim=0.85, diff=1)
   - `power_rule_example` (sim=0.75, diff=1) 
   - `derivative_polynomial_basic` (sim=0.65, diff=2)
   - `derivative_composite_square` (sim=0.45, diff=2)

3. **Scorowanie:**
   - `derivative_x_cubed`: 0.6×0.85 + 0.4×0.5 = 0.71
   - `power_rule_example`: 0.6×0.75 + 0.4×0.5 = 0.65
   - `derivative_polynomial_basic`: 0.6×0.65 + 0.4×1.0 = **0.79** ← TOP
   - `derivative_composite_square`: 0.6×0.45 + 0.4×1.0 = 0.67

4. **Finalny ranking:**
   1. `derivative_polynomial_basic` (score=0.79)
   2. `derivative_x_cubed` (score=0.71) 
   3. `derivative_composite_square` (score=0.67)

**Wynik:** System sugeruje `derivative_polynomial_basic` - tematycznie związane z potęgami, ale trudniejsze (wielomian zamiast pojedynczej potęgi).

## Korzyści nowego systemu

1. **Precyzyjna kontrola trudności** - manualne difficulty zamiast zgadywania po krokach
2. **Adaptywna progresja** - dostosowanie do wydajności ucznia
3. **Balans tematyczny** - 60% podobieństwo + 40% progresja
4. **Matematyczna semantyka** - TF-IDF rozumie kontekst matematyczny
5. **Fallback safety** - stary system jako backup

## Pliki zaangażowane

- `src/components/NextProblemSuggestion.jsx` - główny algorytm
- `src/data/basics-13-uklady-rownan.json` - dane z manualnymi difficulty
- `src/utils/similarity/textProcessor.js` - preprocessing LaTeX
- `src/utils/similarity/tfidf.js` - TF-IDF implementation
- `src/utils/similarity/cosineSimilarity.js` - Cosine similarity calculator