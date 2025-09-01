const fs = require('fs');

// Read the problems file
const problemsData = fs.readFileSync('src/data/problems.json', 'utf8');
const problems = JSON.parse(problemsData);

// Function to convert LaTeX format - much simpler approach
function convertLatexFormat(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Step 1: Remove \( and \) delimiters
    let result = text.replace(/\\\(/g, '').replace(/\\\)/g, '');
    
    // Step 2: For the specific problems format, we need a different approach
    // These problems have mixed Polish text and math, we need to be careful
    
    // If the text already has \text{}, don't process it
    if (result.includes('\\text{')) {
        return result;
    }
    
    // For these specific problems, we'll manually handle the most common patterns
    // This is a simplified approach that should work for most cases
    
    // Pattern 1: Text at the beginning until first math expression
    // Pattern 2: Text between math expressions
    // We'll use a state machine approach
    
    let output = '';
    let i = 0;
    let inMath = false;
    let currentText = '';
    
    while (i < result.length) {
        // Check for LaTeX command start
        if (result[i] === '\\' && i + 1 < result.length && /[a-zA-Z]/.test(result[i + 1])) {
            // We're entering a math command
            if (currentText.trim()) {
                output += `\\text{${currentText}}`;
                currentText = '';
            }
            
            // Find the end of the command
            let cmdStart = i;
            i += 2; // Skip \\ and first letter
            while (i < result.length && /[a-zA-Z]/.test(result[i])) {
                i++;
            }
            
            // Get the command
            let cmd = result.substring(cmdStart, i);
            output += cmd;
            
            // Handle arguments if any
            while (i < result.length && result[i] === ' ') i++;
            if (i < result.length && result[i] === '{') {
                // Find matching closing brace
                let braceCount = 1;
                let argStart = i;
                i++;
                while (i < result.length && braceCount > 0) {
                    if (result[i] === '{') braceCount++;
                    else if (result[i] === '}') braceCount--;
                    i++;
                }
                output += result.substring(argStart, i);
            }
            
        } else if (result[i] === '^' || result[i] === '_') {
            // Superscript or subscript - this is math
            if (currentText.trim()) {
                // Check if the last character is a variable
                let lastChar = currentText[currentText.length - 1];
                if (/[a-zA-Z]/.test(lastChar)) {
                    // The variable is part of math
                    output += `\\text{${currentText.slice(0, -1)}}`;
                    output += lastChar;
                } else {
                    output += `\\text{${currentText}}`;
                }
                currentText = '';
            }
            
            output += result[i];
            i++;
            
            // Handle the argument
            if (i < result.length && result[i] === '{') {
                let braceCount = 1;
                let argStart = i;
                i++;
                while (i < result.length && braceCount > 0) {
                    if (result[i] === '{') braceCount++;
                    else if (result[i] === '}') braceCount--;
                    i++;
                }
                output += result.substring(argStart, i);
            } else if (i < result.length) {
                // Single character superscript/subscript
                output += result[i];
                i++;
            }
            
        } else if (result[i] === '=' || (result[i] === '<' && i + 1 < result.length && result[i + 1] !== ' ') || 
                   (result[i] === '>' && i + 1 < result.length && result[i + 1] !== ' ')) {
            // Math operators
            if (currentText.trim()) {
                // Check if we have a variable before the operator
                let trimmed = currentText.trim();
                let lastWord = trimmed.match(/([a-zA-Z]+)\s*$/);
                if (lastWord && lastWord[1].length === 1) {
                    // Single letter before operator is likely a variable
                    let beforeVar = trimmed.substring(0, trimmed.length - lastWord[0].length);
                    if (beforeVar) {
                        output += `\\text{${beforeVar}}`;
                    }
                    output += lastWord[1];
                } else if (trimmed) {
                    output += `\\text{${trimmed}}`;
                }
                currentText = '';
            }
            output += result[i];
            i++;
            
        } else if (/[a-zA-Z]/.test(result[i]) && currentText === '' && output.length > 0) {
            // Check if this is a single letter variable
            let j = i;
            while (j < result.length && /[a-zA-Z]/.test(result[j])) {
                j++;
            }
            let word = result.substring(i, j);
            
            // Check what comes after
            let nextChar = j < result.length ? result[j] : '';
            if (word.length === 1 && (nextChar === '^' || nextChar === '_' || nextChar === '=' || 
                nextChar === ',' || nextChar === ')' || nextChar === '}' || /\s/.test(nextChar))) {
                // Single letter followed by math operator - it's a variable
                output += word;
                i = j;
            } else {
                // Start collecting text
                currentText += result[i];
                i++;
            }
        } else {
            // Regular character - add to current text
            currentText += result[i];
            i++;
        }
    }
    
    // Add any remaining text
    if (currentText.trim()) {
        output += `\\text{${currentText}}`;
    }
    
    return output;
}

