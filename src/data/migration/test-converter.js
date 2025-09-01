/**
 * Testy jednostkowe dla konwertera LaTeX
 * FAZA 2: Sprawdzenie wszystkich scenariuszy konwersji
 */

const { 
    removeTextWrapper, 
    wrapMathInDollars, 
    cleanupSpaces, 
    validateConversion 
} = require('./convert-helpers');

const { 
    convertField, 
    convertStep, 
    convertProblem, 
    convertProblems 
} = require('./convert-to-dollar-format');

const { validateField, validateStep, validateProblem } = require('./validate-format');

/**
 * Test runner - prosta implementacja
 */
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
    if (condition) {
        passedTests++;
        console.log(`✅ PASSED: ${message}`);
    } else {
        failedTests++;
        failures.push(message);
        console.log(`❌ FAILED: ${message}`);
    }
}

function assertEquals(actual, expected, message) {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    assert(isEqual, `${message} | Expected: "${expected}" | Got: "${actual}"`);
}

console.log('🧪 ROZPOCZYNANIE TESTÓW KONWERTERA LATEX\n');

// =============================================================================
// TESTY removeTextWrapper
// =============================================================================
console.log('📝 TESTY removeTextWrapper');

// Test podstawowy
let result = removeTextWrapper('\\text{Podane miary stopniowe kątów wyraź w radianach } 18°');
assertEquals(result, 'Podane miary stopniowe kątów wyraź w radianach  18°', 
    'Podstawowe usuwanie \\text{}');

// Test zagnieżdżonych nawiasów
result = removeTextWrapper('\\text{Dla kąta } \\alpha = 30°');
assertEquals(result, 'Dla kąta  \\alpha = 30°', 
    'Usuwanie \\text{} z matematyką za nim');

// Test pustego tekstu
result = removeTextWrapper('\\text{}');
assertEquals(result, '', 
    'Usuwanie pustego \\text{}');

// Test bez \\text{}
result = removeTextWrapper('Zwykły tekst bez wrappera');
assertEquals(result, 'Zwykły tekst bez wrappera', 
    'Tekst bez \\text{} zostaje niezmieniony');

// Test zagnieżdżonych nawiasów
result = removeTextWrapper('\\text{Test {zagnieżdżonych} nawiasów}');
assertEquals(result, 'Test {zagnieżdżonych} nawiasów', 
    'Zagnieżdżone nawiasy w \\text{}');

// Test wielokrotnych \\text{}
result = removeTextWrapper('\\text{Pierwszy} tekst \\text{drugi} koniec');
assertEquals(result, 'Pierwszy tekst drugi koniec', 
    'Wielokrotne \\text{} w jednym ciągu');

// =============================================================================
// TESTY wrapMathInDollars
// =============================================================================
console.log('\n📐 TESTY wrapMathInDollars');

// Test funkcji trygonometrycznych
result = wrapMathInDollars('Oblicz \\sin(30°)');
assertEquals(result, 'Oblicz $\\sin(30°)$', 
    'Owijanie funkcji sin w dolary');

// Test liter greckich
result = wrapMathInDollars('Dla \\alpha = 30°');
assertEquals(result, 'Dla $\\alpha$ = $30°$', 
    'Owijanie litery greckiej i stopni');

// Test ułamków
result = wrapMathInDollars('Wartość \\frac{\\pi}{2}');
assertEquals(result, 'Wartość $\\frac{\\pi}{2}$', 
    'Owijanie ułamka z pi');

// Test pierwiastków
result = wrapMathInDollars('Wynik \\sqrt{2}');
assertEquals(result, 'Wynik $\\sqrt{2}$', 
    'Owijanie pierwiastka');

// Test równań
result = wrapMathInDollars('x = 2π');
assertEquals(result, '$x = 2π$', 
    'Owijanie prostego równania');

// Test już opakowanej matematyki
result = wrapMathInDollars('Już opakowane $\\sin(x)$ nie zmieni się');
assertEquals(result, 'Już opakowane $\\sin(x)$ nie zmieni się', 
    'Nie podwójne owijanie matematyki');

// =============================================================================
// TESTY cleanupSpaces
// =============================================================================
console.log('\n🧹 TESTY cleanupSpaces');

// Test podstawowego czyszczenia
result = cleanupSpaces('  Wielokrotne    spacje   ');
assertEquals(result, 'Wielokrotne spacje', 
    'Czyszczenie wielokrotnych spacji');

// Test spacji przy dolarach
result = cleanupSpaces('To jest $ \\sin(x) $ wzór');
assertEquals(result, 'To jest $\\sin(x)$ wzór', 
    'Czyszczenie spacji przy dolarach');

