# Jak zaimplementować nowy dział z systemem StartHere

## Wstęp

Ten dokument opisuje proces dodawania nowego działu do aplikacji z wykorzystaniem systemu "StartHere" opartego na najlepszych praktykach z działu "Zadania tekstowe prowadzące do równań wymiernych". System ten zapewnia inteligentną nawigację - pokazuje jeden kafelek przy pierwszej wizycie, a później dwa kafelki z zadaniami sugerowanymi przez AI, wraz z eleganckimi przyciskami przełączania widoku.

## Przykład: Implementacja działu "Funkcje Homograficzne"

Poniżej przedstawiamy krok po kroku proces dodawania nowego działu na przykładzie "Funkcje Homograficzne".

---

## **Krok 1: Dodanie modułu do WelcomeScreen.jsx**

### 1.1. Import pliku danych
```jsx
// Dodaj import nowego pliku JSON
import homographicFunctionsProblems from '../data/homographic-functions-problems.json';
```

### 1.2. Dodanie modułu do tablicy
```jsx
const modules = [
  // ... istniejące moduły
  {
    id: 'homographic-functions',
    title: 'Funkcje Homograficzne', 
    description: 'Funkcje postaci f(x) = (ax+b)/(cx+d), ich właściwości i wykresy',
    problemCount: homographicFunctionsProblems.length
    // Brak 'disabled: true' - moduł będzie aktywny
  },
  // ... pozostałe moduły
];
```

**Uwaga:** Nowy moduł nie powinien mieć flagi `disabled: true`, aby był dostępny dla użytkownika.

---

## **Krok 2: Utworzenie pliku danych JSON**

### 2.1. Lokalizacja
```
src/data/homographic-functions-problems.json
```

### 2.2. Zawartość początkowa
```json
[]
```

**Uwaga:** Na początku tworzymy pusty plik. Dane można dodać później poprzez wklejenie gotowej zawartości.

---

## **Krok 3: Utworzenie komponentu StartHere**

### 3.1. Lokalizacja
```
src/components/HomographicFunctionsStartHere.jsx
```

### 3.2. Implementacja
Skopiuj `RationalEquationsWordProblemsStartHere.jsx` jako wzór SOTA i zmień:

#### **WAŻNE:** Dodaj informację dla nowych użytkowników
W sekcji renderowania dla pierwszej wizyty (gdy `problemsToShow.length === 1`), dodaj przed kafelkiem:
```jsx
{/* Informacja dla nowych użytkowników */}
<div className="text-center mb-6">
  <h3 className="text-lg font-semibold text-stone-800 mb-2">Zacznij tutaj</h3>
  <p className="text-stone-600 text-sm">
    Zacznij od tego zadania, a resztę dobierzemy specjalnie dla Ciebie
  </p>
</div>
```

#### Nazwa komponentu:
```jsx
const HomographicFunctionsStartHere = ({ 
  problems, 
  onSelectProblem, 
  completedProblems = new Set(), 
  onBack 
}) => {
```

#### Klucz localStorage dla sugestii:
```jsx
const savedSuggestions = localStorage.getItem('homographic-functions-suggested-problems');
```

#### Tytuł w nagłówku:
```jsx
<h1 className="text-2xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
  Funkcje Homograficzne
</h1>
```

#### Eksport komponentu:
```jsx
export default HomographicFunctionsStartHere;
```

#### Pasek postępu z liczbą zadań:
```jsx
{/* Progress Bar */}
{problems && problems.length > 0 && (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm text-stone-600">
      <span>Postęp</span>
      <span>{completedProblems.size} z {problems.length} zadań</span>
    </div>
    <div className="w-full bg-stone-200 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full transition-all duration-300"
        style={{
          background: 'linear-gradient(to right, #facc15, #f97316)',
          width: `${problems.length > 0 ? (completedProblems.size / problems.length) * 100 : 0}%`
        }}
      />
    </div>
  </div>
)}

{/* Toggle Buttons - NOWA FUNKCJONALNOŚĆ SOTA */}
<div className="flex gap-2 mt-4">
  <button
    onClick={() => setShowAllProblems(false)}
    className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
      !showAllProblems
        ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
        : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
    }`}
  >
    Sugerowane zadania
  </button>
  <button
    onClick={() => setShowAllProblems(true)}
    className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all ${
      showAllProblems
        ? 'bg-white text-stone-900 border border-stone-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]'
        : 'bg-transparent text-stone-500 border border-transparent hover:text-stone-700'
    }`}
  >
    Wszystkie zadania ({problems.length})
  </button>
</div>
```

