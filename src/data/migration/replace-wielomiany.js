/**
 * Replace wielomiany_solutions.json with problems from rrr.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const wielomianyPath = path.join(__dirname, '../wielomiany_solutions.json');
const rrrPath = '/Users/krzysztofkilian/Desktop/projekt-m/math-ai-solver/rrr.json';

// Create backup of current wielomiany
const backupPath = path.join(__dirname, `../wielomiany_solutions.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const currentData = JSON.parse(fs.readFileSync(wielomianyPath, 'utf8'));
fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
console.log(`✅ Backup created: ${backupPath}`);
console.log(`   (Contained ${currentData.length} problems)`);

// Load new problems from rrr.json
console.log('\n📂 Loading problems from rrr.json...');
const newProblems = JSON.parse(fs.readFileSync(rrrPath, 'utf8'));
console.log(`✅ Loaded ${newProblems.length} problems from rrr.json`);

// Check format of new problems
console.log('\n🔍 Checking format...');
let hasOldFormat = false;
let hasDollarFormat = false;

const sampleText = JSON.stringify(newProblems.slice(0, 5));
if (sampleText.includes('\\text{')) {
  hasOldFormat = true;
  console.log('⚠️  Found \\text{} format in new problems');
}
if (sampleText.includes('$')) {
  hasDollarFormat = true;
  console.log('✅ Found $...$ format in new problems');
}

// Replace wielomiany with new problems
fs.writeFileSync(wielomianyPath, JSON.stringify(newProblems, null, 2));

console.log('\n📊 REPLACEMENT COMPLETE:');
console.log(`✅ Replaced ${currentData.length} problems with ${newProblems.length} new problems`);
console.log(`✅ File updated: ${wielomianyPath}`);

// Final validation
const finalContent = fs.readFileSync(wielomianyPath, 'utf8');
const finalProblems = JSON.parse(finalContent);

console.log('\n🔍 FINAL VALIDATION:');
console.log(`✅ File contains ${finalProblems.length} problems`);

// Check topics covered
const topics = new Set(finalProblems.map(p => p.topic));
console.log(`✅ Topics covered (${topics.size}):`);
topics.forEach(topic => console.log(`   - ${topic}`));

if (hasOldFormat) {
  console.log('\n⚠️  WARNING: Some problems may need format conversion');
  console.log('   Run convert-wielomiany.js if needed');
}