// Test pustych $$ par
result = cleanupSpaces('Test $$ pusty wzór');
assertEquals(result, 'Test  pusty wzór', 
    'Usuwanie pustych $$ par');

// =============================================================================
// TESTY validateConversion
// =============================================================================
console.log('\n✅ TESTY validateConversion');

// Test poprawnej konwersji
result = validateConversion(
    '\\text{Oblicz } \\sin(30°)', 
    'Oblicz $\\sin(30°)$'
);
assertEquals(result.isValid, true, 
    'Walidacja poprawnej konwersji');

// Test niezbalansowanych dolarów
result = validateConversion(
    'Oryginał', 
    'Wynik z $ niezbalansowanym'
);
assertEquals(result.isValid, false, 
    'Wykrycie niezbalansowanych dolarów');

// Test pozostałych \\text{}
result = validateConversion(
    '\\text{Test}', 
    'Wynik z \\text{pozostałym}'
);
assertEquals(result.isValid, false, 
    'Wykrycie pozostałych \\text{}');

// =============================================================================
// TESTY convertField - główna funkcja konwersji
// =============================================================================
console.log('\n🔄 TESTY convertField');

// Test kompletnej konwersji
result = convertField('\\text{Podane miary stopniowe kątów wyraź w radianach } 18°');
assertEquals(result, 'Podane miary stopniowe kątów wyraź w radianach $18°$', 
    'Kompletna konwersja pola');

// Test konwersji z wielokrotną matematyką
result = convertField('360° = 2\\pi \\text{ radianów}');
assertEquals(result, '$360°$ = $2\\pi$ radianów', 
    'Konwersja z wieloma elementami matematycznymi');

// Test konwersji z funkcjami trygonometrycznymi
result = convertField('\\text{Oblicz } \\sin(45°)');
assertEquals(result, 'Oblicz $\\sin(45°)$', 
    'Konwersja z funkcją trygonometryczną');

// Test konwersji ułamka
result = convertField('\\frac{\\pi}{2} \\text{ radianów}');
assertEquals(result, '$\\frac{\\pi}{2}$ radianów', 
    'Konwersja ułamka z tekstem');

// Test null/undefined
result = convertField(null);
assertEquals(result, null, 
    'Obsługa null');

result = convertField(undefined);
assertEquals(result, undefined, 
    'Obsługa undefined');

// Test pustego stringa
result = convertField('');
assertEquals(result, '', 
    'Obsługa pustego stringa');

// =============================================================================
// TESTY convertStep
// =============================================================================
console.log('\n👣 TESTY convertStep');

// Test konwersji kroku z wszystkimi polami
const testStep = {
    hint: '\\text{Pamiętaj o } \\sin(30°) = \\frac{1}{2}',
    expression: '\\sin(30°) = x',
    explanation: '\\text{Funkcja sinus } 30° \\text{ wynosi } \\frac{1}{2}'
};

result = convertStep(testStep);
const expectedStep = {
    hint: 'Pamiętaj o $\\sin(30°)$ = $\\frac{1}{2}$',
    expression: '$\\sin(30°)$ = $x$',
    explanation: 'Funkcja sinus $30°$ wynosi $\\frac{1}{2}$'
};

assertEquals(result.hint, expectedStep.hint, 'Konwersja hint w kroku');
assertEquals(result.expression, expectedStep.expression, 'Konwersja expression w kroku');
assertEquals(result.explanation, expectedStep.explanation, 'Konwersja explanation w kroku');

// Test pustego kroku
result = convertStep(null);
assertEquals(result, null, 'Obsługa null kroku');

// Test kroku bez pól tekstowych
const emptyStep = { id: 1 };
result = convertStep(emptyStep);
assertEquals(result.id, 1, 'Krok bez pól tekstowych zostaje niezmieniony');

// =============================================================================
// TESTY convertProblem
// =============================================================================
console.log('\n🧩 TESTY convertProblem');

// Test konwersji całego problemu
const testProblem = {
    id: 'test_1',
    statement: '\\text{Podane miary stopniowe kątów wyraź w radianach } 18°',
    steps: [
        {
            hint: '\\text{Pamiętaj: } 180° = \\pi \\text{ radianów}',
            expression: '18° = x \\text{ radianów}',
            explanation: '\\text{Użyj proporcji}'
        }
    ],
    solutions: ['\\frac{\\pi}{10} \\text{ radianów}']
};

result = convertProblem(testProblem);

assertEquals(result.id, 'test_1', 'ID problemu pozostaje niezmienione');
assertEquals(result.statement, 'Podane miary stopniowe kątów wyraź w radianach $18°$', 
    'Konwersja statement problemu');
