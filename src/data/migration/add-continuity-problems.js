/**
 * Add new continuity problems to wielomiany_solutions.json
 */

const fs = require('fs');
const path = require('path');

// New problems from the user
const newProblems = [
  {
    "id": "continuity_check_1",
    "topic": "Ciągłość funkcji",
    "statement": "Sprawdź ciągłość funkcji w punkcie $x_0 = 1$: $f(x) = x + 1$ dla $x < 1$, $f(1) = 0$, $f(x) = 9 - 2^x$ dla $x > 1$",
    "steps": [
      {
        "step": 1,
        "hint": "Jakie są trzy warunki ciągłości funkcji w punkcie? Zacznijmy od pierwszego - czy funkcja jest określona w punkcie $x_0 = 1$?",
        "expression": "$f(1) = 0$",
        "explanation": "Funkcja jest określona w punkcie $x_0 = 1$, bo mamy podaną jej wartość"
      },
      {
        "step": 2,
        "hint": "Drugi warunek to istnienie granicy lewostronnej. Jak ją obliczymy?",
        "expression": "$\\lim_{x \\to 1^-} f(x) = \\lim_{x \\to 1^-} (x + 1) = 1 + 1 = 2$",
        "explanation": "Dla $x < 1$ funkcja dana wzorem $f(x) = x + 1$, więc podstawiamy $x = 1$"
      },
      {
        "step": 3,
        "hint": "Jak obliczymy granicę prawostronną?",
        "expression": "$\\lim_{x \\to 1^+} f(x) = \\lim_{x \\to 1^+} (9 - 2^x) = 9 - 2^1 = 9 - 2 = 7$",
        "explanation": "Dla $x > 1$ funkcja dana wzorem $f(x) = 9 - 2^x$, więc podstawiamy $x = 1$"
      },
      {
        "step": 4,
        "hint": "Czy granice lewostronna i prawostronna są równe?",
        "expression": "$\\lim_{x \\to 1^-} f(x) = 2 $\\neq$ 7 = \\lim_{x \\to 1^+} f(x)$",
        "explanation": "Granice jednostronne są różne, więc granica funkcji w punkcie $x_0 = 1$ nie istnieje"
      },
      {
        "step": 5,
        "hint": "Porównajmy wartość funkcji w punkcie z granicami jednostronnymi",
        "expression": "$f(1) = 0 \\neq 2 = \\lim_{x \\to 1^-} f(x)$ oraz $f(1) = 0 \\neq 7 = \\lim_{x \\to 1^+} f(x)$",
        "explanation": "Wartość funkcji różni się od obu granic jednostronnych"
      },
      {
        "step": 6,
        "hint": "Jakie wnioski możemy wyciągnąć o ciągłości funkcji w punkcie $x_0 = 1$?",
        "expression": "Funkcja nie jest ciągła w punkcie $x_0 = 1$",
        "explanation": "Nie jest spełniony żaden z warunków ciągłości: granica nie istnieje i wartość funkcji nie równa się granicom jednostronnym"
      }
    ],
    "solutions": [
      "Funkcja nie jest ciągła w punkcie $x_0 = 1$"
    ],
    "parameters": {
      "point": "$x_0 = 1$",
      "left_limit": "$\\lim_{x \\to 1^-} f(x) = 2$",
      "right_limit": "$\\lim_{x \\to 1^+} f(x) = 7$",
      "value": "$f(1) = 0$"
    }
  },
  {
    "id": "continuity_1",
    "topic": "Ciągłość funkcji",
    "statement": "Sprawdź ciągłość funkcji w punkcie $x_0 = 2$: $f(x) = x^2 - 1$ dla $x < 2$, $f(2) = 3$, $f(x) = 2x - 1$ dla $x > 2$",
    "steps": [
      {
        "step": 1,
        "hint": "Jakie są trzy warunki ciągłości funkcji w punkcie? Zacznijmy od sprawdzenia czy funkcja jest określona w punkcie $x_0 = 2$",
        "expression": "$f(2) = 3$",
        "explanation": "Funkcja jest określona w punkcie $x_0 = 2$, bo mamy podaną jej wartość"
      },
      {
        "step": 2,
        "hint": "Jaka jest granica lewostronna w punkcie $x_0 = 2$? Podstaw wartości bliskie 2 z lewej strony",
        "expression": "$\\lim_{x \\to 2^-} f(x) = \\lim_{x \\to 2^-} (x^2 - 1) = 2^2 - 1 = 4 - 1 = 3$",
        "explanation": "Dla $x < 2$ używamy wzoru $x^2 - 1$ i obliczamy granicę"
      },
      {
        "step": 3,
        "hint": "Jaka jest granica prawostronna w punkcie $x_0 = 2$? Podstaw wartości bliskie 2 z prawej strony",
        "expression": "$\\lim_{x \\to 2^+} f(x) = \\lim_{x \\to 2^+} (2x - 1) = 2(2) - 1 = 4 - 1 = 3$",
        "explanation": "Dla $x > 2$ używamy wzoru $2x - 1$ i obliczamy granicę"
      },
      {
        "step": 4,
        "hint": "Czy granice lewostronna i prawostronna są równe? Jaka jest granica funkcji w punkcie $x_0 = 2$?",
        "expression": "$\\lim_{x \\to 2^-} f(x) = \\lim_{x \\to 2^+} f(x) = 3$",
        "explanation": "Granice jednostronne są równe, więc istnieje granica funkcji w punkcie $x_0 = 2$"
      },
      {
        "step": 5,
        "hint": "Porównaj wartość granicy z wartością funkcji w punkcie $x_0 = 2$. Co to oznacza dla ciągłości?",
        "expression": "$\\lim_{x \\to 2} f(x) = 3 = f(2)$",
        "explanation": "Granica funkcji równa się wartości funkcji w punkcie $x_0 = 2$"
      }
    ],
    "solutions": [
      "Funkcja jest ciągła w punkcie $x_0 = 2$, ponieważ spełnione są wszystkie trzy warunki ciągłości:"
    ],
    "parameters": {
      "conditions": [
        "1. Funkcja jest określona w punkcie $x_0 = 2$",
        "2. Istnieje granica funkcji w punkcie $x_0 = 2$",
        "3. Granica funkcji równa się wartości funkcji w punkcie $x_0 = 2$"
      ]
    }
  }
];

