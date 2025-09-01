/**
 * Fix fragmented math expressions in wielomiany_solutions.json
 * Merges adjacent $...$ blocks that should be one expression
 */

const fs = require('fs');
const path = require('path');

// Path to wielomiany file
const wielomianyPath = path.join(__dirname, '../wielomiany_solutions.json');

// Create backup
const backupPath = path.join(__dirname, `../wielomiany_solutions.backup-before-fix-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const data = JSON.parse(fs.readFileSync(wielomianyPath, 'utf8'));
fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
console.log(`✅ Backup created: ${backupPath}`);

// Function to fix fragmented math
function fixFragmentedMath(text) {
  if (!text) return text;
  
  let fixed = text;
  let changeCount = 0;
  let iterations = 0;
  const maxIterations = 10;
  
  // Keep merging until no more changes (or max iterations)
  while (iterations < maxIterations) {
    const before = fixed;
    
    // Pattern 1: $a$ operator $b$ → $a operator b$
    // Handles: \cdot, +, -, =, \times, /, ^, \pm, \mp, \neq, \leq, \geq, \approx
    fixed = fixed.replace(/\$([^$]+)\$\s*(\\cdot|\\times|\+|-|=|\/|\^|\\pm|\\mp|\\neq|\\leq|\\geq|\\approx|·|×|∙)\s*\$([^$]+)\$/g, (match, p1, op, p2) => {
      changeCount++;
      return `$${p1} ${op} ${p2}$`;
    });
    
    // Pattern 2: $a$operator$b$ (no spaces) → $a operator b$
    fixed = fixed.replace(/\$([^$]+)\$(\\cdot|\\times|\+|-|=|\/|\^|\\pm|\\mp|\\neq|\\leq|\\geq|\\approx|·|×|∙)\$([^$]+)\$/g, (match, p1, op, p2) => {
      changeCount++;
      return `$${p1} ${op} ${p2}$`;
    });
    
    // Pattern 3: $a$ $b$ (just space between) → $a b$
    // Be careful here - only merge if it looks like continuation
    fixed = fixed.replace(/\$([^$]+)\$\s+\$([^$]+)\$/g, (match, p1, p2) => {
      // Check if p2 starts with operator or looks like continuation
      if (p2.match(/^[\+\-=]/) || p1.match(/[=\+\-\*\/]$/)) {
        changeCount++;
        return `$${p1} ${p2}$`;
      }
      return match; // Don't merge if uncertain
    });
    
    // Pattern 4: Special case for cdot without backslash
    fixed = fixed.replace(/\$([^$]+)\$\s*cdot\s*\$([^$]+)\$/g, (match, p1, p2) => {
      changeCount++;
      return `$${p1} \\cdot ${p2}$`;
    });
    
    // If no changes, we're done
    if (fixed === before) break;
    iterations++;
  }
  
  if (changeCount > 0 && text !== fixed) {
    console.log(`  Fixed ${changeCount} fragments in: "${text.substring(0, 50)}..."`);
  }
  
  return fixed;
}

// Process all problems
let totalFixed = 0;
data.forEach((problem, problemIndex) => {
  // Fix statement
  const oldStatement = problem.statement;
  problem.statement = fixFragmentedMath(problem.statement);
  if (oldStatement !== problem.statement) totalFixed++;
  
  // Fix steps
  if (problem.steps) {
    problem.steps.forEach((step, stepIndex) => {
      const oldHint = step.hint;
      const oldExpression = step.expression;
      const oldExplanation = step.explanation;
      
      step.hint = fixFragmentedMath(step.hint);
      step.expression = fixFragmentedMath(step.expression);
      step.explanation = fixFragmentedMath(step.explanation);
      
      if (oldHint !== step.hint || oldExpression !== step.expression || oldExplanation !== step.explanation) {
        totalFixed++;
      }
    });
  }
  
  // Fix solutions
  if (problem.solutions) {
    problem.solutions = problem.solutions.map(sol => {
      const oldSol = sol;
      const fixed = fixFragmentedMath(sol);
      if (oldSol !== fixed) totalFixed++;
      return fixed;
    });
  }
  
  // Fix parameters if they exist
  if (problem.parameters) {
    Object.keys(problem.parameters).forEach(key => {
      if (typeof problem.parameters[key] === 'string') {
        const oldParam = problem.parameters[key];
        problem.parameters[key] = fixFragmentedMath(problem.parameters[key]);
        if (oldParam !== problem.parameters[key]) totalFixed++;
      } else if (Array.isArray(problem.parameters[key])) {
        problem.parameters[key] = problem.parameters[key].map(item => {
          if (typeof item === 'string') {
            const oldItem = item;
            const fixed = fixFragmentedMath(item);
            if (oldItem !== fixed) totalFixed++;
            return fixed;
          }
          return item;
        });
      }
    });
  }
});

// Save fixed data
fs.writeFileSync(wielomianyPath, JSON.stringify(data, null, 2));

console.log('\n📊 FIX COMPLETE:');
console.log(`✅ Fixed ${totalFixed} fragmented expressions`);
console.log(`✅ Processed ${data.length} problems`);
console.log(`✅ File updated: ${wielomianyPath}`);

// Verify no more fragments exist
const updatedContent = fs.readFileSync(wielomianyPath, 'utf8');
const fragmentPattern = /\$[^$]+\$\s*[\\]?(cdot|times|pm|mp|neq|leq|geq|approx|·|×|∙)\s*\$/;
if (fragmentPattern.test(updatedContent)) {
  console.log('⚠️  Some fragments may still exist - run again if needed');
} else {
  console.log('✅ No obvious fragments detected');
}