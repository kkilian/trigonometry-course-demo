/**
 * FAZA 5: Test integracji z aktualnym MathRenderer
 * Sprawdza jak przekonwertowane dane działają z obecnym systemem renderowania
 */

const fs = require('fs');
const path = require('path');

/**
 * Symuluje parsowanie MathRenderer (z MathRenderer.jsx)
 * Uproszczona wersja parseLatexText z komponentu
 */
function simulateMathRendererParsing(text) {
    if (!text || typeof text !== 'string') {
        return [{ type: 'text', content: String(text || '') }];
    }
    
    const segments = [];
    let currentIndex = 0;
    
    // Symuluj parsing $...$ delimiters (główna logika z MathRenderer)
    const mathDelimiterRegex = /\$([^$]+)\$/g;
    let match;
    
    const mathBlocks = [];
    while ((match = mathDelimiterRegex.exec(text)) !== null) {
        mathBlocks.push({
            start: match.index,
            end: match.index + match[0].length,
            content: match[1],
            type: 'math'
        });
    }
    
    if (mathBlocks.length > 0) {
        for (const block of mathBlocks) {
            // Dodaj tekst przed blokiem matematycznym
            if (currentIndex < block.start) {
                const textContent = text.slice(currentIndex, block.start);
                if (textContent.trim()) {
                    segments.push({ type: 'text', content: textContent });
                }
            }
            
            // Dodaj blok matematyczny
            segments.push({ type: 'math', content: block.content });
            currentIndex = block.end;
        }
        
        // Dodaj pozostały tekst
        if (currentIndex < text.length) {
            const textContent = text.slice(currentIndex);
            if (textContent.trim()) {
                segments.push({ type: 'text', content: textContent });
            }
        }
        
        return segments;
    }
    
    // Jeśli nie ma $...$ delimiters, zwróć jako tekst
    return [{ type: 'text', content: text }];
}

/**
 * Analizuje czy segment matematyczny może powodować problemy w KaTeX
 */
function analyzeMathSegment(mathContent) {
    const issues = [];
    
    // Sprawdź czy są problematyczne znaki
    if (mathContent.includes('$')) {
        issues.push('Contains nested $ signs');
    }
    
    if (mathContent.trim() === '') {
        issues.push('Empty math segment');
    }
    
    if (mathContent.includes('=$ $')) {
        issues.push('Broken equation with separated equals');
    }
    
    if (mathContent.match(/\w\$$|\$\w/)) {
        issues.push('Math segment attached to text');
    }
    
    return {
        content: mathContent,
        isValid: issues.length === 0,
        issues: issues
    };
}

/**
 * Testuje pojedynczy problem z przekonwertowanych danych
 */
function testProblemRendering(problem) {
    const results = {
        problemId: problem.id,
        statement: null,
        steps: [],
        solutions: [],
        overallIssues: 0
    };
    
    // Test statement
    if (problem.statement) {
        const segments = simulateMathRendererParsing(problem.statement);
        const mathSegments = segments.filter(s => s.type === 'math');
        const segmentAnalysis = mathSegments.map(s => analyzeMathSegment(s.content));
        
        results.statement = {
            originalText: problem.statement,
            segmentsCount: segments.length,
            mathSegmentsCount: mathSegments.length,
            segments: segmentAnalysis,
            hasIssues: segmentAnalysis.some(s => !s.isValid)
        };
        
        results.overallIssues += segmentAnalysis.filter(s => !s.isValid).length;
    }
    
    // Test steps
    if (problem.steps && Array.isArray(problem.steps)) {
        problem.steps.forEach((step, index) => {
            const stepResult = {
                stepIndex: index,
                hint: null,
                expression: null,
                explanation: null
            };
            
            ['hint', 'expression', 'explanation'].forEach(field => {
                if (step[field]) {
                    const segments = simulateMathRendererParsing(step[field]);
                    const mathSegments = segments.filter(s => s.type === 'math');
                    const segmentAnalysis = mathSegments.map(s => analyzeMathSegment(s.content));
                    
                    stepResult[field] = {
                        originalText: step[field],
                        segmentsCount: segments.length,
                        mathSegmentsCount: mathSegments.length,
                        segments: segmentAnalysis,
                        hasIssues: segmentAnalysis.some(s => !s.isValid)
                    };
                    
                    results.overallIssues += segmentAnalysis.filter(s => !s.isValid).length;
                }
            });
            
            results.steps.push(stepResult);
        });
    }
    
    // Test solutions
    if (problem.solutions && Array.isArray(problem.solutions)) {
        problem.solutions.forEach((solution, index) => {
            const segments = simulateMathRendererParsing(solution);
            const mathSegments = segments.filter(s => s.type === 'math');
            const segmentAnalysis = mathSegments.map(s => analyzeMathSegment(s.content));
            
            results.solutions.push({
                solutionIndex: index,
                originalText: solution,
                segmentsCount: segments.length,
                mathSegmentsCount: mathSegments.length,
                segments: segmentAnalysis,
                hasIssues: segmentAnalysis.some(s => !s.isValid)
            });
            
            results.overallIssues += segmentAnalysis.filter(s => !s.isValid).length;
        });
    }
    
    return results;
}

/**
 * Główny test integracji z MathRenderer
 */
