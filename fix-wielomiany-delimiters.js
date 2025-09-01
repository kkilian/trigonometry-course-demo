const fs = require('fs');
const path = require('path');

// Reload the wielomiany data (to get fresh copy)
const filePath = path.join(__dirname, 'src/data/wielomiany_solutions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(`Loaded ${data.length} problems to fix`);

// Function to fix LaTeX delimiters in statement
function fixDelimiters(statement) {
  if (!statement) return statement;
  
  let fixed = statement;
  
  // Fix already escaped delimiters that got double-escaped
  fixed = fixed.replace(/\\\\\(/g, '\\(');
  fixed = fixed.replace(/\\\\\)/g, '\\)');
  
  // Fix already escaped delimiters
  fixed = fixed.replace(/\\\(/g, '\\(');
  fixed = fixed.replace(/\\\)/g, '\\)');
  
  // Now fix mathematical expressions in plain parentheses
  // Pattern for function definitions like (F(x)=...), (G(x)=...), etc.
  fixed = fixed.replace(/(?<!\\)\(([FGHWfPQRST]\(x\)[^)]*)\)(?!\\)/g, '\\($1\\)');
  
  // Pattern for function evaluations like (G(4)=32), (G(3)=243), etc.
  fixed = fixed.replace(/(?<!\\)\(([FGHWfPQRST]\([0-9\s\\sqrt{}]+\)=[^)]+)\)(?!\\)/g, '\\($1\\)');
  
  // Special pattern for G(\sqrt{5}) type expressions
  fixed = fixed.replace(/(?<!\\)\(([FGHWfPQRST]\(\\sqrt{[^}]+}\)=[^)]+)\)(?!\\)/g, '\\($1\\)');
  
  // Special pattern for G(2 \sqrt{2}) type expressions  
  fixed = fixed.replace(/(?<!\\)\(([FGHWfPQRST]\([0-9\s]+\\sqrt{[^}]+}\)=[^)]+)\)(?!\\)/g, '\\($1\\)');
  
  return fixed;
}

// Fix all problems
let fixedCount = 0;
data.forEach((problem, index) => {
  const originalStatement = problem.statement;
  const fixedStatement = fixDelimiters(originalStatement);
  
  if (originalStatement !== fixedStatement) {
    console.log(`\nProblem ${index + 1} (${problem.id}):`);
    console.log(`  Original: ${originalStatement.substring(0, 150)}${originalStatement.length > 150 ? '...' : ''}`);
    console.log(`  Fixed: ${fixedStatement.substring(0, 150)}${fixedStatement.length > 150 ? '...' : ''}`);
    problem.statement = fixedStatement;
    fixedCount++;
  }
});

// Save the fixed data
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Fixed ${fixedCount} out of ${data.length} problems`);
console.log(`File saved to: ${filePath}`);