assertEquals(result.steps[0].hint, 'Pamiętaj: $180°$ = $\\pi$ radianów', 
    'Konwersja hint w kroku problemu');
assertEquals(result.solutions[0], '$\\frac{\\pi}{10}$ radianów', 
    'Konwersja solution problemu');

// =============================================================================
// TESTY WALIDACYJNE
// =============================================================================
console.log('\n🔍 TESTY validateField');

// Test poprawnego pola
result = validateField('Tekst z $\\sin(x)$ matematyką');
assertEquals(result.isValid, true, 'Walidacja poprawnego pola');

// Test niezbalansowanych dolarów
result = validateField('Tekst z $ matematyką niezbalansowaną');
assertEquals(result.isValid, false, 'Wykrycie niezbalansowanych $ w polu');

// Test pozostałych \\text{}
result = validateField('Tekst z \\text{pozostałym} fragmentem');
assertEquals(result.isValid, false, 'Wykrycie pozostałych \\text{} w polu');

// Test matematyki poza dolarami
result = validateField('Tekst z \\sin(x) bez dolarów');
assertEquals(result.isValid, false, 'Wykrycie matematyki poza $ w polu');

// =============================================================================
// TESTY EDGE CASES
// =============================================================================
console.log('\n🏗️ TESTY PRZYPADKÓW BRZEGOWYCH');

// Test bardzo długiego tekstu
const longText = '\\text{' + 'Bardzo długi tekst '.repeat(100) + '} z \\sin(x)';
result = convertField(longText);
assert(result.includes('Bardzo długi tekst'), 'Obsługa długiego tekstu');
assert(result.includes('$\\sin(x)$'), 'Matematyka w długim tekście');

// Test specjalnych znaków
result = convertField('\\text{Kąty: } α, β, γ = 30°, 45°, 60°');
assert(result.includes('$α, β, γ = 30°, 45°, 60°$'), 'Specjalne znaki w matematyce');

// Test mieszanego formatu
result = convertField('\\text{Dla } \\alpha = 30° \\text{ mamy } \\sin(\\alpha) = \\frac{1}{2}');
assert(result.includes('Dla'), 'Początek tekstu mieszanego');
assert(result.includes('$\\alpha$ = $30°$'), 'Matematyka w środku');
assert(result.includes('mamy'), 'Tekst w środku');
assert(result.includes('$\\sin(\\alpha)$ = $\\frac{1}{2}$'), 'Matematyka na końcu');

// =============================================================================
// TESTY RZECZYWISTYCH DANYCH
// =============================================================================
console.log('\n📊 TESTY NA RZECZYWISTYCH DANYCH');

// Próbki z rzeczywistych problemów (wg analizy wcześniejszej)
const realSamples = [
    {
        input: '\\text{Podane miary stopniowe kątów wyraź w radianach } 18°',
        expected: 'Podane miary stopniowe kątów wyraź w radianach $18°$'
    },
    {
        input: '360° = 2\\pi \\text{ radianów}',
        expected: '$360°$ = $2\\pi$ radianów'
    },
    {
        input: '\\text{Dla } \\alpha = 30°',
        expected: 'Dla $\\alpha$ = $30°$'
    },
    {
        input: '\\sin(30°) = \\frac{1}{2}',
        expected: '$\\sin(30°)$ = $\\frac{1}{2}$'
    },
    {
        input: '\\frac{\\pi}{2} \\text{ radianów}',
        expected: '$\\frac{\\pi}{2}$ radianów'
    }
];

realSamples.forEach((sample, index) => {
    result = convertField(sample.input);
    assertEquals(result, sample.expected, `Rzeczywisty przykład ${index + 1}`);
});

// =============================================================================
// PODSUMOWANIE TESTÓW
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log('📊 PODSUMOWANIE TESTÓW KONWERTERA');
console.log('='.repeat(60));
console.log(`✅ Testy zakończone sukcesem: ${passedTests}`);
console.log(`❌ Testy zakończone niepowodzeniem: ${failedTests}`);
console.log(`📈 Procent sukcesu: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests > 0) {
    console.log('\n❌ NIEPOWODZENIA:');
    failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
    });
    process.exit(1);
} else {
    console.log('\n🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!');
    console.log('✅ Konwerter jest gotowy do użycia w produkcji.');
}

// Export dla użycia zewnętrznego
module.exports = {
    runTests: () => {
        // Resetuj liczniki
        passedTests = 0;
        failedTests = 0;
        failures.length = 0;
        
        // Tu można dodać logikę uruchamiania wszystkich testów
        console.log('Testy uruchomione programowo');
    }
};