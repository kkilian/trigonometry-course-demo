# Struktura plików JSON w katalogu src/data/

## Ogólny opis

Pliki JSON w katalogu `src/data/` zawierają zadania edukacyjne z matematyki. Każdy plik reprezentuje zestaw problemów/zadań z określonej dziedziny matematycznej.

## Struktura pojedynczego zadania

Każdy plik JSON zawiera tablicę obiektów, gdzie każdy obiekt reprezentuje jedno zadanie o następującej strukturze:

### Pola główne:

```json
{
  "id": "string",           // Unikalny identyfikator zadania
  "topic": "string",        // Temat/kategoria zadania
  "statement": "string",    // Treść zadania w formacie LaTeX
  "note": "string",         // Dodatkowe wyjaśnienia/uwagi do zadania (opcjonalne)
  "steps": [               // Tablica kroków rozwiązania
    {
      "step": number,       // Numer kroku (opcjonalne)
      "hint": "string",     // Wskazówka dla ucznia
      "expression": "string", // Wyrażenie matematyczne w LaTeX
      "explanation": "string", // Wyjaśnienie kroku
      "why": "string"       // Uzasadnienie (opcjonalne, szczegółowe)
    }
  ],
  "solutions": ["string"], // Tablica rozwiązań w LaTeX
  "parameters": {},        // Obiekt parametrów (może być pusty)
  "validation": {          // Walidacja zadania (opcjonalne)
    "isValid": boolean,
    "missingFields": [],
    "warnings": []
  },
  "timestamp": "string"    // Znacznik czasu (ISO format)
}
```

## Typy plików

### 1. Pliki z serii "basics-X" 
(np. `basics-1-arytmetyka.json`, `basics-10-trygonometria-podstawowa.json`)

Zawierają zadania podstawowe z różnych działów matematyki:
- Arytmetyka
- Logika i zbiory  
- Wyrażenia algebraiczne
- Równania i nierówności
- Funkcje
- Geometria elementarna
- Układ współrzędnych
- Potęgi i pierwiastki
- Logarytmy
- Trygonometria podstawowa
- Kombinatoryka i prawdopodobieństwo
- Statystyka
- Układy równań

### 2. Pliki specjalistyczne
(np. `polynomial-operations-problems.json`, `powers-problems.json`)

Zawierają zadania z konkretnych zagadnień:
- Operacje na wielomianach
- Definicje wielomianów
- Wzory wielomianów
- Podstawiania w wielomianach
- Wprowadzenia do wielomianów
- Ułamki algebraiczne
- Potęgi
- Ciągi

## Format matematyczny

Wszystkie wyrażenia matematyczne są zapisane w formacie **LaTeX** z oznaczeniami:
- `$...$` dla wyrażeń inline
- Symbole matematyczne używają standardowej notacji LaTeX
- Przykłady: `$x^2 + 1$`, `$\\frac{1}{2}$`, `$\\sqrt{x}$`

## Cechy szczególne

1. **Progresywne kroki**: Każde zadanie ma szczegółowe kroki rozwiązania z wskazówkami
2. **Pedagogiczne podejście**: Pole `why` zawiera uzasadnienia i wyjaśnienia błędów
3. **Walidacja**: Niektóre zadania mają informacje o poprawności struktury
4. **Wielokrotne rozwiązania**: Pole `solutions` może zawierać różne formy odpowiedzi
5. **Metadata**: Znaczniki czasu pokazują gdy zadania były tworzone/modyfikowane

## Przykład struktury

```json
[
  {
    "id": "tex_problem_1",
    "topic": "Kolejność działań",
    "statement": "Oblicz: $12 + 7 - 5$",
    "steps": [
      {
        "step": 1,
        "hint": "Jakie działania widzisz w tym wyrażeniu?",
        "expression": "$12 + 7 - 5$",
        "explanation": "Mamy dodawanie i odejmowanie"
      }
    ],
    "solutions": ["$14$"],
    "parameters": {}
  }
]
```