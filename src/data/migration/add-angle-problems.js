const fs = require('fs');
const path = require('path');

// New angle conversion problems
const newProblems = [
  {
    "id": "angle_conversion_1",
    "topic": "Konwersja miar kątów",
    "statement": "Podane miary łukowe kątów wyraź w stopniach $\\frac{5\\pi}{6}$",
    "steps": [
      {
        "step": 1,
        "hint": "Jaka jest zależność między miarą łukową a stopniową? Ile stopni ma kąt pełny w radianach?",
        "expression": "$2\\pi  rad = 360°$",
        "explanation": "Ustalamy podstawową zależność: pełny kąt to $2\\pi$ radianów lub $360$ stopni"
      },
      {
        "step": 2,
        "hint": "Jak możesz ułożyć proporcję, aby zamienić radiany na stopnie?",
        "expression": "$\\frac{\\frac{5\\pi}{6}}{2\\pi} = \\frac{x°}{360°}$",
        "explanation": "Układamy proporcję: stosunek kątów w radianach równa się stosunkowi kątów w stopniach"
      },
      {
        "step": 3,
        "hint": "Jak uprościć ułamek po lewej stronie?",
        "expression": "$\\frac{5}{12} = \\frac{x}{360}$",
        "explanation": "Po skróceniu $\\pi$ w liczniku i mianowniku otrzymujemy prostszą proporcję"
      },
      {
        "step": 4,
        "hint": "Jak wyrazić x z proporcji?",
        "expression": "$x = 360 \\cdot \\frac{5}{12} = \\frac{360 \\cdot 5}{12}$",
        "explanation": "Mnożymy obie strony przez 360"
      },
      {
        "step": 5,
        "hint": "Jakie działania wykonasz w liczniku i mianowniku?",
        "expression": "$x = \\frac{1800}{12} = 150$",
        "explanation": "Wykonujemy mnożenie w liczniku i dzielenie"
      }
    ],
    "solutions": [
      "$\\frac{5\\pi}{6} = 150°$"
    ],
    "parameters": {}
  },
  {
    "id": "angle_conversion_2",
    "topic": "Konwersja miar kątów",
    "statement": "Podane miary łukowe kątów wyraź w stopniach $\\frac{\\pi}{18}$",
    "steps": [
      {
        "step": 1,
        "hint": "Jaka jest zależność między miarą łukową a stopniową? Przypomnij sobie, ile stopni ma kąt pełny",
        "expression": "$360° = 2\\pi$",
        "explanation": "Ustalamy podstawową relację: pełny kąt to $360°$ lub $2\\pi$ radianów"
      },
      {
        "step": 2,
        "hint": "Jak możesz ułożyć proporcję, aby zamienić radiany na stopnie?",
        "expression": "$\\frac{2\\pi}{360°} = \\frac{\\frac{\\pi}{18}}{x°}$",
        "explanation": "Układamy proporcję: jeśli $2\\pi$ to $360°$, to ile stopni ma $\\frac{\\pi}{18}$?"
      },
      {
        "step": 3,
        "hint": "Jak przekształcić tę proporcję, aby obliczyć $x$?",
        "expression": "$x° = \\frac{360° \\cdot \\frac{\\pi}{18}}{2\\pi}$",
        "explanation": "Przekształcamy proporcję, aby wyrazić $x$"
      },
      {
        "step": 4,
        "hint": "Jakie uproszczenia możesz wykonać w liczniku i mianowniku?",
        "expression": "$x° = \\frac{360° \\cdot \\pi}{18 \\cdot 2\\pi} = \\frac{360°}{36} = 10°$",
        "explanation": "Upraszczamy ułamek: $\\pi$ się skraca, a $18 \\cdot 2 = 36$"
      },
      {
        "step": 5,
        "hint": "Sprawdź, czy wynik jest sensowny. Czy $10°$ to rozsądna wartość?",
        "expression": "$\\frac{\\pi}{18} = 10°$",
        "explanation": "Otrzymujemy $10°$, co jest sensowne bo $\\frac{\\pi}{18}$ to stosunkowo mały kąt"
      }
    ],
    "solutions": [
      "$\\frac{\\pi}{18} = 10°$"
    ],
    "parameters": {}
  }
];

// Load existing problems
const wielomianyPath = path.join(__dirname, '../wielomiany_solutions.json');
const existingProblems = JSON.parse(fs.readFileSync(wielomianyPath, 'utf8'));

// Add new problems at the end
const updatedProblems = [...existingProblems, ...newProblems];

// Save updated file
fs.writeFileSync(wielomianyPath, JSON.stringify(updatedProblems, null, 2));

console.log(`✅ Added ${newProblems.length} angle conversion problems`);
console.log(`📊 Total problems: ${updatedProblems.length}`);
console.log(`✅ File updated: ${wielomianyPath}`);