// Load existing problems
const wielomianyPath = path.join(__dirname, '../wielomiany_solutions.json');
const existingProblems = JSON.parse(fs.readFileSync(wielomianyPath, 'utf8'));

// Check if problems already exist
const existingIds = new Set(existingProblems.map(p => p.id));
const problemsToAdd = newProblems.filter(p => !existingIds.has(p.id));

if (problemsToAdd.length === 0) {
  console.log('✅ All problems already exist in the file');
} else {
  // Add new problems
  const updatedProblems = [...existingProblems, ...problemsToAdd];
  
  // Save updated file
  fs.writeFileSync(wielomianyPath, JSON.stringify(updatedProblems, null, 2));
  
  console.log(`✅ Added ${problemsToAdd.length} new continuity problems`);
  console.log(`📊 Total problems: ${updatedProblems.length}`);
  console.log(`✅ File updated: ${wielomianyPath}`);
}

// Validate format
const updatedContent = fs.readFileSync(wielomianyPath, 'utf8');
const hasOldFormat = updatedContent.includes('\\text{');
const hasNewFormat = updatedContent.includes('$');

console.log('\n🔍 FORMAT VALIDATION:');
if (hasOldFormat) {
  console.log('⚠️  WARNING: Old \\text{} format found');
} else {
  console.log('✅ No \\text{} format found');
}

if (hasNewFormat) {
  console.log('✅ New $...$ format present');
}