# Renderowanie Matematyki - Dokumentacja Techniczna

## 📋 Spis Treści
1. [Podsumowanie](#podsumowanie)
2. [Architektura Rozwiązania](#architektura-rozwiązania)
3. [Format Danych](#format-danych)
4. [Komponenty](#komponenty)
5. [Proces Migracji](#proces-migracji)
6. [Porównanie Rozwiązań](#porównanie-rozwiązań)
7. [Instrukcja Użycia](#instrukcja-użycia)

## Podsumowanie

System renderowania matematyki w aplikacji edukacyjnej został całkowicie przeprojektowany, przechodząc z dynamicznego ładowania KaTeX na statyczną integrację React-KaTeX. Rezultatem jest **58% redukcja kodu** i znaczne uproszczenie architektury.

### Kluczowe Osiągnięcia
- **Redukcja kodu**: z 403 do 171 linii (232 linie mniej)
- **Unifikacja formatu**: jeden format `$...$` zamiast czterech
- **Wydajność**: komponenty React zamiast manipulacji DOM
- **Łatwość utrzymania**: prostsza logika parsowania

## Architektura Rozwiązania

### Stos Technologiczny
```
React 19.1.1
├── react-katex 3.1.0
│   └── katex 0.16.x (dependency)
├── Tailwind CSS 3.4.17
└── Create React App 5.0.1
```

### Przepływ Renderowania
```
Dane JSON ($...$) 
    ↓
MathRenderer.jsx (parser)
    ↓
React-KaTeX (InlineMath/BlockMath)
    ↓
Wyrenderowany HTML z KaTeX
```

## Format Danych

### Struktura JSON
```json
{
  "id": "problem_1",
  "topic": "Trygonometria",
  "statement": "Rozwiąż równanie $\\sin x = \\frac{1}{2}$ dla $x \\in [0, 2\\pi]$",
  "steps": [
    {
      "step": 1,
      "hint": "Gdzie sinus przyjmuje wartość $\\frac{1}{2}$?",
      "expression": "$x = \\frac{\\pi}{6}$ lub $x = \\frac{5\\pi}{6}$",
      "explanation": "Sinus równa się $\\frac{1}{2}$ dla kątów $30°$ i $150°$"
    }
  ],
  "solutions": ["$x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}$"]
}
```

### Konwencje
- **Matematyka**: zawsze w `$...$`
- **Tekst polski**: pisany bezpośrednio (bez `\text{}`)
- **Mieszana zawartość**: obsługiwana automatycznie przez parser

## Komponenty

### MathRenderer.jsx (171 linii)
Główny komponent odpowiedzialny za parsowanie i renderowanie mieszanej zawartości tekst/matematyka.

```jsx
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ content, className = '' }) => {
  const segments = parseLatexText(content);
  
  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        } else {
          return <InlineMath key={index} math={segment.content} />;
        }
      })}
    </span>
  );
};
```

### Funkcja Parsująca
```javascript
const parseLatexText = (text) => {
  const segments = [];
  const mathDelimiterRegex = /\$([^$]+)\$/g;
  let currentIndex = 0;
  let match;
  
  while ((match = mathDelimiterRegex.exec(text)) !== null) {
    // Dodaj tekst przed matematyką
    if (currentIndex < match.index) {
      segments.push({ 
        type: 'text', 
        content: text.slice(currentIndex, match.index) 
      });
    }
    
    // Dodaj matematykę
    segments.push({ 
      type: 'math', 
      content: match[1] 
    });
    
    currentIndex = match.index + match[0].length;
  }
  
  // Dodaj pozostały tekst
  if (currentIndex < text.length) {
    segments.push({ 
      type: 'text', 
      content: text.slice(currentIndex) 
    });
  }
  
  return segments;
};
```

### Użycie w Komponentach
```jsx
// ProblemView.jsx
<MathRenderer content={problem.statement} />
<MathRenderer content={step.hint} />
<MathRenderer content={step.expression} />
<MathRenderer content={step.explanation} />

// ProblemList.jsx
<MathRenderer content={problem.statement} />

// TrigonometryQuiz.jsx
<MathRenderer content={question.content} />
```

## Proces Migracji

### Fazy Wykonania

#### FAZA 0: Przygotowanie
- Utworzenie struktury `src/data/migration/`
- Analiza istniejącego kodu

#### FAZA 1: Backup
- Automatyczne kopie wszystkich plików JSON
- Format: `filename.backup-YYYY-MM-DDTHH-mm-ss.json`

#### FAZA 2: Konwersja Danych
- **175 zadań** z trygonometrii
- **93 zadania** z wielomianów
- Konwersja `\text{Polski tekst}` → `Polski tekst`
- Zachowanie `$matematyka$`

#### FAZA 3: Aktualizacja Komponentów
- Usunięcie obsługi `\text{}`, `\(...\)`, display mode
- Uproszczenie logiki parsowania
- Redukcja kodu o 232 linie

#### FAZA 4: Integracja React-KaTeX
```bash
npm install react-katex@3.1.0
```
- Import stylów KaTeX
- Zastąpienie dynamicznego ładowania

#### FAZA 5: Testowanie
- Testy Puppeteer
- Weryfikacja renderowania wszystkich problemów
- Naprawa błędów (MathExpression → MathRenderer)

### Narzędzia Migracji

#### convert-helpers.js
```javascript
function removeTextWrapper(text) {
  // Usuwa \text{} zachowując zawartość
  return text.replace(/\\text\{([^}]*)\}/g, '$1');
}

function wrapMathInDollars(text) {
  // Identyfikuje matematykę i otacza $...$
  // Obsługuje \sin, \cos, \frac, itp.
}

function cleanupSpaces(text) {
  // Czyści nadmiarowe spacje
  return text.replace(/\s+/g, ' ').trim();
}
```

#### convert-all-problems.js
- Konwertuje wszystkie pliki JSON
- Tworzy backupy
- Waliduje wyniki

## Porównanie Rozwiązań

### Stare Rozwiązanie (403 linie)
```javascript
// Obsługa 4 formatów
const patterns = [
  /\\text\{([^}]*)\}/g,      // \text{}
  /\$([^$]+)\$/g,            // $...$
  /\\\(([^)]+)\\\)/g,        // \(...\)
  /\\\[([^]]+)\\\]/g         // Display mode
];

// Dynamiczne ładowanie
if (!window.katex) {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
  // ... obsługa ładowania
}

// Manipulacja DOM
const span = document.createElement('span');
katex.render(math, span);
container.appendChild(span);
```

### Nowe Rozwiązanie (171 linii)
```javascript
// Jeden format
const mathDelimiterRegex = /\$([^$]+)\$/g;

// Import statyczny
import { InlineMath } from 'react-katex';

// Komponenty React
<InlineMath math={segment.content} />
```

### Metryki

| Aspekt | Stare | Nowe | Poprawa |
|--------|-------|------|---------|
| Linie kodu | 403 | 171 | -58% |
| Formaty LaTeX | 4 | 1 | -75% |
| Złożoność cyklomatyczna | Wysoka | Niska | ⬇️ |
| Bundle size | +100KB (CDN) | +50KB | -50% |
| Czas ładowania | Dynamiczny | Instant | ⚡ |
| Testowalność | Trudna | Łatwa | ⬆️ |

## Instrukcja Użycia

### Dla Developerów

#### Dodawanie Nowego Problemu
```json
{
  "statement": "Oblicz $\\sin(45°)$",
  "steps": [{
    "hint": "Pamiętasz wartości dla kątów charakterystycznych?",
    "expression": "$\\sin(45°) = \\frac{\\sqrt{2}}{2}$",
    "explanation": "Kąt $45°$ to połowa kąta prostego"
  }]
}
```

#### Testowanie Renderowania
```bash
# Uruchom aplikację
npm start

# Uruchom test Puppeteer
node test-rendering.js

# Sprawdź format danych
node src/data/migration/test-new-format.js
```

### Dla Content Creators

#### Zasady Formatowania
1. **Matematyka** - zawsze w dolarach: `$x^2 + y^2 = r^2$`
2. **Polski tekst** - pisz normalnie: `Oblicz pole koła`
3. **Mieszane** - łącz naturalnie: `Promień $r = 5$ cm`

#### Przykłady Poprawnego Formatowania
✅ **Dobrze:**
```
"Rozwiąż równanie $x^2 - 4 = 0$ dla $x > 0$"
"Sinus kąta $\\alpha$ wynosi $\\frac{1}{2}$"
```

❌ **Źle:**
```
"\\text{Rozwiąż równanie} x^2 - 4 = 0"
"Sinus kąta \\alpha wynosi \\frac{1}{2}"
```

### Rozwiązywanie Problemów

#### Problem: Matematyka nie renderuje się
1. Sprawdź czy używasz `$...$`
2. Upewnij się że backslashe są podwójne w JSON: `\\frac`
3. Zweryfikuj czy komponent używa `MathRenderer`

#### Problem: Błąd KaTeX
1. Sprawdź poprawność składni LaTeX
2. Niektóre komendy wymagają pakietów (np. `\cancel`)
3. Zobacz konsolę przeglądarki dla szczegółów

## Podsumowanie

Migracja na React-KaTeX przyniosła znaczące korzyści:
- **Prostszy kod** - łatwiejszy w utrzymaniu
- **Lepsza wydajność** - brak dynamicznego ładowania
- **Jednolity format** - mniej błędów
- **React-owy sposób** - zgodny z ekosystemem

System jest teraz gotowy do łatwego rozszerzania i utrzymania, zachowując pełną funkcjonalność renderowania matematycznego.