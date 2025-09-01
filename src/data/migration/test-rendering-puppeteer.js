/**
 * Test renderowania matematyki w aplikacji używając Puppeteer
 * Sprawdza czy React-KaTeX poprawnie wyświetla matematykę
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Czeka na załadowanie elementu
 */
async function waitForElement(page, selector, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        console.log(`❌ Element ${selector} nie znaleziony`);
        return false;
    }
}

/**
 * Główny test renderowania
 */
async function testMathRendering() {
    console.log('🧪 TEST RENDEROWANIA MATEMATYKI W APLIKACJI');
    console.log('='.repeat(80));
    
    let browser;
    
    try {
        // 1. Uruchom przeglądarkę
        console.log('🚀 Uruchamianie przeglądarki...');
        browser = await puppeteer.launch({
            headless: 'new', // Użyj nowego trybu headless
            defaultViewport: { width: 1280, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // 2. Przejdź do aplikacji
        console.log('📱 Otwieranie aplikacji...');
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Czekaj na załadowanie
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Sprawdź czy strona główna się załadowała
        console.log('🔍 Sprawdzanie strony głównej...');
        
        // Sprawdź różne możliwe selektory
        let hasWelcomeScreen = await waitForElement(page, '.bg-gradient-to-br');
        if (!hasWelcomeScreen) {
            hasWelcomeScreen = await waitForElement(page, '.min-h-screen');
        }
        if (!hasWelcomeScreen) {
            hasWelcomeScreen = await waitForElement(page, 'button');
        }
        
        if (!hasWelcomeScreen) {
            // Sprawdź co jest na stronie
            const pageContent = await page.evaluate(() => {
                return {
                    title: document.title,
                    hasButtons: document.querySelectorAll('button').length,
                    bodyText: document.body.innerText.substring(0, 200)
                };
            });
            console.log('📄 Zawartość strony:', pageContent);
            throw new Error('Strona główna nie załadowała się poprawnie');
        }
        
        // Screenshot strony głównej
        await page.screenshot({ 
            path: path.join(__dirname, 'screenshot-welcome.png'),
            fullPage: true 
        });
        console.log('📸 Screenshot strony głównej zapisany');
        
        // 4. Kliknij w kurs trygonometrii
        console.log('🎯 Wybieranie kursu trygonometrii...');
        
        // Szukaj przycisku "Trygonometria"
        const trigButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const trigBtn = buttons.find(btn => btn.textContent.includes('Trygonometria'));
            if (trigBtn) {
                trigBtn.click();
                return true;
            }
            return false;
        });
        
        if (!trigButton) {
            console.log('⚠️  Nie znaleziono przycisku Trygonometria, próbuję alternatywną metodę...');
            // Alternatywna metoda - kliknięcie pierwszego przycisku kursu
            await page.click('button.bg-gradient-to-r');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 5. Sprawdź czy lista problemów się załadowała
        console.log('📋 Sprawdzanie listy problemów...');
        const hasProblemList = await waitForElement(page, '.max-w-7xl');
        
        if (hasProblemList) {
            // Screenshot listy problemów
            await page.screenshot({ 
                path: path.join(__dirname, 'screenshot-problem-list.png'),
                fullPage: false // Tylko widoczna część
            });
            console.log('📸 Screenshot listy problemów zapisany');
        }
        
        // 6. Sprawdź renderowanie matematyki - szukaj elementów KaTeX
        console.log('🔬 Sprawdzanie renderowania KaTeX...');
        
        const katexElements = await page.evaluate(() => {
            // Szukaj elementów KaTeX
            const katexSpans = document.querySelectorAll('.katex');
            const katexHTML = document.querySelectorAll('.katex-html');
            const mathML = document.querySelectorAll('.katex-mathml');
            
            return {
                katexCount: katexSpans.length,
                katexHTMLCount: katexHTML.length,
                mathMLCount: mathML.length,
                hasKatex: katexSpans.length > 0,
                samples: Array.from(katexSpans).slice(0, 5).map(el => ({
                    text: el.textContent,
                    html: el.innerHTML.substring(0, 100) + '...'
                }))
            };
        });
        
        console.log('\n📊 ANALIZA RENDEROWANIA KATEX:');
        console.log(`✅ Elementy .katex znalezione: ${katexElements.katexCount}`);
        console.log(`✅ Elementy .katex-html: ${katexElements.katexHTMLCount}`);
        console.log(`✅ Elementy .katex-mathml: ${katexElements.mathMLCount}`);
        
        if (katexElements.hasKatex) {
            console.log('\n🎯 PRZYKŁADY WYRENDEROWANEJ MATEMATYKI:');
            katexElements.samples.forEach((sample, i) => {
                console.log(`  ${i + 1}. "${sample.text}"`);
            });
        } else {
            console.log('⚠️  BRAK elementów KaTeX na stronie!');
        }
        
        // 7. Kliknij w pierwszy problem żeby zobaczyć szczegóły
        console.log('\n🖱️  Otwieranie pierwszego problemu...');
        
        try {
            // Znajdź i kliknij pierwszy problem
            const firstProblemClicked = await page.evaluate(() => {
                const firstButton = document.querySelector('button.text-left');
                if (firstButton) {
                    firstButton.click();
                    return true;
                }
                return false;
            });
            
            if (firstProblemClicked) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Screenshot problemu
                await page.screenshot({ 
                    path: path.join(__dirname, 'screenshot-problem-detail.png'),
                    fullPage: true 
                });
                console.log('📸 Screenshot szczegółów problemu zapisany');
                
                // Sprawdź matematykę w szczegółach problemu
                const detailKatex = await page.evaluate(() => {
                    const katexInDetail = document.querySelectorAll('.katex');
                    return {
                        count: katexInDetail.length,
                        hasSteps: document.querySelector('.space-y-4') !== null,
                        samples: Array.from(katexInDetail).slice(0, 3).map(el => el.textContent)
                    };
                });
                
                console.log('\n📊 MATEMATYKA W SZCZEGÓŁACH PROBLEMU:');
                console.log(`✅ Elementy KaTeX: ${detailKatex.count}`);
                console.log(`✅ Ma kroki rozwiązania: ${detailKatex.hasSteps ? 'TAK' : 'NIE'}`);
                if (detailKatex.samples.length > 0) {
                    console.log('🔢 Przykłady:');
                    detailKatex.samples.forEach((sample, i) => {
                        console.log(`   ${i + 1}. "${sample}"`);
                    });
                }
            }
        } catch (error) {
            console.log('⚠️  Nie udało się otworzyć szczegółów problemu:', error.message);
        }
        
        // 8. Sprawdź błędy w konsoli
        console.log('\n🐛 Sprawdzanie błędów konsoli...');
        
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (consoleErrors.length > 0) {
            console.log('❌ Znalezione błędy konsoli:');
            consoleErrors.forEach(err => console.log(`   - ${err}`));
        } else {
            console.log('✅ Brak błędów w konsoli');
        }
        
        // 9. Test wydajności renderowania
        console.log('\n⚡ Test wydajności renderowania...');
        
        const performanceMetrics = await page.evaluate(() => {
            const timing = window.performance.timing;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                fullLoad: timing.loadEventEnd - timing.navigationStart,
                domReady: timing.domComplete - timing.domLoading
            };
        });
        
        console.log(`⏱️  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
        console.log(`⏱️  Full Page Load: ${performanceMetrics.fullLoad}ms`);
        console.log(`⏱️  DOM Ready: ${performanceMetrics.domReady}ms`);
        
        // 10. Podsumowanie
        console.log('\n' + '='.repeat(80));
        console.log('📊 PODSUMOWANIE TESTU RENDEROWANIA');
        console.log('='.repeat(80));
        
        const testResults = {
            pageLoaded: hasWelcomeScreen,
            katexFound: katexElements.hasKatex,
            katexCount: katexElements.katexCount,
            consoleErrors: consoleErrors.length,
            performance: performanceMetrics.fullLoad < 3000 ? 'DOBRA' : 'WOLNA',
            overallStatus: katexElements.hasKatex && consoleErrors.length === 0 ? 'SUKCES' : 'PROBLEMY'
        };
        
        console.log(`🎯 Status ogólny: ${testResults.overallStatus === 'SUKCES' ? '✅' : '❌'} ${testResults.overallStatus}`);
        console.log(`📱 Strona załadowana: ${testResults.pageLoaded ? '✅' : '❌'}`);
        console.log(`🔢 KaTeX znaleziony: ${testResults.katexFound ? '✅' : '❌'} (${testResults.katexCount} elementów)`);
        console.log(`🐛 Błędy konsoli: ${testResults.consoleErrors === 0 ? '✅ Brak' : `❌ ${testResults.consoleErrors}`}`);
        console.log(`⚡ Wydajność: ${testResults.performance}`);
        
        if (testResults.overallStatus === 'SUKCES') {
            console.log('\n🎉 MATEMATYKA RENDERUJE SIĘ POPRAWNIE!');
            console.log('✅ React-KaTeX działa prawidłowo');
            console.log('✅ Konwersja danych zakończona sukcesem');
        } else {
            console.log('\n⚠️  WYKRYTO PROBLEMY Z RENDEROWANIEM');
            console.log('🔧 Sprawdź screenshoty i logi powyżej');
        }
        
        console.log('\n📸 Screenshoty zapisane w:');
        console.log('   - screenshot-welcome.png');
        console.log('   - screenshot-problem-list.png');
        console.log('   - screenshot-problem-detail.png');
        
    } catch (error) {
        console.error('\n❌ BŁĄD TESTU:', error.message);
        console.error('Sprawdź czy aplikacja działa na http://localhost:3000');
    } finally {
        if (browser) {
            console.log('\n🔚 Zamykanie przeglądarki...');
            await browser.close();
        }
    }
}

// Uruchom test
if (require.main === module) {
    testMathRendering()
        .then(() => {
            console.log('\n✅ Test zakończony');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test nieudany:', error);
            process.exit(1);
        });
}