function testMathRendererIntegration() {
    console.log('🧪 FAZA 5: TEST INTEGRACJI Z MATHRENDERER');
    console.log('='.repeat(80));
    
    // Wczytaj przekonwertowane dane
    const convertedPath = path.join(__dirname, '../problems.converted.json');
    
    if (!fs.existsSync(convertedPath)) {
        console.error('❌ Plik problems.converted.json nie istnieje. Uruchom najpierw FAZĘ 4.');
        return;
    }
    
    const convertedData = JSON.parse(fs.readFileSync(convertedPath, 'utf8'));
    console.log(`📊 Testowanie ${convertedData.length} przekonwertowanych problemów`);
    
    // Test na próbce 10 problemów
    const sampleSize = 10;
    const testSample = convertedData.slice(0, sampleSize);
    
    console.log(`🎯 Testowanie próbki ${sampleSize} problemów z MathRenderer\n`);
    
    const testResults = {
        tested: 0,
        withIssues: 0,
        totalIssues: 0,
        problemResults: [],
        issueTypes: {},
        summary: {
            renderableProblems: 0,
            problematicProblems: 0,
            avgIssuesPerProblem: 0,
            commonIssues: []
        }
    };
    
    // Test każdego problemu
    testSample.forEach((problem, index) => {
        console.log(`🔍 Testowanie problemu ${index + 1}: ${problem.id}`);
        
        const result = testProblemRendering(problem);
        testResults.problemResults.push(result);
        testResults.tested++;
        
        if (result.overallIssues > 0) {
            testResults.withIssues++;
            testResults.totalIssues += result.overallIssues;
            
            console.log(`   ⚠️  ${result.overallIssues} problemów renderowania`);
            
            // Zbierz typy problemów
            [result.statement, ...result.steps, ...result.solutions].forEach(section => {
                if (section && section.segments) {
                    section.segments.forEach(segment => {
                        if (!segment.isValid) {
                            segment.issues.forEach(issue => {
                                testResults.issueTypes[issue] = (testResults.issueTypes[issue] || 0) + 1;
                            });
                        }
                    });
                }
            });
        } else {
            console.log(`   ✅ Brak problemów renderowania`);
        }
    });
    
    // Oblicz statystyki
    testResults.summary.renderableProblems = testResults.tested - testResults.withIssues;
    testResults.summary.problematicProblems = testResults.withIssues;
    testResults.summary.avgIssuesPerProblem = testResults.totalIssues / testResults.tested;
    testResults.summary.commonIssues = Object.entries(testResults.issueTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count }));
    
    // Wyświetl podsumowanie
    console.log('\n' + '='.repeat(80));
    console.log('📊 WYNIKI TESTU INTEGRACJI Z MATHRENDERER');
    console.log('='.repeat(80));
    console.log(`🧪 Testowane problemy: ${testResults.tested}`);
    console.log(`✅ Bez problemów renderowania: ${testResults.summary.renderableProblems} (${((testResults.summary.renderableProblems/testResults.tested)*100).toFixed(1)}%)`);
    console.log(`⚠️  Z problemami renderowania: ${testResults.summary.problematicProblems} (${((testResults.summary.problematicProblems/testResults.tested)*100).toFixed(1)}%)`);
    console.log(`🔧 Łączna liczba problemów: ${testResults.totalIssues}`);
    console.log(`📈 Średnia problemów/problem: ${testResults.summary.avgIssuesPerProblem.toFixed(1)}`);
    
    if (testResults.summary.commonIssues.length > 0) {
        console.log('\n🏗️ NAJCZĘSTSZE PROBLEMY RENDEROWANIA:');
        testResults.summary.commonIssues.forEach(({ issue, count }) => {
            console.log(`   ${count}x ${issue}`);
        });
    }
    
    // Rekomendacje
    console.log('\n🎯 REKOMENDACJE:');
    const renderabilityRate = (testResults.summary.renderableProblems / testResults.tested) * 100;
    
    if (renderabilityRate >= 90) {
        console.log('✅ DOSKONAŁA KOMPATYBILNOŚĆ: Dane gotowe do użycia z aktualnym MathRenderer');
        console.log('✅ Można przejść do implementacji React-KaTeX');
    } else if (renderabilityRate >= 70) {
        console.log('⚠️ DOBRA KOMPATYBILNOŚĆ: Większość problemów renderowalnych');
        console.log('🔧 Zalecane drobne poprawki przed przejściem do React-KaTeX');
    } else if (renderabilityRate >= 50) {
        console.log('⚠️ UMIARKOWANA KOMPATYBILNOŚĆ: Znaczące problemy renderowania');
        console.log('🔧 Wymagane poprawki konwertera przed dalszymi krokami');
    } else {
        console.log('❌ NISKA KOMPATYBILNOŚĆ: Większość problemów ma błędy renderowania');
        console.log('🔧 Koniecznie popraw konwerter przed kontynuacją');
    }
    
    // Zapisz raport
    const reportPath = path.join(__dirname, 'mathrenderer-integration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        testResults,
        sampleSize,
        totalProblemsAvailable: convertedData.length
    }, null, 2));
    
    console.log(`\n💾 Szczegółowy raport zapisany do: ${path.basename(reportPath)}`);
    
    return testResults;
}

// Export
module.exports = { 
    testMathRendererIntegration,
    simulateMathRendererParsing,
    analyzeMathSegment
};

// Uruchom jeśli wykonywany bezpośrednio
if (require.main === module) {
    try {
        testMathRendererIntegration();
        console.log('\n🏁 Test integracji zakończony.');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Test nieudany:', error.message);
        process.exit(1);
    }
}