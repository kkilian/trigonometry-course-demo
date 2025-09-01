/**
 * FAZA 4: Pełna konwersja wszystkich problemów
 * Konwertuje wszystkie 174 problemy z problems.json z formatu \text{} na $...$
 */

const fs = require('fs');
const path = require('path');
const { convertProblems } = require('./convert-to-dollar-format');
const { validateProblems } = require('./validate-format');

/**
 * Tworzy backup pliku przed konwersją
 */
function createBackup(originalPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = originalPath.replace('.json', `.backup-${timestamp}.json`);
    
    try {
        fs.copyFileSync(originalPath, backupPath);
        console.log(`✅ Backup utworzony: ${path.basename(backupPath)}`);
        return backupPath;
    } catch (error) {
        console.error(`❌ Błąd tworzenia backupu:`, error.message);
        throw error;
    }
}

/**
 * Wykonuje pełną konwersję wszystkich problemów
 */
function convertAllProblems() {
    console.log('🚀 FAZA 4: PEŁNA KONWERSJA WSZYSTKICH PROBLEMÓW');
    console.log('='.repeat(80));
    
    const originalPath = path.join(__dirname, '../problems.json');
    const convertedPath = path.join(__dirname, '../problems.converted.json');
    const reportPath = path.join(__dirname, 'full-conversion-report.json');
    
    try {
        // 1. Tworzenie backupu
        console.log('📦 Krok 1: Tworzenie backupu...');
        const backupPath = createBackup(originalPath);
        
        // 2. Wczytanie danych
        console.log('📖 Krok 2: Wczytywanie danych...');
        const originalData = fs.readFileSync(originalPath, 'utf8');
        const problems = JSON.parse(originalData);
        
        if (!Array.isArray(problems)) {
            throw new Error('Plik problems.json nie zawiera tablicy problemów');
        }
        
        console.log(`📊 Wczytano ${problems.length} problemów do konwersji`);
        
        // 3. Konwersja
        console.log('🔄 Krok 3: Wykonywanie konwersji...');
        const startTime = Date.now();
        
        const conversionResults = convertProblems(problems);
        
        const conversionTime = Date.now() - startTime;
        console.log(`⏱️  Konwersja zakończona w ${(conversionTime / 1000).toFixed(2)}s`);
        
        // 4. Podstawowe statystyki konwersji
        console.log('\n📈 STATYSTYKI KONWERSJI:');
        console.log(`✅ Udane konwersje: ${conversionResults.stats.converted}`);
        console.log(`❌ Nieudane konwersje: ${conversionResults.stats.failed}`);
        console.log(`📈 Procent sukcesu: ${((conversionResults.stats.converted / conversionResults.stats.total) * 100).toFixed(1)}%`);
        
        // 5. Sprawdzenie czy są błędy konwersji
        if (conversionResults.stats.failed > 0) {
            console.log('\n❌ BŁĘDY KONWERSJI:');
            conversionResults.errors.forEach(error => {
                console.log(`   - ${error.problemId}: ${error.error}`);
            });
        }
        
        // 6. Walidacja przekonwertowanych danych
        console.log('\n🔍 Krok 4: Walidacja przekonwertowanych danych...');
        const validationResults = validateProblems(conversionResults.converted);
        
        console.log('\n📊 STATYSTYKI WALIDACJI:');
        console.log(`✅ Problemy bez błędów: ${validationResults.stats.valid}`);
        console.log(`⚠️  Problemy z błędami: ${validationResults.stats.invalid}`);
        console.log(`📈 Procent poprawności: ${((validationResults.stats.valid / validationResults.stats.total) * 100).toFixed(1)}%`);
        console.log(`🔧 Łączna liczba problemów: ${validationResults.stats.totalIssues}`);
        
        // 7. Analiza najczęstszych problemów
        if (validationResults.stats.invalid > 0) {
            console.log('\n🏗️ NAJCZĘSTSZE PROBLEMY WALIDACJI:');
            const issueTypes = {};
            
            validationResults.problems.forEach(problem => {
                if (!problem.isValid) {
                    problem.issues.forEach(issue => {
                        const issueType = issue.split(':')[0];
                        issueTypes[issueType] = (issueTypes[issueType] || 0) + 1;
                    });
                }
            });
            
            Object.entries(issueTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([type, count]) => {
                    console.log(`   ${count}x ${type}`);
                });
        }
        
        // 8. Zapis przekonwertowanych danych
        console.log('\n💾 Krok 5: Zapisywanie przekonwertowanych danych...');
        fs.writeFileSync(convertedPath, JSON.stringify(conversionResults.converted, null, 2));
        console.log(`✅ Przekonwertowane dane zapisane do: ${path.basename(convertedPath)}`);
        
        // 9. Tworzenie szczegółowego raportu
        console.log('📝 Krok 6: Tworzenie raportu...');
        const fullReport = {
            metadata: {
                timestamp: new Date().toISOString(),
                conversionTime: conversionTime,
                originalFile: path.basename(originalPath),
                convertedFile: path.basename(convertedPath),
                backupFile: path.basename(backupPath)
            },
            conversionResults: {
                stats: conversionResults.stats,
                errors: conversionResults.errors
            },
            validationResults: {
                stats: validationResults.stats,
                summary: validationResults.summary,
                detailedIssues: validationResults.problems
                    .filter(p => !p.isValid)
                    .slice(0, 10) // Pierwsze 10 problemów z błędami
            },
            recommendations: generateRecommendations(conversionResults, validationResults)
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
        console.log(`✅ Szczegółowy raport zapisany do: ${path.basename(reportPath)}`);
        
        // 10. Podsumowanie i rekomendacje
        console.log('\n' + '='.repeat(80));
        console.log('📋 PODSUMOWANIE PEŁNEJ KONWERSJI');
        console.log('='.repeat(80));
        
        const overallSuccess = conversionResults.stats.failed === 0 && 
                               validationResults.stats.invalid < (validationResults.stats.total * 0.1);
        
        if (overallSuccess) {
            console.log('🎉 KONWERSJA ZAKOŃCZONA SUKCESEM!');
            console.log('✅ Dane gotowe do użycia w produkcji');
            console.log('✅ Można przejść do FAZY 5 (integracji)');
        } else if (conversionResults.stats.failed === 0) {
            console.log('⚠️  KONWERSJA CZĘŚCIOWO UDANA');
            console.log('✅ Wszystkie konwersje przeszły bez błędów');
            console.log('⚠️  Występują problemy walidacji - wymaga przeglądu');
            console.log('🔧 Zalecane ręczne poprawki najważniejszych przypadków');
        } else {
            console.log('❌ KONWERSJA WYMAGA POPRAWEK');
            console.log('❌ Wystąpiły błędy konwersji - wymagana naprawa');
            console.log('🔧 Sprawdź błędy przed dalszym postępowaniem');
        }
        
        console.log('\n📁 WYGENEROWANE PLIKI:');
        console.log(`   - Backup: ${path.basename(backupPath)}`);
        console.log(`   - Przekonwertowane: ${path.basename(convertedPath)}`);
        console.log(`   - Raport: ${path.basename(reportPath)}`);
        
        return fullReport;
        
    } catch (error) {
        console.error('\n❌ KRYTYCZNY BŁĄD KONWERSJI:');
        console.error(error.message);
        console.error('\n🔧 AKCJE NAPRAWCZE:');
        console.error('1. Sprawdź format danych wejściowych');
        console.error('2. Upewnij się że backup został utworzony');
        console.error('3. Sprawdź logi błędów powyżej');
        
        throw error;
    }
}

/**
 * Generuje rekomendacje na podstawie wyników konwersji i walidacji
 */
function generateRecommendations(conversionResults, validationResults) {
    const recommendations = [];
    
    // Rekomendacje dot. konwersji
    if (conversionResults.stats.failed === 0) {
        recommendations.push('✅ Wszystkie konwersje przeszły pomyślnie');
    } else {
        recommendations.push(`❌ ${conversionResults.stats.failed} problemów wymaga ręcznej naprawy`);
    }
    
    // Rekomendacje dot. walidacji
    const errorRate = (validationResults.stats.invalid / validationResults.stats.total) * 100;
    
    if (errorRate === 0) {
        recommendations.push('✅ Wszystkie dane przeszły walidację');
    } else if (errorRate < 5) {
        recommendations.push('⚠️ Niewielkie błędy walidacji - można kontynuować');
    } else if (errorRate < 15) {
        recommendations.push('⚠️ Umiarkowane błędy walidacji - zalecany przegląd');
    } else {
        recommendations.push('❌ Wysokie błędy walidacji - wymagane poprawki');
    }
    
    // Rekomendacje dot. kolejnych kroków
    if (errorRate < 10 && conversionResults.stats.failed === 0) {
        recommendations.push('📈 GOTOWE: Można przejść do FAZY 5 (integracja z React)');
    } else {
        recommendations.push('🔧 WYMAGANE: Poprawki przed przejściem do kolejnej fazy');
    }
    
    return recommendations;
}

/**
 * Rollback function - przywraca oryginalny plik z backupu
 */
function rollbackConversion(backupFileName) {
    const backupPath = path.join(__dirname, backupFileName);
    const originalPath = path.join(__dirname, '../problems.json');
    
    try {
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup ${backupFileName} nie istnieje`);
        }
        
        fs.copyFileSync(backupPath, originalPath);
        console.log(`✅ Rollback wykonany z backupu: ${backupFileName}`);
    } catch (error) {
        console.error(`❌ Błąd rollback:`, error.message);
        throw error;
    }
}

// Export funkcji
module.exports = { 
    convertAllProblems, 
    rollbackConversion,
    createBackup
};

// Uruchom jeśli wykonywany bezpośrednio
if (require.main === module) {
    try {
        const report = convertAllProblems();
        console.log('\n🏁 Konwersja zakończona. Sprawdź raport powyżej.');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Konwersja nieudana:', error.message);
        process.exit(1);
    }
}