**Uwaga:** Wszystkie pozostałe elementy (logika, stylowanie, animacje) pozostają identyczne jak w RationalEquationsWordProblemsStartHere.jsx.

### 3.3. **WAŻNE: Persystencja stanu widoku (localStorage)**

#### **Inicjalizacja stanu showAllProblems z localStorage**
```jsx
const [showAllProblems, setShowAllProblems] = useState(() => {
  try {
    const saved = localStorage.getItem('homographic-functions-show-all-problems');
    return saved ? JSON.parse(saved) : false;
  } catch (e) {
    console.error('Error loading view preference:', e);
    return false;
  }
});
```

#### **Zapisywanie preferencji widoku**
```jsx
// Save view preference to localStorage
useEffect(() => {
  try {
    localStorage.setItem('homographic-functions-show-all-problems', JSON.stringify(showAllProblems));
  } catch (e) {
    console.error('Error saving view preference:', e);
  }
}, [showAllProblems]);
```

#### **Klucz localStorage**
- **Format:** `{nazwa-modułu}-show-all-problems`
- **Przykład:** `homographic-functions-show-all-problems`
- **Typ:** boolean (true = wszystkie zadania, false = sugerowane)

#### **Korzyści implementacji**
✅ **Zachowanie kontekstu nawigacji** - użytkownik wraca do tego samego widoku (sugerowane/wszystkie)
✅ **Lepszy UX** - brak frustracji z resetowaniem widoku
✅ **Persystencja między sesjami** - preferencje zachowane nawet po zamknięciu przeglądarki
✅ **Spójność z systemem** - identyczna implementacja we wszystkich modułach

**Uwaga:** Ta funkcjonalność jest kluczowa dla dobrego doświadczenia użytkownika i powinna być implementowana we wszystkich nowych modułach.

---

## **Krok 4: Rozszerzenie TrigonometryCourse.jsx**

### 4.1. Import komponentu
```jsx
import HomographicFunctionsStartHere from './HomographicFunctionsStartHere';
```

### 4.2. Import pliku danych
```jsx
import homographicFunctionsProblems from '../data/homographic-functions-problems.json';
```

### 4.3. Stan dla ukończonych problemów

**SOTA: Inicjalizacja z localStorage**

```jsx
const [completedHomographicFunctionsProblems, setCompletedHomographicFunctionsProblems] = useState(() => {
  const saved = localStorage.getItem('completedHomographicFunctionsProblems');
  if (saved) {
    try {
      return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading homographic-functions progress:', e);
    }
  }
  return new Set();
});
```

**Dlaczego to ważne:**
- ✅ Stan jest inicjalizowany od razu z localStorage
- ✅ Brak opóźnienia - ukończone zadania widoczne natychmiast
- ✅ Lepsza wydajność - nie czeka na useEffect
- ✅ Brak race conditions przy nawigacji

### 4.4. Funkcja getCurrentProblems()
```jsx
const getCurrentProblems = () => {
  // ... istniejące warunki
  if (mode === 'homographic-functions') return homographicFunctionsProblems;
  return [];
};
```

### 4.5. Funkcja getCurrentCompleted()
```jsx
const getCurrentCompleted = () => {
  // ... istniejące warunki
  if (mode === 'homographic-functions') return completedHomographicFunctionsProblems;
  return completedPowersProblems;
};
```

