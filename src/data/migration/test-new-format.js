/**
 * Test nowego formatu $...$ z React-KaTeX
 * Sprawdza czy dane poprawnie się renderują
 */

const fs = require('fs');
const path = require('path');

// Przykładowe dane w nowym formacie
const testData = {
  "id": "test_format_1",
  "topic": "Test formatu",
  "statement": "Rozwiąż równanie $\\sin x = \\frac{1}{2}$ dla $x \\in [0, 2\\pi]$",
  "steps": [
    {
      "step": 1,
      "hint": "Gdzie na okręgu jednostkowym sinus przyjmuje wartość $\\frac{1}{2}$?",
      "expression": "$\\sin x = \\frac{1}{2}$",
      "explanation": "Szukamy kątów gdzie sinus równa się $\\frac{1}{2}$"
    },
    {
      "step": 2,
      "hint": "Pamiętasz wartości funkcji trygonometrycznych dla kątów podstawowych?",
      "expression": "$x = \\frac{\\pi}{6}$ lub $x = \\pi - \\frac{\\pi}{6} = \\frac{5\\pi}{6}$",
      "explanation": "Sinus równa się $\\frac{1}{2}$ dla $30°$ i $150°$ w przedziale $[0, 2\\pi]$"
    }
  ],
  "solutions": [
    "$x = \\frac{\\pi}{6}$",
    "$x = \\frac{5\\pi}{6}$"
  ]
};

// Sprawdź format danych
function checkFormat(data) {
  console.log('🔍 SPRAWDZANIE FORMATU DANYCH\n');
  console.log('=' .repeat(60));
  
  let hasOldFormat = false;
  let hasDollarFormat = false;
  let issues = [];
  
  // Sprawdź statement
  if (data.statement.includes('\\text{')) {
    hasOldFormat = true;
    issues.push('❌ Statement zawiera \\text{} (stary format)');
  }
  if (data.statement.includes('$')) {
    hasDollarFormat = true;
    console.log('✅ Statement używa $...$ dla matematyki');
  }
  
  // Sprawdź kroki
  data.steps.forEach((step, i) => {
    ['hint', 'expression', 'explanation'].forEach(field => {
      if (step[field] && step[field].includes('\\text{')) {
        hasOldFormat = true;
        issues.push(`❌ Krok ${i+1}.${field} zawiera \\text{}`);
      }
      if (step[field] && step[field].includes('$')) {
        hasDollarFormat = true;
      }
    });
  });
  
  // Podsumowanie
  console.log('\n📊 WYNIKI:');
  if (hasOldFormat) {
    console.log('❌ PROBLEM: Znaleziono stary format \\text{}');
    issues.forEach(issue => console.log('  ' + issue));
  } else {
    console.log('✅ Brak starego formatu \\text{}');
  }
  
  if (hasDollarFormat) {
    console.log('✅ Używa nowego formatu $...$ dla matematyki');
  } else {
    console.log('⚠️  Brak matematyki w formacie $...$');
  }
  
  return !hasOldFormat && hasDollarFormat;
}

