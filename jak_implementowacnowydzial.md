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