### 4.6. Funkcja setCurrentCompleted()
```jsx
const setCurrentCompleted = (newSet) => {
  // ... istniejące warunki
  } else if (mode === 'homographic-functions') {
    setCompletedHomographicFunctionsProblems(newSet);
  } else {
    setCompletedPowersProblems(newSet);
  }
};
```

### 4.7. Funkcja getSectionInfo()
```jsx
if (mode === 'homographic-functions') {
  return {
    title: 'Funkcje Homograficzne',
    subtitle: `${problems.length} zadań krok po kroku`
  };
}
```

### 4.8. localStorage - ładowanie danych

**UWAGA:** Jeśli używasz inicjalizacji stanu z localStorage (jak w punkcie 4.3), to **NIE POTRZEBUJESZ** osobnego useEffect do ładowania:

```jsx
// ❌ NIEPOTRZEBNE - jeśli stan jest inicjalizowany z localStorage w useState
useEffect(() => {
  const savedHomographicFunctions = localStorage.getItem('completedHomographicFunctionsProblems');
  if (savedHomographicFunctions) {
    try {
      setCompletedHomographicFunctionsProblems(new Set(JSON.parse(savedHomographicFunctions)));
    } catch (e) {
      console.error('Error loading homographic-functions progress:', e);
    }
  }
}, []);
```

**Zamiast tego** - ładowanie jest już zrobione w useState (punkt 4.3)

### 4.9. localStorage - zapisywanie danych
```jsx
// Save homographic-functions progress
useEffect(() => {
  localStorage.setItem('completedHomographicFunctionsProblems', JSON.stringify([...completedHomographicFunctionsProblems]));
}, [completedHomographicFunctionsProblems]);
```

### 4.10. Renderowanie komponentu
```jsx
return (
  <>
    {currentProblem ? (
      <ProblemView ... />
    ) : mode === 'powers' ? (
      <TrigonometryStartHere ... />
    ) : mode === 'systems-of-equations' ? (
      <SystemsOfEquationsStartHere ... />
    ) : mode === 'homographic-functions' ? (
      // Nowy dział z systemem StartHere
      <HomographicFunctionsStartHere
        problems={problems}
        onSelectProblem={handleSelectProblem}
        completedProblems={getCurrentCompleted()}
        onBack={handleBackToWelcome}
      />
    ) : (
      <ProblemList ... />
    )}
  </>
);
```

---

## **Krok 5: Integracja z NextProblemSuggestion.jsx**

### 5.1. Dodanie zapisywania sugestii
```jsx
// Save suggested problems to localStorage for homographic functions module
if (currentProblem.id && currentProblem.id.includes('homographic')) {
  const suggestedIds = bestMatches.slice(0, 2).map(p => p.id);
  localStorage.setItem('homographic-functions-suggested-problems', JSON.stringify(suggestedIds));
  console.log('Saved suggested problems for homographic functions:', suggestedIds);
}
```

**Uwaga:** Warunek `currentProblem.id.includes('homographic')` oznacza, że ID problemów w JSON powinno zawierać słowo "homographic" dla poprawnego rozpoznania przez system AI.

---

## **Schemat nazewnictwa**

### Pliki i komponenty:
- **Plik danych:** `{nazwa}-problems.json`
- **Komponent StartHere:** `{Nazwa}StartHere.jsx`
- **localStorage klucz (progress):** `completed{Nazwa}Problems`
- **localStorage klucz (suggestions):** `{nazwa}-suggested-problems`
- **localStorage klucz (view state):** `{nazwa}-show-all-problems`

### Zmienne stanu:
- **completed{Nazwa}Problems** - Set ukończonych problemów
- **setCompleted{Nazwa}Problems** - Funkcja ustawiająca stan

### ID problemów:
- Powinno zawierać unikalną frazę dla rozpoznania przez AI (np. "homographic", "trigonometry", "derivative")

---

## **Flow użytkownika**

### Pierwsza wizyta:
1. Użytkownik wybiera nowy dział z ekranu głównego
2. System renderuje komponent `{Nazwa}StartHere`
3. **WAŻNE:** Nad kafelkiem wyświetla się informacja:
   - Nagłówek: "Zacznij tutaj"
   - Opis: "Zacznij od tego zadania, a resztę dobierzemy specjalnie dla Ciebie"
