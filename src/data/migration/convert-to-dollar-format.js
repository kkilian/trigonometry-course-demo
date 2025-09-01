/**
 * Główny konwerter formatu LaTeX z \text{...} na $...$
 */

const { 
    removeTextWrapper, 
    wrapMathInDollars, 
    cleanupSpaces, 
    validateConversion 
} = require('./convert-helpers');

/**
 * Konwertuje pojedyncze pole tekstowe
 */
function convertField(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    const original = text;
    let result = text;
    
    try {
        // KROK 1: Usuń wszystkie \text{...} wrappers
        result = removeTextWrapper(result);
        
        // KROK 2: Identyfikuj i opakuj matematykę w $...$
        result = wrapMathInDollars(result);
        
        // KROK 3: Cleanup spacji i formatowania
        result = cleanupSpaces(result);
        
        // KROK 4: Walidacja
        const validation = validateConversion(original, result);
        if (!validation.isValid) {
            console.warn(`Validation issues for "${original}":`, validation.issues);
            // Ale nie przerywaj konwersji - zwróć wynik z ostrzeżeniem
        }
        
        return result;
        
    } catch (error) {
        console.error(`Error converting field "${original}":`, error);
        return original; // Zwróć oryginał w przypadku błędu
    }
}

/**
 * Konwertuje pojedynczy krok (step)
 */
function convertStep(step) {
    if (!step || typeof step !== 'object') {
        return step;
    }
    
    const convertedStep = { ...step };
    
    // Konwertuj poszczególne pola
    if (convertedStep.hint) {
        convertedStep.hint = convertField(convertedStep.hint);
    }
    
    if (convertedStep.expression) {
        convertedStep.expression = convertField(convertedStep.expression);
    }
    
    if (convertedStep.explanation) {
        convertedStep.explanation = convertField(convertedStep.explanation);
    }
    
    return convertedStep;
}

/**
 * Konwertuje pojedynczy problem
 */
function convertProblem(problem) {
    if (!problem || typeof problem !== 'object') {
        return problem;
    }
    
    const convertedProblem = { ...problem };
    
    console.log(`Converting problem ${problem.id}...`);
    
    // Konwertuj statement
    if (convertedProblem.statement) {
        convertedProblem.statement = convertField(convertedProblem.statement);
    }
    
    // Konwertuj steps
    if (convertedProblem.steps && Array.isArray(convertedProblem.steps)) {
        convertedProblem.steps = convertedProblem.steps.map(convertStep);
    }
    
    // Konwertuj solutions
    if (convertedProblem.solutions && Array.isArray(convertedProblem.solutions)) {
        convertedProblem.solutions = convertedProblem.solutions.map(solution => 
            convertField(solution)
        );
    }
    
    return convertedProblem;
}

/**
 * Konwertuje tablicę problemów
 */
function convertProblems(problems) {
    if (!Array.isArray(problems)) {
        throw new Error('Input must be an array of problems');
    }
    
    const results = {
        converted: [],
        errors: [],
        stats: {
            total: problems.length,
            converted: 0,
            failed: 0
        }
    };
    
    problems.forEach((problem, index) => {
        try {
            const converted = convertProblem(problem);
            results.converted.push(converted);
            results.stats.converted++;
        } catch (error) {
            console.error(`Failed to convert problem at index ${index}:`, error);
            results.errors.push({
                index,
                problemId: problem.id || 'unknown',
                error: error.message,
                originalProblem: problem
            });
            results.stats.failed++;
        }
    });
    
    return results;
}

/**
 * Główna funkcja konwersji - testowa dla pojedynczego pola
 */
function testConversion(text) {
    console.log('='.repeat(50));
    console.log('TESTING CONVERSION');
    console.log('='.repeat(50));
    console.log('INPUT:', text);
    console.log('OUTPUT:', convertField(text));
    console.log('='.repeat(50));
}

// Eksportuj funkcje dla testów i użycia zewnętrznego
module.exports = {
    convertField,
    convertStep,
    convertProblem,
    convertProblems,
    testConversion
};

// Jeśli uruchomiony bezpośrednio, wykonaj testy
if (require.main === module) {
    console.log('Testing converter...');
    
    // Testy podstawowe
    testConversion('\\text{Podane miary stopniowe kątów wyraź w radianach } 18°');
    testConversion('360° = 2\\pi \\text{ radianów}');
    testConversion('\\text{Dla } \\alpha = 30°');
    testConversion('\\text{Oblicz } \\sin(45°)');
    testConversion('\\frac{\\pi}{2} \\text{ radianów}');
}