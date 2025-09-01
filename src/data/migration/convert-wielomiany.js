/**
 * Converter for wielomiany_solutions.json
 * Converts from \text{} format to $...$ format
 */

const fs = require('fs');
const path = require('path');
const { removeTextWrapper, wrapMathInDollars, cleanupSpaces } = require('./convert-helpers');

// Load wielomiany data
const wielomianyPath = path.join(__dirname, '../wielomiany_solutions.json');
const wielomiany = JSON.parse(fs.readFileSync(wielomianyPath, 'utf8'));

// Create backup
const backupPath = path.join(__dirname, `../wielomiany_solutions.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(backupPath, JSON.stringify(wielomiany, null, 2));
console.log(`✅ Backup created: ${backupPath}`);

// Convert each problem
let convertedCount = 0;
let fieldCount = 0;

wielomiany.forEach((problem, index) => {
  // Convert statement
  if (problem.statement) {
    const original = problem.statement;
    problem.statement = cleanupSpaces(wrapMathInDollars(removeTextWrapper(problem.statement)));
    if (original !== problem.statement) fieldCount++;
  }
  
  // Convert steps
  if (problem.steps && Array.isArray(problem.steps)) {
    problem.steps.forEach((step, stepIndex) => {
      // Convert hint
      if (step.hint) {
        const original = step.hint;
        step.hint = cleanupSpaces(wrapMathInDollars(removeTextWrapper(step.hint)));
        if (original !== step.hint) fieldCount++;
      }
      
      // Convert expression
      if (step.expression) {
        const original = step.expression;
        step.expression = cleanupSpaces(wrapMathInDollars(removeTextWrapper(step.expression)));
        if (original !== step.expression) fieldCount++;
      }
      
      // Convert explanation
      if (step.explanation) {
        const original = step.explanation;
        step.explanation = cleanupSpaces(wrapMathInDollars(removeTextWrapper(step.explanation)));
        if (original !== step.explanation) fieldCount++;
      }
    });
  }
  
  // Convert solutions
  if (problem.solutions && Array.isArray(problem.solutions)) {
    problem.solutions = problem.solutions.map(solution => {
      const original = solution;
      const converted = cleanupSpaces(wrapMathInDollars(removeTextWrapper(solution)));
      if (original !== converted) fieldCount++;
      return converted;
    });
  }
  
  // Convert parameters if they exist
  if (problem.parameters && typeof problem.parameters === 'object') {
    Object.keys(problem.parameters).forEach(key => {
      const value = problem.parameters[key];
      if (typeof value === 'string') {
        const original = value;
        problem.parameters[key] = cleanupSpaces(wrapMathInDollars(removeTextWrapper(value)));
        if (original !== problem.parameters[key]) fieldCount++;
      } else if (Array.isArray(value)) {
        problem.parameters[key] = value.map(item => {
          if (typeof item === 'string') {
            const original = item;
            const converted = cleanupSpaces(wrapMathInDollars(removeTextWrapper(item)));
            if (original !== converted) fieldCount++;
            return converted;
          }
          return item;
        });
      }
    });
  }
  
  convertedCount++;
});

// Save converted data
fs.writeFileSync(wielomianyPath, JSON.stringify(wielomiany, null, 2));

console.log('\n📊 CONVERSION COMPLETE:');
console.log(`✅ Converted ${convertedCount} problems`);
console.log(`✅ Updated ${fieldCount} fields`);
console.log(`✅ Data saved to: ${wielomianyPath}`);

// Validate conversion
console.log('\n🔍 VALIDATION:');
const convertedData = fs.readFileSync(wielomianyPath, 'utf8');
const hasOldFormat = convertedData.includes('\\text{');
const hasNewFormat = convertedData.includes('$');

if (hasOldFormat) {
  console.log('⚠️  WARNING: Old \\text{} format still found in data!');
} else {
  console.log('✅ No \\text{} format found');
}

if (hasNewFormat) {
  console.log('✅ New $...$ format detected');
} else {
  console.log('⚠️  WARNING: No $...$ format found!');
}