4. Pokazuje się jeden duży kafelek z pierwszym zadaniem
5. Kafelek pulsuje pomarańczowym obramowaniem (animacja CSS)
6. **Widoczne przyciski toggle** pod paskiem postępu: "Sugerowane zadania" i "Wszystkie zadania (X)"

### Rozwiązywanie zadań:
1. Użytkownik klika kafelek i przechodzi do ProblemView
2. Podczas rozwiązywania działa NextProblemSuggestion
3. AI generuje sugestie na podstawie podobieństwa i trudności
4. Sugestie zapisywane do localStorage pod kluczem `{nazwa}-suggested-problems`

### Powrót do działu:
1. System odczytuje sugestie z localStorage
2. Domyślnie pokazuje dwa kafelki z sugerowanymi zadaniami
3. Pierwszy kafelek pulsuje, drugi jest normalny
4. Pasek postępu pokazuje ogólny stan ukończenia
5. **Użytkownik może przełączać widok** między "Sugerowane zadania" a "Wszystkie zadania" używając eleganckich przycisków toggle

---

## **Testowanie implementacji**

### Checklist przed uruchomieniem:
- [ ] Plik JSON utworzony i dostępny
- [ ] Import JSON dodany do WelcomeScreen.jsx i TrigonometryCourse.jsx
- [ ] Moduł dodany do tablicy w WelcomeScreen.jsx (bez `disabled: true`)
- [ ] Komponent StartHere utworzony z właściwymi nazwami
- [ ] **Persystencja widoku zaimplementowana** (localStorage dla showAllProblems)
- [ ] Wszystkie funkcje w TrigonometryCourse.jsx obsługują nowy mode
- [ ] localStorage loading/saving dodane
- [ ] Renderowanie komponentu dodane do return statement
- [ ] NextProblemSuggestion rozpoznaje ID problemów

### Test funkcjonalności:
1. **Ekran główny:** nowy dział widoczny i aktywny
2. **Pierwsza wizyta:** jeden pulsujący kafelek
3. **Rozwiązywanie:** przejście do ProblemView działa
4. **AI sugestie:** zapisywanie do localStorage (sprawdź w DevTools)
5. **Powrót:** dwa kafelki z sugestiami
6. **Postęp:** pasek postępu aktualizuje się poprawnie
7. **Przełączanie widoku:** toggle między "Sugerowane" i "Wszystkie zadania"
8. **Persystencja widoku:** po przejściu do zadania i powrocie widok się zachowuje

---

## **Typowe błędy i rozwiązania**

### Błąd: "Cannot read property 'length' of undefined"
**Przyczyna:** Brak importu pliku JSON lub błędna ścieżka  
**Rozwiązanie:** Sprawdź czy plik JSON istnieje i czy import jest poprawny

### Błąd: Moduł nie pokazuje się na ekranie głównym
**Przyczyna:** Flaga `disabled: true` lub błąd w tablicy modules  
**Rozwiązanie:** Usuń flagę disabled i sprawdź składnię JSON w tablicy

### Błąd: Sugestie AI nie działają
**Przyczyna:** ID problemów nie zawiera unikalnej frazy  
**Rozwiązanie:** Upewnij się że ID zawiera frazę sprawdzaną w NextProblemSuggestion.jsx

### Błąd: "Component is not defined"
**Przyczyna:** Brak importu komponentu StartHere  
**Rozwiązanie:** Dodaj import i sprawdź czy ścieżka jest poprawna

### Błąd: localStorage nie zapisuje postępu
**Przyczyna:** Brak useEffect do zapisywania lub błędna nazwa klucza
**Rozwiązanie:** Dodaj useEffect z poprawną nazwą zmiennej stanu

### Błąd: Widok resetuje się po powrocie z zadania
**Przyczyna:** Brak persystencji stanu showAllProblems lub błędna inicjalizacja
**Rozwiązanie:** Sprawdź inicjalizację stanu z localStorage i useEffect do zapisywania