// Simpler approach - read original file and do targeted replacements
function simpleConvert(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Remove \( and \) 
    let result = text.replace(/\\\(/g, '').replace(/\\\)/g, '');
    
    // Don't process if already has \text{}
    if (result.includes('\\text{')) {
        return result;
    }
    
    // For these math-heavy problems, wrap the entire non-math parts in \text{}
    // This is the safest approach
    
    // Common patterns in these problems:
    // 1. Polish text at start, then math
    // 2. Polish text with embedded variables
    
    // Protect math expressions temporarily
    const mathProtections = [];
    
    // Protect LaTeX commands and their arguments
    result = result.replace(/(\\[a-zA-Z]+(?:\{[^}]*\})*)/g, (match) => {
        mathProtections.push(match);
        return `@@MATH${mathProtections.length - 1}@@`;
    });
    
    // Protect single letters that are likely variables (with sub/superscripts)
    result = result.replace(/([a-zA-Z])([_^](?:\{[^}]*\}|[a-zA-Z0-9]))/g, (match) => {
        mathProtections.push(match);
        return `@@MATH${mathProtections.length - 1}@@`;
    });
    
    // Protect math operators with surrounding spaces
    result = result.replace(/(\s*[=<>+\-*/]\s*)/g, (match) => {
        mathProtections.push(match);
        return `@@MATH${mathProtections.length - 1}@@`;
    });
    
    // Protect single letters between spaces or punctuation (likely variables)
    result = result.replace(/([^a-zA-Z])([a-z])([^a-zA-Z])/g, (match, before, letter, after) => {
        if (!'aiouwz'.includes(letter)) { // Not Polish words like 'a', 'i', 'o', 'w', 'z'
            mathProtections.push(letter);
            return before + `@@MATH${mathProtections.length - 1}@@` + after;
        }
        return match;
    });
    
    // Wrap remaining text in \text{}
    let parts = result.split(/(@@MATH\d+@@)/);
    let output = '';
    
    for (let part of parts) {
        if (part.match(/^@@MATH\d+@@$/)) {
            // Restore math
            let index = parseInt(part.match(/\d+/)[0]);
            output += mathProtections[index];
        } else if (part.trim()) {
            // Wrap text
            output += `\\text{${part}}`;
        }
    }
    
    return output;
}

// Actually, let's just restore from backup and do it properly
// Read original backup first
const backupExists = fs.existsSync('src/data/problems-backup.json');
if (!backupExists) {
    // Make a backup first
    fs.writeFileSync('src/data/problems-backup.json', JSON.stringify(problems, null, 2));
}

// Read fresh data
const originalProblems = JSON.parse(fs.readFileSync('src/data/problems-backup.json', 'utf8'));

// Process only problems 175-230 with a very targeted approach
for (let i = 0; i < originalProblems.length; i++) {
    const problem = originalProblems[i];
    const problemId = parseInt(problem.id);
    
    if (problemId >= 175 && problemId <= 230) {
        console.log(`Processing problem ${problemId}`);
        
        // Just remove \( and \) from the statement, hints, expressions, and explanations
        // The rest of the formatting is actually fine for most cases
        
        if (problem.statement) {
            problem.statement = problem.statement.replace(/\\\(/g, '').replace(/\\\)/g, '');
            
            // For statements that don't have \text{} yet, wrap the Polish text
            if (!problem.statement.includes('\\text{')) {
                // This is a complex problem - for now just handle the most common case
                // where Polish text is at the beginning
                problem.statement = problem.statement.replace(/^([^\\]+?)(\\[a-zA-Z])/g, '\\text{$1}$2');
            }
        }
        
        if (problem.steps) {
            problem.steps = problem.steps.map(step => {
                // Remove \( and \) from all fields
                if (step.hint) {
                    step.hint = step.hint.replace(/\\\(/g, '').replace(/\\\)/g, '');
                }
                if (step.expression) {
                    step.expression = step.expression.replace(/\\\(/g, '').replace(/\\\)/g, '');
                }
                if (step.explanation) {
                    step.explanation = step.explanation.replace(/\\\(/g, '').replace(/\\\)/g, '');
                }
                return step;
            });
        }
    }
}

// Write the updated problems
fs.writeFileSync('src/data/problems.json', JSON.stringify(originalProblems, null, 2));
console.log('Conversion complete!');