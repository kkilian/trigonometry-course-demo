const fs = require('fs');

// Read the problems file
const problems = JSON.parse(fs.readFileSync('src/data/problems.json', 'utf8'));

// Manual conversion function that handles the specific format we're seeing
function convertStatement(text) {
    if (!text) return text;
    
    // Simply remove \( and \) - that's the main difference
    let result = text.replace(/\\\(/g, '').replace(/\\\)/g, '');
    
    // Most of these problems already have good structure, they just use \(...\) instead of plain math
    // After removing \( and \), they should work fine
    
    // Only wrap in \text{} if not already present and it's clearly Polish text
    if (!result.includes('\\text{') && /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(result)) {
        // Find the first backslash (start of math)
        let firstMath = result.search(/\\[a-zA-Z]/);
        if (firstMath > 0) {
            // Wrap the Polish text before first math
            let polishText = result.substring(0, firstMath).trim();
            let mathPart = result.substring(firstMath);
            
            // Handle the Polish text - but be careful with embedded variables
            // For safety, just wrap larger chunks of Polish text
            if (polishText.length > 10 && !/[a-z]\^|[a-z]_|\\/.test(polishText)) {
                result = `\\text{${polishText}} ${mathPart}`;
            }
        }
    }
    
    return result;
}

// Process problems 175-230
let convertedCount = 0;
for (let problem of problems) {
    const problemId = parseInt(problem.id);
    
    if (problemId >= 175 && problemId <= 230) {
        console.log(`Converting problem ${problemId}`);
        convertedCount++;
        
        // Convert statement - just remove \( and \)
        if (problem.statement) {
            problem.statement = problem.statement.replace(/\\\(/g, '').replace(/\\\)/g, '');
        }
        
        // Convert steps
        if (problem.steps) {
            problem.steps = problem.steps.map(step => {
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

// Write the result
fs.writeFileSync('src/data/problems.json', JSON.stringify(problems, null, 2));
console.log(`\nConversion complete! Processed ${convertedCount} problems.`);