### Błąd: "Cannot read property of undefined" w localStorage
**Przyczyna:** Błędne parsowanie JSON lub uszkodzone dane w localStorage
**Rozwiązanie:** Dodaj try/catch w inicjalizacji i użyj poprawnego fallback

---

## **Funkcja pomijania zadań (Skip)**

### **Opis funkcji**
System umożliwia użytkownikom pominięcie zadania i automatyczne przejście do następnego sugerowanego przez AI. Jest to szczególnie przydatne gdy użytkownik utknął lub chce spróbować innego zadania.

### **Implementacja w TrigonometryCourse.jsx**

#### **Krok 1: Dodanie funkcji handleSkip**
```jsx
const handleSkip = () => {
  // Track skipped problem
  const skippedProblems = JSON.parse(localStorage.getItem('skipped-problems') || '[]');
  const skipRecord = {
    problemId: currentProblem.id,
    timestamp: Date.now(),
    mode: mode
  };
  skippedProblems.push(skipRecord);

  // Keep only last 100 skipped problems
  if (skippedProblems.length > 100) {
    skippedProblems.shift();
  }
  localStorage.setItem('skipped-problems', JSON.stringify(skippedProblems));

  // Track as a "skip" choice for learning patterns (future AI adaptation)
  const choices = JSON.parse(localStorage.getItem('learning-patterns-choices') || '[]');
  choices.push({
    timestamp: Date.now(),
    problemId: currentProblem.id,
    suggestionType: 'skip',
    currentDifficulty: currentProblem.difficulty || (currentProblem.steps?.length || 0),
    sessionId: sessionStorage.getItem('sessionId') || 'default'
  });
  // Keep only last 50 choices
  if (choices.length > 50) {
    choices.shift();
  }
  localStorage.setItem('learning-patterns-choices', JSON.stringify(choices));

  // Get current problems and completed set
  const currentProblems = getCurrentProblems();
  const currentCompleted = getCurrentCompleted();

  // Get AI suggestions for next problem
  const suggestedProblems = getSuggestedProblemsForModule();

  if (suggestedProblems && suggestedProblems.length > 0) {
    // Select next problem from suggestions
    // Priority: 1. "same" difficulty, 2. first available
    const sameDifficultyProblem = currentProblems.find(p =>
      suggestedProblems.includes(p.id) &&
      !currentCompleted.has(p.id)
    );

    const nextProblem = sameDifficultyProblem ||
      currentProblems.find(p => suggestedProblems.includes(p.id) && !currentCompleted.has(p.id));

    if (nextProblem) {
      setCurrentProblem(nextProblem);
      return;
    }
  }

  // Fallback: find any unfinished problem
  const unfinishedProblems = currentProblems.filter(p => !currentCompleted.has(p.id));
  if (unfinishedProblems.length > 0) {
    // Pick random unfinished problem
    const randomIndex = Math.floor(Math.random() * unfinishedProblems.length);
    setCurrentProblem(unfinishedProblems[randomIndex]);
  } else {
    // No more problems - go back
    setCurrentProblem(null);
  }
};
```

#### **Krok 2: Funkcja pomocnicza do pobierania sugestii AI**
```jsx
const getSuggestedProblemsForModule = () => {
  // Get suggestions from localStorage based on current mode
  let storageKey = '';
  if (mode === 'powers' || currentProblem?.id?.includes('kombinatoryka')) {
    storageKey = 'trigonometry-suggested-problems';
  } else if (mode === 'homographic-functions') {
    storageKey = 'homographic-functions-suggested-problems';
  } else if (mode === 'elementary-fractions') {
    storageKey = 'elementary-fractions-suggested-problems';
  } else if (mode === 'systems-of-equations') {
    storageKey = 'systems-of-equations-suggested-problems';
  }

  if (storageKey) {
    const suggested = localStorage.getItem(storageKey);
    if (suggested) {
      try {
        return JSON.parse(suggested);
      } catch (e) {
        console.error('Error parsing suggested problems:', e);
      }
    }
  }
  return null;
};
```

