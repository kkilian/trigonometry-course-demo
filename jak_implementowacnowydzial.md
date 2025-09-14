# Jak zaimplementować nowy dział z systemem StartHere

## Wstęp

Ten dokument opisuje proces dodawania nowego działu do aplikacji z wykorzystaniem systemu "StartHere" znanego z działu Trygonometria. System ten zapewnia inteligentną nawigację - pokazuje jeden kafelek przy pierwszej wizycie, a później dwa kafelki z zadaniami sugerowanymi przez AI.

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
Skopiuj `TrigonometryStartHere.jsx` i zmień:

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
```

**Uwaga:** Wszystkie pozostałe elementy (logika, stylowanie, animacje) pozostają identyczne jak w TrigonometryStartHere.jsx.

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
```jsx
const [completedHomographicFunctionsProblems, setCompletedHomographicFunctionsProblems] = useState(new Set());
```

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
```jsx
useEffect(() => {
  // ... istniejące ładowanie danych
  
  // Load homographic-functions progress
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

### Rozwiązywanie zadań:
1. Użytkownik klika kafelek i przechodzi do ProblemView
2. Podczas rozwiązywania działa NextProblemSuggestion
3. AI generuje sugestie na podstawie podobieństwa i trudności
4. Sugestie zapisywane do localStorage pod kluczem `{nazwa}-suggested-problems`

### Powrót do działu:
1. System odczytuje sugestie z localStorage
2. Pokazuje dwa kafelki z sugerowanymi zadaniami
3. Pierwszy kafelek pulsuje, drugi jest normalny
4. Pasek postępu pokazuje ogólny stan ukończenia

---

## **Testowanie implementacji**

### Checklist przed uruchomieniem:
- [ ] Plik JSON utworzony i dostępny
- [ ] Import JSON dodany do WelcomeScreen.jsx i TrigonometryCourse.jsx  
- [ ] Moduł dodany do tablicy w WelcomeScreen.jsx (bez `disabled: true`)
- [ ] Komponent StartHere utworzony z właściwymi nazwami
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

---

## **Dodatek: Lista zadań z kropką (opcjonalne)**

### **Opis funkcji**
Subtelna kropka obok paska postępu pozwala użytkownikom przełączyć się na widok wszystkich zadań. Jest to ukryta funkcjonalność dla zaawansowanych użytkowników, która nie rozprasza początkujących.

### **Implementacja w komponencie StartHere**

#### **Krok 1: Dodanie stanu**
```jsx
const [showAllProblems, setShowAllProblems] = useState(false);
```

#### **Krok 2: Modyfikacja paska postępu**
W sekcji progress bar, zamień:
```jsx
<div className="flex justify-between items-center text-sm text-stone-600">
  <span>Postęp</span>
  <span>{completedProblems.size} z {problems.length} zadań</span>
</div>
```

Na:
```jsx
<div className="flex justify-between items-center text-sm text-stone-600">
  <span>Postęp</span>
  <div className="flex items-center gap-4">
    <span>{completedProblems.size} z {problems.length} zadań</span>
    <button
      onClick={() => setShowAllProblems(!showAllProblems)}
      className="w-2 h-2 rounded-full bg-stone-400 hover:bg-stone-600 transition-colors opacity-40 hover:opacity-100"
      title={showAllProblems ? 'Ukryj listę' : 'Pokaż wszystkie zadania'}
    >
    </button>
  </div>
</div>
```

#### **Krok 3: Widok wszystkich zadań**
Zastąp główną sekcję renderowania z:
```jsx
{/* Display problems based on user progress */}
{problemsToShow.length === 1 ? (
  // Existing single problem logic...
) : (
  // Existing suggested problems logic...
)}
```

Na:
```jsx
{showAllProblems ? (
  // All problems list view
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-2">Wszystkie zadania</h3>
      <p className="text-stone-600 text-sm">
        Wybierz dowolne zadanie z pełnej listy ({problems.length} zadań)
      </p>
    </div>
    <div className="space-y-3 px-4 md:px-8">
      {problems.map((problem, index) => (
        <button
          key={problem.id}
          onClick={() => handleStartProblem(problem)}
          className={`w-full text-left p-4 md:p-6 rounded-lg transition-all group relative ${
            completedProblems.has(problem.id)
              ? 'bg-green-50 border border-green-200 hover:border-green-300'
              : 'bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded">
                  #{index + 1}
                </span>
                {problem.topic && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {problem.topic}
                  </span>
                )}
                {completedProblems.has(problem.id) && (
                  <div className="flex items-center gap-1 text-green-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Ukończone</span>
                  </div>
                )}
              </div>
              <div className="text-stone-900 text-sm md:text-base leading-relaxed">
                <MathRenderer content={problem.statement || ''} />
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
              <div className="bg-stone-100 px-2 py-1 rounded-full">
                <span className="text-xs text-stone-600">
                  {problem.steps?.length || 0} kroków
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-all">
                <svg className="w-3 h-3 text-stone-600 group-hover:text-stone-700 transition-colors" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 5l6 5-6 5" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
) : (
  // Existing logic wrapped in fragment
  <>
    {problemsToShow.length === 1 ? (
      // Existing single problem logic...
    ) : (
      // Existing suggested problems logic...
    )}
  </>
)}
```

### **Charakterystyka designu**

#### **Kropka trigger:**
- **Rozmiar:** 8px × 8px (`w-2 h-2`)
- **Kolor:** Szary z przezroczystością 40%
- **Hover:** Ciemniejszy i pełna nieprzezroczystość
- **Pozycja:** Obok licznika postępu
- **Tooltip:** Informacyjny tekst po najechaniu

#### **Lista wszystkich zadań:**
- **Layout:** Kompaktowe karty 4-6px padding
- **Numeracja:** `#{index + 1}` w mono font
- **Status:** Zielone tło dla ukończonych
- **Responsywność:** Zmniejszone elementy na mobile
- **Badge:** Zachowane topic badges z danymi

### **Zalety implementacji**

✅ **Subtelność** - Nie rozprasza nowych użytkowników
✅ **Discovery** - Zaawansowani znajdą funkcję naturalnie
✅ **Szybkość** - Natychmiastowy dostęp do dowolnego zadania
✅ **Status** - Widoczny postęp na liście wszystkich zadań
✅ **Spójność** - Identyczny design we wszystkich modułach

### **Uwagi implementacyjne**
- Funkcja jest **opcjonalna** - można pominąć przy prostszych działach
- Stan `showAllProblems` resetuje się przy każdym wejściu do działu
- Lista renderuje wszystkie problemy - uwzględnij wydajność przy >500 zadań
- Tooltip zapewnia accessibility dla screen readerów

---

## **Podsumowanie**

System StartHere zapewnia spójne, inteligentne doświadczenie użytkownika w całej aplikacji. Dzięki temu procesowi można łatwo dodawać nowe działy z zachowaniem wszystkich funkcjonalności:

- ✅ **Inteligentna nawigacja** - 1 kafelek → 2 kafelki z AI
- ✅ **Postęp użytkownika** - localStorage tracking
- ✅ **Sugestie AI** - personalizacja na podstawie podobieństwa
- ✅ **Spójny design** - identyczny UI/UX we wszystkich działach
- ✅ **Animacje** - pulsowanie, gradienty, hover effects

**Czas implementacji:** ~15-20 minut dla doświadczonego programisty  
**Pliki do modyfikacji:** 4 pliki (WelcomeScreen, TrigonometryCourse, NextProblemSuggestion + nowy komponent)  
**Nowe pliki:** 2 (JSON data + komponent StartHere)