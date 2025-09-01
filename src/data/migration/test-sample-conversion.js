/**
 * FAZA 3: Test konwersji na próbce rzeczywistych danych
 * Konwertuje pierwszych 5 problemów z problems.json jako proof of concept
 */

const fs = require('fs');
const path = require('path');
const { convertProblem } = require('./convert-to-dollar-format');
const { validateProblem } = require('./validate-format');

/**
 * Wczytuje pierwsze N problemów z pliku JSON
 */
function loadSampleProblems(filePath, sampleSize = 5) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const allProblems = JSON.parse(data);
        
        if (!Array.isArray(allProblems)) {
            throw new Error('Problems file is not an array');
        }
        
        console.log(`📊 Wczytano ${allProblems.length} problemów z pliku`);
        console.log(`🎯 Wybieranie próbki ${sampleSize} problemów do testów\n`);
        
        return allProblems.slice(0, sampleSize);
    } catch (error) {
        console.error('❌ Błąd wczytywania pliku:', error.message);
        return [];
    }
}

/**
 * Porównuje oryginał z wynikiem konwersji
 */
function showConversionComparison(original, converted, index) {
    console.log(`${'='.repeat(80)}`);
    console.log(`🧩 PROBLEM ${index + 1}: ${original.id}`);
    console.log(`${'='.repeat(80)}`);
    
    // Statement
    console.log('📝 STATEMENT:');
    console.log(`PRZED: ${original.statement}`);
    console.log(`PO:    ${converted.statement}\n`);
    
    // Steps
    if (original.steps && original.steps.length > 0) {
        console.log('👣 STEPS:');
        original.steps.forEach((step, stepIndex) => {
            const convertedStep = converted.steps[stepIndex];
            console.log(`  🔢 Krok ${stepIndex + 1}:`);
            
            if (step.hint) {
                console.log(`    HINT PRZED: ${step.hint}`);
                console.log(`    HINT PO:    ${convertedStep.hint}`);
            }
            
            if (step.expression) {
                console.log(`    EXPR PRZED: ${step.expression}`);
                console.log(`    EXPR PO:    ${convertedStep.expression}`);
            }
            
            if (step.explanation) {
                console.log(`    EXPL PRZED: ${step.explanation}`);
                console.log(`    EXPL PO:    ${convertedStep.explanation}`);
            }
            console.log('');
        });
    }
    
    // Solutions
    if (original.solutions && original.solutions.length > 0) {
        console.log('✅ SOLUTIONS:');
        original.solutions.forEach((solution, solIndex) => {
            console.log(`  PRZED: ${solution}`);
            console.log(`  PO:    ${converted.solutions[solIndex]}`);
        });
    }
}

/**
 * Przeprowadza pełny test konwersji próbki
 */
function runSampleConversionTest() {
    console.log('🧪 FAZA 3: TEST KONWERSJI NA PRÓBCE DANYCH');
    console.log('='.repeat(80));
    
    // Ścieżka do pliku z problemami
    const problemsPath = path.join(__dirname, '../problems.json');
    
    // Wczytaj próbkę
    const sampleProblems = loadSampleProblems(problemsPath, 5);
    
    if (sampleProblems.length === 0) {
        console.log('❌ Brak danych do testowania');
        return;
    }
    
    const results = {
        total: sampleProblems.length,
        converted: [],
        errors: [],
        validationResults: [],
        summary: {
            successful: 0,
            failed: 0,
            validationPassed: 0,
            validationFailed: 0
        }
    };
    
    // Konwertuj każdy problem
    sampleProblems.forEach((problem, index) => {
        console.log(`\n🔄 Konwersja problemu ${index + 1}/${sampleProblems.length}...`);
        
        try {
            // Konwersja
            const converted = convertProblem(problem);
            results.converted.push(converted);
            results.summary.successful++;
            
            // Walidacja
            const validation = validateProblem(converted);
            results.validationResults.push(validation);
            
            if (validation.isValid) {
                results.summary.validationPassed++;
                console.log('✅ Konwersja i walidacja zakończona sukcesem');
            } else {
                results.summary.validationFailed++;
                console.log('⚠️  Konwersja zakończona, ale są problemy walidacji:', validation.issues.length);
            }
            
            // Pokaż porównanie
            showConversionComparison(problem, converted, index);
            
        } catch (error) {
            console.error(`❌ Błąd konwersji problemu ${problem.id}:`, error.message);
            results.errors.push({
                problemId: problem.id,
                error: error.message
            });
            results.summary.failed++;
        }
    });
    
    // Podsumowanie końcowe
    console.log('\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE TESTU KONWERSJI PRÓBKI');
    console.log('='.repeat(80));
    console.log(`📦 Problemy do konwersji: ${results.total}`);
    console.log(`✅ Konwersje udane: ${results.summary.successful}`);
    console.log(`❌ Konwersje nieudane: ${results.summary.failed}`);
    console.log(`🔍 Walidacja przeszła: ${results.summary.validationPassed}`);
    console.log(`⚠️  Problemy z walidacją: ${results.summary.validationFailed}`);
    console.log(`📈 Procent sukcesu konwersji: ${((results.summary.successful / results.total) * 100).toFixed(1)}%`);
    console.log(`📈 Procent sukcesu walidacji: ${((results.summary.validationPassed / results.total) * 100).toFixed(1)}%`);
    
    // Szczegóły problemów z walidacją
    if (results.summary.validationFailed > 0) {
        console.log('\n⚠️  SZCZEGÓŁY PROBLEMÓW WALIDACJI:');
        results.validationResults.forEach((validation, index) => {
            if (!validation.isValid) {
                console.log(`\n❌ Problem ${validation.problemId}:`);
                validation.issues.forEach(issue => {
                    console.log(`   - ${issue}`);
                });
            }
        });
    }
    
    // Zapisz wyniki do pliku
    const outputPath = path.join(__dirname, 'sample-conversion-results.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        original: sampleProblems,
        converted: results.converted,
        validationResults: results.validationResults,
        summary: results.summary,
        errors: results.errors
    }, null, 2));
    
    console.log(`\n💾 Wyniki zapisane do: ${outputPath}`);
    
    // Rekomendacje
    console.log('\n🎯 REKOMENDACJE:');
    if (results.summary.validationFailed === 0) {
        console.log('✅ Konwerter gotowy do pełnej konwersji wszystkich problemów');
        console.log('✅ Można przejść do FAZY 4');
    } else {
        const errorRate = (results.summary.validationFailed / results.total) * 100;
        if (errorRate < 20) {
            console.log('⚠️  Niewielkie problemy z walidacją - można kontynuować, ale warto przejrzeć błędy');
            console.log('✅ Można przejść do FAZY 4 z ostrożnością');
        } else {
            console.log('❌ Zbyt wiele błędów walidacji - zalecane poprawy przed FAZĄ 4');
            console.log('🔧 Rozważ poprawki w convert-helpers.js');
        }
    }
    
    return results;
}

// Export dla użycia w innych skryptach
module.exports = { runSampleConversionTest, loadSampleProblems };

// Uruchom test jeśli wykonywany bezpośrednio
if (require.main === module) {
    runSampleConversionTest();
}