#### **Krok 3: Przekazanie handleSkip do ProblemView**
```jsx
<ProblemView
  problem={currentProblem}
  onBack={handleBack}
  onComplete={handleComplete}
  onSelectProblem={handleSelectProblem}
  onSkip={handleSkip}  // Dodaj tę linię
  completedProblems={getCurrentCompleted()}
  problems={problems}
/>
```

### **Implementacja w ProblemView.jsx**

#### **Krok 1: Dodanie parametru onSkip**
```jsx
const ProblemView = ({
  problem,
  onBack,
  onComplete,
  onSelectProblem,
  onSkip,  // Nowy parametr
  completedProblems = new Set(),
  problems = []
}) => {
```

#### **Krok 2: Dodanie przycisku "Pomiń zadanie"**
```jsx
{/* Back Button and Skip Button */}
<div className="mb-4 flex items-center justify-between">
  <button
    onClick={onBack}
    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-6-6 6-6" />
    </svg>
    Zadania
  </button>
  {onSkip && !showSolution && (
    <button
      onClick={onSkip}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
    >
      Pomiń zadanie
      <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l6 6-6 6" />
      </svg>
    </button>
  )}
</div>
```

### **Integracja z systemem uczenia (NextProblemSuggestion.jsx)**

#### **Tracking wyboru użytkownika**
```jsx
const handleSuggestionClick = (problem, suggestionType = null) => {
  if (problem && onSelectProblem) {
    // Track choice for learning patterns
    if (suggestionType) {
      const choices = JSON.parse(localStorage.getItem('learning-patterns-choices') || '[]');
      choices.push({
        timestamp: Date.now(),
        problemId: problem.id,
        suggestionType: suggestionType, // 'easy', 'same', or 'hard'
        currentDifficulty: problem.estimatedDifficulty || problem.difficulty || (problem.steps?.length || 0),
        sessionId: sessionStorage.getItem('sessionId') || 'default'
      });
      // Keep only last 50 choices
      if (choices.length > 50) {
        choices.shift();
      }
      localStorage.setItem('learning-patterns-choices', JSON.stringify(choices));
      console.log(`Tracked choice: ${suggestionType} for problem ${problem.id}`);
    }
    onSelectProblem(problem);
  }
};
```

### **LocalStorage struktura**

#### **skipped-problems**
Przechowuje historię pominiętych zadań (max 100):
```json
[
  {
    "problemId": "tex_problem_123",
    "timestamp": 1694857200000,
    "mode": "powers"
  }
]
```

#### **learning-patterns-choices**
Trackuje wszystkie wybory użytkownika dla adaptacyjnego AI (max 50):
```json
[
  {
    "timestamp": 1694857200000,
    "problemId": "tex_problem_123",
    "suggestionType": "skip",  // lub "easy", "same", "hard"
    "currentDifficulty": 3,
    "sessionId": "lm2x9k"
  }
]
```

### **Flow działania**

1. **Użytkownik klika "Pomiń zadanie"**
   - Zadanie zapisywane jako pominięte
   - Choice trackowane jako typ "skip" dla AI

2. **System szuka następnego zadania**
   - Priorytet 1: Sugestie AI z localStorage (`{module}-suggested-problems`)
   - Priorytet 2: Zadanie o tej samej trudności z sugestii
   - Priorytet 3: Dowolne zadanie z sugestii
   - Fallback: Losowe nieukończone zadanie

3. **Automatyczne przejście**
   - Nowe zadanie ładowane bez powrotu do listy
   - Użytkownik kontynuuje naukę bez przerwy

### **Zalety implementacji**

✅ **Bezstresowa nauka** - użytkownik może pominąć trudne zadania
✅ **Inteligentny wybór** - AI sugeruje najlepsze następne zadanie
✅ **Tracking dla adaptacji** - system uczy się z pominięć
✅ **Płynny flow** - brak powrotu do listy, natychmiastowe następne zadanie
✅ **Fallback** - zawsze znajdzie zadanie, nawet bez sugestii AI

---

