# Jak przekształcić zadanie na format z polem quiz

## Typy zadań do przekształcenia

### 1. Zadania typu ABCD (wielokrotny wybór)
**Przed:**
```json
"statement": "Liczba $\\frac{1}{3}\\log_5 125 - 3\\log_{125} \\frac{1}{5}$ jest równa: A. 0, B. 1, C. 2, D. 5"
```

**Po:**
```json
"statement": "Liczba $\\frac{1}{3}\\log_5 125 - 3\\log_{125} \\frac{1}{5}$ jest równa:",
"quiz": "A. 0\nB. 1\nC. 2\nD. 5"
```

### 2. Zadania "Oceń prawdziwość stwierdzeń" (P/F)
**Przed:**
```json
"statement": "Dana jest funkcja liniowa określona wzorem $f(x) = (m-2) \\cdot x + m - 3$. Oceń prawdziwość poniższych stwierdzeń: 1) Funkcja $f$ jest rosnąca dla $m \\in (-\\infty, 2)$ - P/F, 2) Funkcja $f$ jest stała dla $m = 3$ - P/F"
```

**Po:**
```json
"statement": "Dana jest funkcja liniowa określona wzorem $f(x) = (m-2) \\cdot x + m - 3$. Oceń prawdziwość poniższych stwierdzeń:",
"quiz": "1) Funkcja $f$ jest rosnąca dla $m \\in (-\\infty{,} 2)$ - P/F\n2) Funkcja $f$ jest stała dla $m = 3$ - P/F"
```

### 3. Zadania "Uzupełnij zdania"
**Przed:**
```json
"statement": "Funkcja f jest określona następująco: $f(x)=\\begin{cases} -5x-15 & \\text{dla } x \\in(-4,-2] \\\\ -5 & \\text{dla } x \\in(-2,2) \\\\ 3x+8 & \\text{dla } x \\in[2,4] \\\\ 5 & \\text{dla } x=5 \\end{cases}$. Uzupełnij zdania: 1) Dziedziną funkcji f jest przedział _____, 2) Zbiorem wartości funkcji f jest przedział _____, 3) Zbiorem wszystkich argumentów, dla których funkcja f przyjmuje wartość najmniejszą jest przedział _____, 4) Zbiorem wszystkich argumentów dla których funkcja f jest malejąca jest przedział _____."
```

**Po:**
```json
"statement": "Funkcja f jest określona następująco: $f(x)=\\begin{cases} -5x-15 & \\text{dla } x \\in(-4,-2] \\\\ -5 & \\text{dla } x \\in(-2,2) \\\\ 3x+8 & \\text{dla } x \\in[2,4] \\\\ 5 & \\text{dla } x=5 \\end{cases}$. Uzupełnij zdania:",
"quiz": "1) Dziedziną funkcji f jest przedział _____\n2) Zbiorem wartości funkcji f jest przedział _____\n3) Zbiorem wszystkich argumentów{,} dla których funkcja f przyjmuje wartość najmniejszą jest przedział _____\n4) Zbiorem wszystkich argumentów dla których funkcja f jest malejąca jest przedział _____"
```

## Zasady przekształcania

1. **Statement** - zostaw tylko pytanie główne zakończone dwukropkiem
2. **Quiz** - przenieś opcje/pytania do osobnego pola
3. **Używaj `\n`** między opcjami dla separacji na nowe linie
4. **Zachowaj formatowanie LaTeX** - wszystkie `$...$` i specjalne znaki
5. **Popraw przecinki w liczbach dziesiętnych** - użyj `{,}` zamiast `,` (np. `-0{,}4`)
6. **Popraw przecinki w przedziałach** - użyj `{,}` w LaTeX (np. `(-\\infty{,} 2)`)

## Efekt wizualny

Po zmianie:
- **Statement** wyświetla się jako główne polecenie
- **Linia separująca** (subtelna) dzieli polecenie od opcji
- **Quiz** wyświetla się pod linią, każda opcja w nowej linii

## Komponenty zaktualizowane

- ✅ **ProblemView.jsx** - główny widok zadania
- ✅ **Kwiecien2025Podstawa.jsx** - lista zadań
- ✅ **MathRenderer.jsx** - bez zmian (opcje renderowane osobno przez split)

## Pliki z zadaniami

- ✅ **maturakwiecien2025podstawa_multistep.json** - wszystkie zadania ABCD zaktualizowane
- 🔄 **Inne pliki maturalne** - wymagają aktualizacji w przyszłości