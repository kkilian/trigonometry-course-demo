# Kompleksowa analiza aplikacji edukacyjnej do nauki matematyki

## Kontekst biznesowy
Rozwijamy interaktywną platformę e-learningową do nauki matematyki (trygonometria, ciągi, wielomiany) dla uczniów szkół średnich w Polsce. Aplikacja jest w fazie proof-of-concept jako demo. Planujemy skalować do 10,000+ użytkowników.

## Stack technologiczny
- **Frontend**: React 19.1.1, Create React App 5.0.1
- **Styling**: Tailwind CSS 3.4.17
- **Math Rendering**: KaTeX 0.16.22 via react-katex
- **State Management**: React hooks + localStorage
- **Deployment**: Vercel (static hosting)
- **Bundle size**: ~350KB gzipped

## Architektura aplikacji

### Struktura komponentów
```
TrigonometryCourse (główny kontroler)
├── WelcomeScreen (menu wyboru kursu)
├── ProblemList (lista zadań z postępem)
├── ProblemView (widok pojedynczego zadania)
│   ├── Krokowe odkrywanie rozwiązania (3-click pattern)
│   └── NextProblemSuggestion (system sugestii następnego zadania)
├── TrigonometryQuiz (tryb egzaminu)
│   └── StudentReport (analiza wyników)
├── MathRenderer (parser LaTeX z cache LRU)
├── LaTeXChecker (narzędzie do sprawdzania renderowania)
├── SolutionReviewer (narzędzie do przeglądu rozwiązań)
└── QuizSelector (przełącznik trybu nauki/quiz)
```

### Kluczowe funkcjonalności
1. **314 zadań matematycznych** w 4 kursach:
   - Trygonometria: 174 zadania
   - Ciągi - wprowadzenie: 48 zadań  
   - Ciągi geometryczne: 34 zadania
   - Wielomiany: 58 zadań
2. **Progressive revelation pattern** - użytkownik odkrywa rozwiązanie krok po kroku (hint → wyrażenie → wyjaśnienie)
3. **System quizów** - 93 pytania testowe z automatycznym generowaniem 10-pytaniowych testów
4. **Persystencja postępu** - localStorage dla każdego kursu osobno
5. **Narzędzia deweloperskie** - LaTeX checker, solution reviewer, tag reviewer
6. **Komponenty dodatkowe** - FeedbackModal (obecnie nieużywany), system tagowania zadań

### Szczegóły implementacji

#### MathRenderer.jsx
- **Problem**: Używamy regex `/\$([^$]+)\$/g` do parsowania LaTeX - może być wolne przy dużych tekstach
- **Cache**: LRU cache z limitem 100 elementów (Map) - czy to wystarczy?
- **Mixed content**: Obsługa tekstu z matematyką inline
- **Error handling**: Fallback do plain text gdy KaTeX zawiedzie

#### ProblemView.jsx
- **Stan**: 3 Set() dla śledzenia kroków (revealed, completed, hintShown)
- **Timer**: useRef do śledzenia czasu rozwiązywania
- **Progress bar**: Wizualne śledzenie postępu zadania
- **Problem**: Reset stanu przy zmianie zadania używa useEffect - czy to optymalne?

#### Data struktura (JSON)
```json
{
  "id": "unique_id",
  "topic": "nazwa_tematu",
  "statement": "Treść zadania z $LaTeX$",
  "steps": [
    {
      "hint": "Opcjonalna podpowiedź",
      "expression": "$wyrażenie$",
      "explanation": "Wyjaśnienie kroku"
    }
  ],
  "solutions": ["Rozwiązanie końcowe"]
}
```

## Zidentyfikowane problemy

### 1. Wydajność
- **Bundle size**: 350KB może być za duży dla mobile
- **React 19.1.1**: Bleeding edge - czy stabilny dla produkcji?
- **Brak code splitting**: Wszystkie kursy ładują się na raz
- **localStorage limits**: Co gdy użytkownik rozwiąże tysiące zadań?
- **Cache overflow**: LRU cache ma sztywny limit 100 elementów

### 2. Skalowalność
- **Brak backend**: Wszystkie dane w JSON lokalnie - jak synchronizować postęp między urządzeniami?
- **Brak użytkowników**: Jak dodać system logowania i profili?
- **Analytics**: Brak śledzenia jak użytkownicy korzystają z aplikacji
- **A/B testing**: Nie możemy testować różnych wersji UI