## **WAŻNE: Sekcja "Twoje zadania" - NIE IMPLEMENTUJ**

### **Dlaczego NIE używamy sekcji "Twoje zadania"**

Wcześniej niektóre moduły miały sekcję "Twoje zadania" pokazującą ostatnio rozwiązane zadania w zielonych kartach. **To rozwiązanie zostało usunięte jako redundantne.**

### **Powody usunięcia:**

❌ **Redundancja** - ukończone zadania są już widoczne w zakładce "Wszystkie zadania" z zielonym podświetleniem
❌ **Niepotrzebna nawigacja** - użytkownik musi scrollować przez dodatkową sekcję
❌ **Duplikacja informacji** - te same zadania w dwóch miejscach
❌ **Zaśmiecony interfejs** - dodatkowe elementy bez wartości dodanej

### **Nowe podejście SOTA:**

✅ **Jedna zakładka "Wszystkie zadania"** pokazuje pełną listę z:
- Zielonym podświetleniem dla ukończonych zadań
- Checkmark "✓ Ukończone" przy każdym rozwiązanym zadaniu
- Możliwość ponownego otwarcia i przejrzenia rozwiązania

✅ **Przycisk toggle** umożliwia przełączanie między:
- "Sugerowane zadania" (AI-driven selection)
- "Wszystkie zadania (X)" (kompletna lista)

### **Implementacja:**

**NIE DODAWAJ** tego kodu do swojego komponentu StartHere:
```jsx
// ❌ TEGO NIE RÓB - stary, przestarzały kod
{completedProblems.size > 0 && !showAllProblems && (
  <div className="mt-12 px-4 md:px-8">
    <h3>Twoje zadania</h3>
    {/* ... sekcja z zielonymi kartami ... */}
  </div>
)}
```

**ZAMIAST TEGO** użyj tylko zakładki "Wszystkie zadania" która już pokazuje ukończone zadania z zielonym stylem.

---

## **Automatyczne odsłanianie ukończonych zadań w ProblemView**

### **Funkcjonalność**

Gdy użytkownik kliknie w **ukończone zadanie** z listy "Wszystkie zadania", zadanie powinno się **automatycznie pokazać w pełni odsłonięte** (widok "solution") zamiast zaczynać od początku.

### **Implementacja w ProblemView.jsx**

#### **Problem:**
Domyślnie, gdy użytkownik otwiera zadanie, wszystkie kroki są ukryte i trzeba je klikać, aby odsłonić hinty i wyjaśnienia. To działa dobrze dla nowych zadań, ale dla **ukończonych zadań** powinniśmy pokazać wszystko od razu.

#### **Rozwiązanie:**

Dodaj logikę sprawdzającą czy zadanie jest ukończone w useEffect resetującym stan UI:

```jsx
// Reset all UI states when problem changes
useEffect(() => {
  // Check if this problem is already completed
  const isCompleted = completedProblems.has(problem.id);

  if (isCompleted) {
    // If completed, reveal all steps and show solution view
    const allStepIndices = new Set(problem.steps.map((_, index) => index));
    setRevealedSteps(allStepIndices);
    setCompletedSteps(allStepIndices);
    setHintShownSteps(allStepIndices);
    setShowSolution(true); // Show the completed "solution" view
    setExpandedWhy(new Set());
    setShowStatementExplanation(false);
    setCompletedInteractiveChoices(allStepIndices);
    setShowMultiStepSteps(new Set());
    setEnlargedImage(null);
    solveDurationRef.current = null;
  } else {
    // If not completed, reset to initial state
    setRevealedSteps(new Set());
    setCompletedSteps(new Set());
    setHintShownSteps(new Set());
    setShowSolution(false);
    setExpandedWhy(new Set());
    setShowStatementExplanation(false);
    setCompletedInteractiveChoices(new Set());
    setShowMultiStepSteps(new Set());
    setEnlargedImage(null);
    solveDurationRef.current = null;
  }

  // Scroll to top when opening a new problem
  window.scrollTo(0, 0);
}, [problem.id]);
```

