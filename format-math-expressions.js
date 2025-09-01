const fs = require('fs');
const path = require('path');

// Read the JSON file
const inputFile = './src/data/polynomials-intro-problems.json';
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Function to add newlines around math expressions in statements
function formatMathExpressions(text) {
  // Replace $...$ expressions with newlines before and after
  // This regex finds $...$ patterns and captures the content
  return text.replace(/\$([^$]+)\$/g, '\n$$$1$$\n')
             .replace(/\n\n/g, '\n') // Remove double newlines
             .replace(/^\n/, '') // Remove leading newline
             .replace(/\n$/, ''); // Remove trailing newline
}

// Process each problem in the data
const processedData = data.map(problem => {
  if (problem.statement) {
    return {
      ...problem,
      statement: formatMathExpressions(problem.statement)
    };
  }
  return problem;
});

// Write the formatted data back to the file
fs.writeFileSync(inputFile, JSON.stringify(processedData, null, 2));

console.log(`✅ Formatted math expressions in ${processedData.length} problems`);
console.log('✅ File saved successfully');