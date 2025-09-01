/**
 * Pomocnicze funkcje dla konwersji formatu LaTeX
 * Z \text{...} na $...$
 */

/**
 * Usuwa wrapper \text{...} zachowując zawartość
 * Obsługuje zagnieżdżone nawiasy klamrowe
 */
function removeTextWrapper(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    let result = text;
    let hasChanges = true;
    
    // Powtarzaj dopóki są zmiany (dla zagnieżdżonych przypadków)
    while (hasChanges) {
        hasChanges = false;
        
        // Znajdź wszystkie \text{...} z prawidłowym balansem nawiasów
        const regex = /\\text\{/g;
        let match;
        
        while ((match = regex.exec(result)) !== null) {
            const startPos = match.index;
            let braceCount = 0;
            let pos = startPos + 6; // za "\text{"
            let foundClose = false;
            
            // Znajdź odpowiadający nawias zamykający
            while (pos < result.length) {
                if (result[pos] === '{') {
                    braceCount++;
                } else if (result[pos] === '}') {
                    if (braceCount === 0) {
                        // Znaleźliśmy zamykający nawias dla \text{
                        const before = result.substring(0, startPos);
                        const content = result.substring(startPos + 6, pos); // między { i }
                        const after = result.substring(pos + 1);
                        
                        result = before + content + after;
                        hasChanges = true;
                        foundClose = true;
                        break;
                    } else {
                        braceCount--;
                    }
                }
                pos++;
            }
            
            if (foundClose) {
                break; // Zrestartuj regex search
            }
        }
    }
    
    return result;
}

/**
 * Identyfikuje matematykę i opakowuje w $...$
 * Nowa strategia: znajdowanie większych, spójnych wyrażeń matematycznych
 */
function wrapMathInDollars(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    let result = text;
    
    // Krok 1: Znajdź i zaznacz KOMPLETNE wyrażenia matematyczne
    // Używamy bardziej inteligentnego podejścia do grupowania
    
    // Lista wzorców do identyfikowania matematyki - skupiamy się na większych blokach
    const mathPatterns = [
        // Kompletne równania: 18° = \frac{\pi}{10} radianów
        {
            regex: /\d+[°]*\s*=\s*[^.!?]*?(?:\s+(?:radianów?|rad)(?:\s|$|[.!?]))/g,
            type: 'equation'
        },
        // Wyrażenia z funkcjami tryg: \sin(30°) = \frac{1}{2}
        {
            regex: /\\(?:sin|cos|tan|cot|sec|csc)\s*\([^)]*\)(?:\s*[=+\-*/]\s*[^.!?]*?(?=\s|$|[.!?]))?/g,
            type: 'trigonometric'
        },
        // Ułamki z kontekstem: \frac{\pi}{2} radianów
        {
            regex: /\\frac\s*\{[^}]*\}\s*\{[^}]*\}(?:\s+\S+)?/g,
            type: 'fraction'
        },
        // Wyrażenia arytmetyczne: 3 · 180°, 360°/180
        {
            regex: /\d+\s*[·\*\./]\s*\d+[°]*|\d+[°]*\s*[·\*/]\s*[^\s,.!?]+/g,
            type: 'arithmetic'
        },
        // Proste równania: x = 30°, \alpha = 30°  
        {
            regex: /[a-zA-Z\\]+\w*\s*=\s*\d+[°]*|\d+[°]*\s*=\s*[a-zA-Z\\]+\w*/g,
            type: 'simple_equation'
        },
        // Pojedyncze litery greckie z wartościami: \pi, \alpha
        {
            regex: /\\(?:alpha|beta|gamma|delta|epsilon|theta|pi|omega|phi|lambda|mu|sigma|rho)(?:\s*[=]\s*\S+)?/g,
            type: 'greek'
        },
        // Liczby ze stopniami
        {
            regex: /\d+°/g,
            type: 'degrees'
        }
    ];
    
    // Zaznacz wszystkie bloki matematyczne
    const MATH_MARKER = '§MATH§';
    let mathBlocks = [];
    let blockIndex = 0;
    
    for (const pattern of mathPatterns) {
        result = result.replace(pattern.regex, (match) => {
            // Nie przetwarzaj jeśli już jest w bloku matematycznym lub ma dolary
            if (match.includes(MATH_MARKER) || match.includes('$')) {
                return match;
            }
            
            const marker = `${MATH_MARKER}${blockIndex}${MATH_MARKER}`;
            mathBlocks[blockIndex] = match.trim();
            blockIndex++;
            return marker;
        });
    }
    
    // Zamień markery na wyrażenia w dolarach
    for (let i = 0; i < blockIndex; i++) {
        const marker = `${MATH_MARKER}${i}${MATH_MARKER}`;
        result = result.replace(marker, `$${mathBlocks[i]}$`);
    }
    
    return result;
}

/**
 * Czyści nadmiarowe spacje i formatuje tekst
 */
function cleanupSpaces(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    return text
        .replace(/\s+/g, ' ') // Wielokrotne spacje na jedną
        .replace(/\$\s+([^$]+)\s+\$/g, '$$$1$$') // Usuń spacje wewnątrz wyrażeń dolarowych
        .replace(/\$\$/g, '') // Usuń puste $$ pary
        .trim();
}

/**
 * Waliduje czy konwersja była poprawna
 */
function validateConversion(originalText, convertedText) {
    const issues = [];
    
    if (!convertedText) {
        issues.push('Converted text is empty');
        return { isValid: false, issues };
    }
    
    // Sprawdź czy zostały jakieś \text{}
    if (convertedText.includes('\\text{')) {
        issues.push('Still contains \\text{} after conversion');
    }
    
    // Sprawdź balans dolarów
    const dollarCount = (convertedText.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
        issues.push('Unbalanced dollar signs');
    }
    
    // Sprawdź czy nie ma pustych $$ par
    if (convertedText.includes('$$')) {
        issues.push('Contains empty $$ pairs');
    }
    
    return {
        isValid: issues.length === 0,
        issues
    };
}

module.exports = {
    removeTextWrapper,
    wrapMathInDollars,
    cleanupSpaces,
    validateConversion
};