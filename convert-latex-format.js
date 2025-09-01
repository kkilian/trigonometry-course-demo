const fs = require('fs');

// Read the problems file
const problems = JSON.parse(fs.readFileSync('src/data/problems.json', 'utf8'));

// Function to convert LaTeX format
function convertLatexFormat(text) {
    if (!text) return text;
    
    // Remove \( and \) delimiters around math expressions
    let result = text.replace(/\\\(/g, '').replace(/\\\)/g, '');
    
    // Now we need to wrap Polish text in \text{} while preserving math
    // This is complex because we need to identify what is math vs text
    
    // Common patterns that indicate math content
    const mathPatterns = [
        // Greek letters
        /\\alpha|\\beta|\\gamma|\\delta|\\epsilon|\\theta|\\pi|\\omega|\\phi/,
        // Math operators and symbols
        /\\sin|\\cos|\\tan|\\cot|\\sec|\\csc|\\frac|\\sqrt|\\cdot|\\times|\\div/,
        /\\leq|\\geq|\\neq|\\approx|\\pm|\\mp|\\infty|\\partial|\\nabla/,
        // Superscripts and subscripts
        /\^|\_{/,
        // Math environments
        /\\left|\\right|\\begin|\\end/,
        // Numbers with math context
        /\d+°|\d+\^/
    ];
    
    // Split by common math delimiters and process each part
    // We'll use a more sophisticated approach
    
    // First, protect all LaTeX commands and math expressions
    const mathBlocks = [];
    let protectedText = result;
    
    // Protect fractions
    protectedText = protectedText.replace(/\\frac\{[^}]*\}\{[^}]*\}/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Protect other LaTeX commands with arguments
    protectedText = protectedText.replace(/(\\[a-zA-Z]+)(\{[^}]*\})?/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Protect standalone math symbols and expressions
    protectedText = protectedText.replace(/([a-zA-Z])\^(\{[^}]*\}|\d+)/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    protectedText = protectedText.replace(/([a-zA-Z])_(\{[^}]*\}|\d+)/g, (match) => {
        mathBlocks.push(match);  
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Protect degree symbols
    protectedText = protectedText.replace(/\d+°/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Protect equals and math operators with surrounding context
    protectedText = protectedText.replace(/\s*[=<>≤≥±∓+\-*/]\s*/g, (match) => {
        mathBlocks.push(match);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Protect single letters that are likely variables (surrounded by spaces or math)
    protectedText = protectedText.replace(/\b([a-z])\b/g, (match, letter) => {
        // Check if it's likely a variable (single letter)
        if (letter.length === 1 && !'aiouwz'.includes(letter)) {
            mathBlocks.push(letter);
            return `__MATH_${mathBlocks.length - 1}__`;
        }
        return match;
    });
    
    // Now wrap remaining text in \text{} if it's not already wrapped
    // Split by protected math blocks
    let parts = protectedText.split(/(__MATH_\d+__)/);
    let finalResult = '';
    
    for (let part of parts) {
        if (part.startsWith('__MATH_')) {
            // Restore math block
            const index = parseInt(part.match(/\d+/)[0]);
            finalResult += mathBlocks[index];
        } else if (part.trim()) {
            // This is text that needs to be wrapped
            // Skip if already wrapped in \text{}
            if (!part.includes('\\text{')) {
                finalResult += `\\text{${part}}`;
            } else {
                finalResult += part;
            }
        }
    }
    
    return finalResult;
}

// Function to convert a problem
function convertProblem(problem) {
    // Only process problems with ID >= 175
    const problemId = parseInt(problem.id);
    if (problemId < 175 || problemId > 230) {
        return problem;
    }
    
    console.log(`Converting problem ${problem.id}`);
    
    // Convert statement
    if (problem.statement) {
        problem.statement = convertLatexFormat(problem.statement);
    }
    
    // Convert steps
    if (problem.steps) {
        problem.steps = problem.steps.map(step => {
            if (step.hint) step.hint = convertLatexFormat(step.hint);
            if (step.expression) step.expression = convertLatexFormat(step.expression);
            if (step.explanation) step.explanation = convertLatexFormat(step.explanation);
            return step;
        });
    }
    
    return problem;
}

// Convert all problems
const convertedProblems = problems.map(convertProblem);

// Write back to file
fs.writeFileSync('src/data/problems.json', JSON.stringify(convertedProblems, null, 2));

console.log('Conversion complete!');