// Generuj przykładowy plik HTML do testowania
function generateTestHTML() {
  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test React-KaTeX</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #1a1a1a;
            color: #e0e0e0;
        }
        .problem {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .statement {
            font-size: 1.2em;
            margin-bottom: 20px;
            color: #4a9eff;
        }
        .step {
            margin: 15px 0;
            padding: 15px;
            background: #333;
            border-left: 3px solid #4a9eff;
        }
        .hint {
            color: #ffa500;
            font-style: italic;
            margin-bottom: 10px;
        }
        .expression {
            font-size: 1.1em;
            margin: 10px 0;
        }
        .explanation {
            color: #aaa;
            margin-top: 10px;
        }
        .success { color: #4caf50; }
        .error { color: #f44336; }
    </style>
</head>
<body>
    <h1>Test Renderowania React-KaTeX</h1>
    
    <div class="problem">
        <div class="statement" id="statement"></div>
        <div id="steps"></div>
        <div id="solutions"></div>
    </div>
    
    <div id="status"></div>

    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <script>
        const data = ${JSON.stringify(testData, null, 2)};
        
        function renderMath(text) {
            // Renderuj matematykę w $...$
            return text.replace(/\\$([^$]+)\\$/g, (match, math) => {
                try {
                    const span = document.createElement('span');
                    katex.render(math, span, { displayMode: false });
                    return span.outerHTML;
                } catch (e) {
                    console.error('KaTeX error:', e);
                    return match;
                }
            });
        }
        
        // Renderuj statement
        document.getElementById('statement').innerHTML = renderMath(data.statement);
        
        // Renderuj kroki
        const stepsHtml = data.steps.map(step => \`
            <div class="step">
                <div class="hint">\${renderMath(step.hint)}</div>
                <div class="expression">\${renderMath(step.expression)}</div>
                <div class="explanation">\${renderMath(step.explanation)}</div>
            </div>
        \`).join('');
        document.getElementById('steps').innerHTML = stepsHtml;
        
        // Renderuj rozwiązania
        const solutionsHtml = '<h3>Rozwiązania:</h3>' + 
            data.solutions.map(sol => \`<div>\${renderMath(sol)}</div>\`).join('');
        document.getElementById('solutions').innerHTML = solutionsHtml;
        
        // Status
        const mathElements = document.querySelectorAll('.katex');
        const status = mathElements.length > 0 
            ? '<span class="success">✅ KaTeX renderuje poprawnie (' + mathElements.length + ' elementów)</span>'
            : '<span class="error">❌ Brak elementów KaTeX</span>';
        document.getElementById('status').innerHTML = status;
    </script>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'test-react-katex.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`\n📄 Wygenerowano plik testowy: ${htmlPath}`);
  console.log('   Otwórz go w przeglądarce aby zobaczyć renderowanie');
}

// Sprawdź rzeczywiste dane
function checkRealData() {
  console.log('\n🔍 SPRAWDZANIE RZECZYWISTYCH DANYCH\n');
  console.log('=' .repeat(60));
  
  const problemsPath = path.join(__dirname, '../../problems.json');
  
  try {
    const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    
    let oldFormatCount = 0;
    let newFormatCount = 0;
    let mixedFormatCount = 0;
    
    problems.slice(0, 10).forEach((problem, i) => {
      const hasOldFormat = JSON.stringify(problem).includes('\\text{');
      const hasNewFormat = JSON.stringify(problem).includes('$');
      
      if (hasOldFormat && hasNewFormat) {
        mixedFormatCount++;
        console.log(`⚠️  Problem ${i+1} (${problem.id}): Format MIESZANY`);
      } else if (hasOldFormat) {
        oldFormatCount++;
        console.log(`❌ Problem ${i+1} (${problem.id}): STARY format \\text{}`);
      } else if (hasNewFormat) {
        newFormatCount++;
        console.log(`✅ Problem ${i+1} (${problem.id}): NOWY format $...$`);
      }
    });
    
    console.log('\n📊 PODSUMOWANIE (pierwsze 10 problemów):');
    console.log(`✅ Nowy format: ${newFormatCount}`);
    console.log(`❌ Stary format: ${oldFormatCount}`);
    console.log(`⚠️  Mieszany format: ${mixedFormatCount}`);
    
    if (oldFormatCount > 0 || mixedFormatCount > 0) {
      console.log('\n⚠️  UWAGA: Dane wymagają konwersji!');
      console.log('   Uruchom convert-all-problems.js aby przekonwertować');
    }
    
  } catch (error) {
    console.error('❌ Błąd wczytywania problems.json:', error.message);
  }
}

// Główna funkcja
function main() {
  console.log('🧪 TEST NOWEGO FORMATU REACT-KATEX');
  console.log('=' .repeat(60));
  
  // Test przykładowych danych
  console.log('\n1️⃣ TEST PRZYKŁADOWYCH DANYCH:');
  const isFormatCorrect = checkFormat(testData);
  
  if (isFormatCorrect) {
    console.log('\n✅ Format danych jest POPRAWNY dla React-KaTeX!');
  } else {
    console.log('\n❌ Format danych NIEPOPRAWNY - wymaga poprawki');
  }
  
  // Generuj HTML testowy
  generateTestHTML();
  
  // Sprawdź rzeczywiste dane
  checkRealData();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 TEST ZAKOŃCZONY');
  
  if (isFormatCorrect) {
    console.log('\n✅ SUKCES: Nowy format jest gotowy do użycia!');
    console.log('   - Polski tekst bez \\text{}');
    console.log('   - Matematyka w $...$');
    console.log('   - Kompatybilny z React-KaTeX');
  }
}

// Uruchom
if (require.main === module) {
  main();
}