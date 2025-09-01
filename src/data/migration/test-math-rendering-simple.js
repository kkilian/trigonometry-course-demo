/**
 * Prosty test renderowania matematyki - dostosowany do aktualnego UI
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testMathRendering() {
    console.log('🧪 TEST RENDEROWANIA MATEMATYKI (UPROSZCZONY)');
    console.log('='.repeat(80));
    
    let browser;
    
    try {
        // 1. Uruchom przeglądarkę
        console.log('🚀 Uruchamianie przeglądarki...');
        browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: { width: 1280, height: 800 }
        });
        
        const page = await browser.newPage();
        
        // 2. Otwórz aplikację
        console.log('📱 Otwieranie aplikacji...');
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Zrób screenshot strony głównej
        await page.screenshot({ 
            path: path.join(__dirname, 'test-01-home.png'),
            fullPage: true 
        });
        console.log('📸 Screenshot strony głównej: test-01-home.png');
        
        // 4. Kliknij w "LISTA ZADAŃ"
        console.log('🎯 Klikanie w LISTA ZADAŃ...');
        
        const clicked = await page.evaluate(() => {
            // Znajdź element z tekstem "LISTA ZADAŃ"
            const elements = Array.from(document.querySelectorAll('*'));
            const listaZadan = elements.find(el => 
                el.textContent && 
                el.textContent.includes('LISTA ZADAŃ') &&
                el.textContent.includes('175 zadań')
            );
            
            if (listaZadan) {
                // Znajdź najbliższy klikalny element (div lub button)
                let clickable = listaZadan;
                while (clickable && clickable.tagName !== 'BUTTON' && clickable.tagName !== 'DIV') {
                    clickable = clickable.parentElement;
                }
                if (clickable) {
                    clickable.click();
                    return true;
                }
            }
            return false;
        });
        
        if (!clicked) {
            console.log('⚠️  Nie udało się kliknąć w LISTA ZADAŃ, próbuję alternatywę...');
            // Spróbuj kliknąć pierwszy div/button
            await page.click('div:has-text("LISTA ZADAŃ")').catch(() => {});
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 5. Screenshot po kliknięciu
        await page.screenshot({ 
            path: path.join(__dirname, 'test-02-after-click.png'),
            fullPage: true 
        });
        console.log('📸 Screenshot po kliknięciu: test-02-after-click.png');
        
        // 6. Sprawdź czy są elementy KaTeX
        console.log('\n🔬 Sprawdzanie elementów KaTeX...');
        
        const katexAnalysis = await page.evaluate(() => {
            const katexElements = document.querySelectorAll('.katex');
            const katexHtml = document.querySelectorAll('.katex-html');
            const mathElements = document.querySelectorAll('[class*="math"]');
            
            // Zbierz tekst matematyczny
            const mathTexts = [];
            katexElements.forEach(el => {
                const text = el.textContent;
                if (text && text.trim()) {
                    mathTexts.push(text.trim());
                }
            });
            
            // Sprawdź też czy są jakieś wzory matematyczne w tekście
            const allText = document.body.innerText;
            const hasDollarSigns = allText.includes('$');
            const hasBackslash = allText.includes('\\');
            const hasFrac = allText.includes('frac');
            const hasPi = allText.includes('π') || allText.includes('\\pi');
            const hasDegrees = allText.includes('°');
            
            return {
                katexCount: katexElements.length,
                katexHtmlCount: katexHtml.length,
                mathElementsCount: mathElements.length,
                sampleMath: mathTexts.slice(0, 5),
                pageTitle: document.title,
                indicators: {
                    hasDollarSigns,
                    hasBackslash,
                    hasFrac,
                    hasPi,
                    hasDegrees
                },
                // Pobierz fragment tekstu ze strony
                sampleText: allText.substring(0, 500)
            };
        });
        
        console.log('\n📊 ANALIZA STRONY:');
        console.log(`📄 Tytuł: ${katexAnalysis.pageTitle}`);
        console.log(`🔢 Elementy .katex: ${katexAnalysis.katexCount}`);
        console.log(`🔢 Elementy .katex-html: ${katexAnalysis.katexHtmlCount}`);
        console.log(`🔢 Elementy z klasą math: ${katexAnalysis.mathElementsCount}`);
        
        console.log('\n🔍 WSKAŹNIKI MATEMATYKI:');
        console.log(`  $ (dolary): ${katexAnalysis.indicators.hasDollarSigns ? '✅' : '❌'}`);
        console.log(`  \\ (backslash): ${katexAnalysis.indicators.hasBackslash ? '✅' : '❌'}`);
        console.log(`  frac: ${katexAnalysis.indicators.hasFrac ? '✅' : '❌'}`);
        console.log(`  π/pi: ${katexAnalysis.indicators.hasPi ? '✅' : '❌'}`);
        console.log(`  ° (stopnie): ${katexAnalysis.indicators.hasDegrees ? '✅' : '❌'}`);
        
        if (katexAnalysis.sampleMath.length > 0) {
            console.log('\n✨ PRZYKŁADY WYRENDEROWANEJ MATEMATYKI:');
            katexAnalysis.sampleMath.forEach((math, i) => {
                console.log(`  ${i + 1}. "${math}"`);
            });
        }
        
        console.log('\n📝 FRAGMENT TEKSTU ZE STRONY:');
        console.log(katexAnalysis.sampleText);
        
        // 7. Spróbuj kliknąć w pierwszy problem (jeśli jest lista)
        console.log('\n🖱️ Próba otwarcia pierwszego problemu...');
        
        const problemClicked = await page.evaluate(() => {
            // Szukaj elementów które wyglądają jak problemy
            const possibleProblems = document.querySelectorAll('button, div[role="button"], .cursor-pointer');
            
            for (let elem of possibleProblems) {
                // Szukaj czegoś co wygląda jak problem matematyczny
                if (elem.textContent && 
                    (elem.textContent.includes('stopni') || 
                     elem.textContent.includes('radian') ||
                     elem.textContent.includes('kąt') ||
                     elem.textContent.includes('°'))) {
                    elem.click();
                    return true;
                }
            }
            return false;
        });
        
        if (problemClicked) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ 
                path: path.join(__dirname, 'test-03-problem.png'),
                fullPage: true 
            });
            console.log('📸 Screenshot problemu: test-03-problem.png');
            
            // Sprawdź matematykę w problemie
            const problemKatex = await page.evaluate(() => {
                return {
                    katexCount: document.querySelectorAll('.katex').length,
                    hasSteps: document.querySelectorAll('[class*="step"]').length > 0
                };
            });
            
            console.log(`✅ KaTeX w problemie: ${problemKatex.katexCount} elementów`);
            console.log(`✅ Ma kroki: ${problemKatex.hasSteps ? 'TAK' : 'NIE'}`);
        }
        
        // 8. Podsumowanie
        console.log('\n' + '='.repeat(80));
        console.log('📊 PODSUMOWANIE');
        console.log('='.repeat(80));
        
        if (katexAnalysis.katexCount > 0) {
            console.log('✅ SUKCES: React-KaTeX renderuje matematykę!');
            console.log(`✅ Znaleziono ${katexAnalysis.katexCount} elementów KaTeX`);
        } else if (katexAnalysis.indicators.hasPi || katexAnalysis.indicators.hasDegrees) {
            console.log('⚠️ CZĘŚCIOWY SUKCES: Matematyka obecna ale może nie być renderowana przez KaTeX');
            console.log('🔧 Sprawdź screenshoty dla wizualnej weryfikacji');
        } else {
            console.log('❌ PROBLEM: Brak elementów KaTeX');
            console.log('🔧 Sprawdź czy dane są poprawnie załadowane');
        }
        
        console.log('\n📸 WYGENEROWANE SCREENSHOTY:');
        console.log('  1. test-01-home.png - strona główna');
        console.log('  2. test-02-after-click.png - po kliknięciu w LISTA ZADAŃ');
        console.log('  3. test-03-problem.png - szczegóły problemu (jeśli dostępne)');
        
    } catch (error) {
        console.error('\n❌ BŁĄD TESTU:', error.message);
        console.error(error.stack);
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