### 3. UX/UI
- **Mobile experience**: Czy Tailwind responsive classes wystarczą?
- **Accessibility**: Brak ARIA labels, keyboard navigation
- **PWA**: Aplikacja nie działa offline mimo że mogłaby
- **Feedback**: Usunięty modal po ukończeniu zadania - użytkownicy nie wiedzą że skończyli

### 4. Kod
- **TypeScript**: Brak typowania - trudniej refaktoryzować
- **Testing**: Zero testów jednostkowych i integracyjnych
- **Error boundaries**: Brak - jeden błąd może zcrashować całą apkę
- **Memoization**: useMemo tylko w niektórych miejscach

### 5. Architektura
- **State management**: Prop drilling przez 3+ poziomy komponentów
- **API ready**: Jak migrować z JSON do REST/GraphQL?
- **Caching strategy**: Tylko client-side, brak Service Worker
- **SEO**: Create React App = słabe SEO, może Next.js?

## Pytania do GPT-5

### Strategiczne
1. **Migracja na Next.js 15** - czy warto dla SSR/SSG i lepszego SEO? Jakie są trade-offy?
2. **Micro-frontends** - czy rozbić apkę na osobne kursy jako niezależne aplikacje?
3. **Backend architecture** - Supabase vs własne API (Node/Python)? Jak projektować dla 10k+ użytkowników?
4. **Monetyzacja** - Freemium vs subscription? Jak techniczne ograniczenia wpłyną na model biznesowy?

### Techniczne
1. **React 19.1.1 stability** - czy używać w produkcji czy downgrade do 18.x?
2. **Math rendering optimization** - WebGL dla skomplikowanych równań? Wasm dla parsowania?
3. **State management** - Zustand vs Redux Toolkit vs Jotai dla tej skali?
4. **Real-time collaboration** - Jak dodać wspólne rozwiązywanie zadań (WebRTC vs WebSockets)?
5. **AI integration** - Gdzie i jak wykorzystać LLM do personalizacji nauki?

### Performance
1. **Code splitting strategy** - Per route czy per course? Lazy loading matematyki?
2. **Caching** - IndexedDB vs Cache API? Jak cache'ować 234 zadania efektywnie?
3. **Bundle optimization** - Module federation? Vite zamiast CRA?
4. **Mobile performance** - React Native czy PWA? Jak optymalizować dla słabych telefonów?

### UX/Features
1. **Gamification** - Punkty, achievements, leaderboard - overengineering czy must-have?
2. **Spaced repetition** - Jak implementować algorytm powtórek (Anki-style)?
3. **Adaptive learning** - ML model do dostosowania trudności czy prosty rule-based?
4. **Social features** - Forum, grupy nauki - MVP czy czekać na skalę?

### DevOps/Maintenance
1. **CI/CD pipeline** - GitHub Actions + Vercel wystarcza czy potrzeba więcej?
2. **Monitoring** - Sentry + Vercel Analytics czy full Datadog?
3. **A/B testing** - Feature flags (LaunchDarkly) czy własne rozwiązanie?
4. **Database** - PostgreSQL + Prisma czy NoSQL dla flexibility?

## Metryki sukcesu
- Chcemy osiągnąć <100ms Time to Interactive na 4G
- 95%+ użytkowników kończy przynajmniej jedno zadanie
- <1% crash rate
- Możliwość obsłużenia 1000 równoczesnych użytkowników

## Konkretne pytanie
**Mając powyższy kontekst, co robimy źle architektonicznie i jak powinniśmy zrefaktoryzować aplikację, aby:**
1. Skalowała się do 10,000+ użytkowników
2. Była łatwa w utrzymaniu przez 3-osobowy zespół
3. Umożliwiała szybkie dodawanie nowych features
4. Działała płynnie na urządzeniach mobilnych
5. Pozwalała na monetyzację (premium features)

**Proszę o:**
- Ranking TOP 5 najpilniejszych zmian
- Roadmapę migracji (co można zrobić iteracyjnie)
- Antywzorce które stosujemy nieświadomie
- Alternatywne podejścia które pominęliśmy
- Estymację czasową głównych refaktoringów