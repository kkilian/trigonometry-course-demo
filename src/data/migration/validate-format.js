/**
 * Walidator formatu LaTeX po konwersji
 * Sprawdza czy konwersja przebiegła poprawnie
 */

/**
 * Waliduje pojedyncze pole tekstowe
 */
function validateField(text, fieldName = 'field') {
    const issues = [];
    
    if (!text || typeof text !== 'string') {
        return { isValid: true, issues }; // Puste pola są OK
    }
    
    // 1. Sprawdź czy nie ma pozostałości \text{}
    if (text.includes('\\text{')) {
        issues.push(`${fieldName}: Still contains \\text{} - "${text}"`);
    }
    
    // 2. Sprawdź balans dolarów
    const dollarMatches = text.match(/\$/g);
    const dollarCount = dollarMatches ? dollarMatches.length : 0;
    if (dollarCount % 2 !== 0) {
        issues.push(`${fieldName}: Unbalanced $ signs (${dollarCount}) - "${text}"`);
    }
    
    // 3. Sprawdź czy nie ma pustych $$ par
    if (text.includes('$$')) {
        issues.push(`${fieldName}: Contains empty $$ pairs - "${text}"`);
    }
    
    // 4. Sprawdź czy matematyka jest prawdopodobnie w $...$
    const mathPattern = /\\(sin|cos|tan|frac|pi|alpha|beta|theta|sqrt)/;
    if (mathPattern.test(text) && !text.includes('$')) {
        issues.push(`${fieldName}: Contains LaTeX math outside $ delimiters - "${text}"`);
    }
    
    // 5. Sprawdź zagnieżdżone dolary
    if (/\$[^$]*\$[^$]*\$/g.test(text)) {
        const nested = text.match(/\$[^$]*\$[^$]*\$/g);
        if (nested) {
            issues.push(`${fieldName}: Possible nested $ signs - "${nested.join(', ')}"`);
        }
    }
    
    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Waliduje pojedynczy krok
 */
function validateStep(step, stepIndex) {
    const issues = [];
    
    if (!step || typeof step !== 'object') {
        return { isValid: true, issues };
    }
    
    // Waliduj poszczególne pola
    if (step.hint) {
        const hintValidation = validateField(step.hint, `step[${stepIndex}].hint`);
        issues.push(...hintValidation.issues);
    }
    
    if (step.expression) {
        const exprValidation = validateField(step.expression, `step[${stepIndex}].expression`);
        issues.push(...exprValidation.issues);
    }
    
    if (step.explanation) {
        const explValidation = validateField(step.explanation, `step[${stepIndex}].explanation`);
        issues.push(...explValidation.issues);
    }
    
    return {
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Waliduje pojedynczy problem
 */
function validateProblem(problem) {
    const issues = [];
    
    if (!problem || typeof problem !== 'object') {
        issues.push('Problem is not a valid object');
        return { isValid: false, issues };
    }
    
    const problemId = problem.id || 'unknown';
    
    // Waliduj statement
    if (problem.statement) {
        const stmtValidation = validateField(problem.statement, `${problemId}.statement`);
        issues.push(...stmtValidation.issues);
    }
    
    // Waliduj steps
    if (problem.steps && Array.isArray(problem.steps)) {
        problem.steps.forEach((step, index) => {
            const stepValidation = validateStep(step, index);
            issues.push(...stepValidation.issues);
        });
    }
    
    // Waliduj solutions
    if (problem.solutions && Array.isArray(problem.solutions)) {
        problem.solutions.forEach((solution, index) => {
            const solValidation = validateField(solution, `${problemId}.solutions[${index}]`);
            issues.push(...solValidation.issues);
        });
    }
    
    return {
        isValid: issues.length === 0,
        issues,
        problemId
    };
}

/**
 * Waliduje tablicę problemów
 */
function validateProblems(problems) {
    if (!Array.isArray(problems)) {
        throw new Error('Input must be an array of problems');
    }
    
    const results = {
        isValid: true,
        stats: {
            total: problems.length,
            valid: 0,
            invalid: 0,
            totalIssues: 0
        },
        problems: [],
        summary: []
    };
    
    problems.forEach((problem, index) => {
        const validation = validateProblem(problem);
        
        results.problems.push({
            index,
            problemId: validation.problemId,
            isValid: validation.isValid,
            issues: validation.issues
        });
        
        if (validation.isValid) {
            results.stats.valid++;
        } else {
            results.stats.invalid++;
            results.isValid = false;
        }
        
        results.stats.totalIssues += validation.issues.length;
        
        // Dodaj do summary jeśli są problemy
        if (!validation.isValid) {
            results.summary.push({
                problemId: validation.problemId,
                issueCount: validation.issues.length,
                issues: validation.issues.slice(0, 3) // Pierwsze 3 problemy
            });
        }
    });
    
    return results;
}

/**
 * Wyświetla raport walidacji
 */
function printValidationReport(validationResults) {
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION REPORT');
    console.log('='.repeat(60));
    
    const { stats, summary, isValid } = validationResults;
    
    console.log(`Total problems: ${stats.total}`);
    console.log(`Valid: ${stats.valid}`);
    console.log(`Invalid: ${stats.invalid}`);
    console.log(`Total issues: ${stats.totalIssues}`);
    console.log(`Overall status: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (stats.invalid > 0) {
        console.log('\nPROBLEMS WITH ISSUES:');
        summary.forEach(problem => {
            console.log(`\n❌ ${problem.problemId} (${problem.issueCount} issues):`);
            problem.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
        });
    }
    
    console.log('='.repeat(60));
}

module.exports = {
    validateField,
    validateStep,
    validateProblem,
    validateProblems,
    printValidationReport
};

// Jeśli uruchomiony bezpośrednio, wykonaj przykład
if (require.main === module) {
    console.log('Testing validator...');
    
    const testProblem = {
        id: 'test_1',
        statement: 'Test problem with $x = 2\\pi$ math',
        steps: [
            {
                hint: 'This is a hint with $\\sin(x)$',
                expression: '$y = \\frac{1}{2}$',
                explanation: 'Simple explanation'
            }
        ],
        solutions: ['$x = \\pi$']
    };
    
    const validation = validateProblem(testProblem);
    console.log('Test result:', validation);
}