#### **Kluczowe elementy:**

1. **Sprawdzenie stanu:** `const isCompleted = completedProblems.has(problem.id);`
2. **Dla ukończonych:** Wszystkie Set są wypełnione wszystkimi indeksami kroków
3. **`showSolution = true`:** Włącza widok "solution" - maksymalnie prosty, czysty layout
4. **Dla nieukończonych:** Normalne resetowanie (puste Sety)

#### **SOTA: Widok Solution - Maksymalna Prostota**

**Filozofia:** "Geniusz tkwi w prostocie"

Widok solution dla ukończonych zadań pokazuje **TYLKO**:
- **Expression** (rozwiązanie matematyczne)
- **Explanation** (wyjaśnienie)

**BEZ:**
- ❌ Hint
- ❌ "Dlaczego?" sekcji
- ❌ Obrazków
- ❌ Żółtych boxów
- ❌ Efektów glow
- ❌ Niepotrzebnych borderów

**Implementacja layoutu:**

```jsx
{/* Completed View - Pure Simplicity: tylko expression i explanation */}
{showSolution ? (
  <div className="space-y-6">
    {problem.steps?.map((step, index) => (
      <div key={index} className="relative pl-10">
        {/* Minimal step indicator */}
        <div className="absolute left-0 top-0 text-sm font-mono text-stone-400">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Step content - tylko expression i explanation */}
        <div className="space-y-2">
          {step.expression && (
            <div className="text-xl md:text-2xl text-stone-900">
              <MathRenderer content={step.expression} />
            </div>
          )}

          {step.explanation && (
            <div className="text-stone-600 leading-relaxed">
              <MathRenderer content={step.explanation} />
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  /* Interactive Steps View (original) */
  ...
)}
```

**Cechy layoutu:**
- Numeracja kroków: `01`, `02`, `03`... (monospace, szary)
- Expression: duża czcionka (xl/2xl), ciemna (stone-900)
- Explanation: normalna czcionka, szara (stone-600)
- Brak borderów, boxów, efektów wizualnych
- Maksymalna czytelność i prostota

#### **Efekt:**

✅ **Ukończone zadania** - czysty widok z expression + explanation
✅ **Nowe zadania** - interaktywny widok z klikaniem kroków
✅ **Maksymalna czytelność** - zero visual noise, tylko treść
✅ **Spójność z filozofią** - "Geniusz tkwi w prostocie"

---

## **Podsumowanie**

System StartHere oparty na implementacji SOTA (RationalEquationsWordProblemsStartHere) zapewnia najlepsze doświadczenie użytkownika w całej aplikacji. Dzięki temu procesowi można łatwo dodawać nowe działy z zachowaniem wszystkich funkcjonalności:

- ✅ **Inteligentna nawigacja** - 1 kafelek → 2 kafelki z AI
- ✅ **Widoczne przyciski toggle** - eleganckie przełączanie między widokami
- ✅ **Postęp użytkownika** - localStorage tracking
- ✅ **Sugestie AI** - personalizacja na podstawie podobieństwa
- ✅ **Czysty, intuicyjny design** - brak ukrytych funkcji, wszystko widoczne
- ✅ **Spójny UI/UX** - identyczny wygląd we wszystkich działach
- ✅ **Animacje** - pulsowanie, gradienty, efekty cienia, hover effects
- ✅ **Automatyczne odsłanianie ukończonych zadań** - pełny widok solution dla zadań rozwiązanych
- ✅ **Brak redundancji** - żadnych duplikowanych sekcji "Twoje zadania"
- ✅ **Maksymalna prostota widoku solution** - tylko expression + explanation, zero visual noise
- ✅ **Persystencja z localStorage w useState** - natychmiastowe ładowanie bez opóźnień

**Czas implementacji:** ~15-20 minut dla doświadczonego programisty
**Pliki do modyfikacji:** 4 pliki (WelcomeScreen, TrigonometryCourse, NextProblemSuggestion + nowy komponent)
**Nowe pliki:** 2 (JSON data + komponent StartHere)