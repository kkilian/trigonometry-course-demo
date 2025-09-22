const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie kategorii z istniejących danych
const categoryMap = {
  'Równania trygonometryczne': { slug: 'rownania-trygonometryczne', parent: 'trygonometria' },
  'Dwumian Newtona': { slug: 'dwumian-newtona', parent: 'algebra' },
  'Wielomiany': { slug: 'wielomiany', parent: 'algebra' },
  'Kombinatoryka': { slug: 'kombinatoryka', parent: 'matematyka-dyskretna' },
  'Logarytmy': { slug: 'logarytmy', parent: 'algebra' },
  'Geometria': { slug: 'geometria', parent: null },
  'Układy równań': { slug: 'uklady-rownan', parent: 'algebra' },
  'Ułamki algebraiczne': { slug: 'ulamki-algebraiczne', parent: 'algebra' },
  // Kategorie nadrzędne
  'trygonometria': { slug: 'trygonometria', parent: null },
  'algebra': { slug: 'algebra', parent: null },
  'matematyka-dyskretna': { slug: 'matematyka-dyskretna', parent: null }
};

async function setupCategories() {
  console.log('🔧 Tworzenie kategorii...');

  // Najpierw kategorie nadrzędne (parent = null)
  for (const [name, data] of Object.entries(categoryMap)) {
    if (data.parent === null) {
      await prisma.category.upsert({
        where: { slug: data.slug },
        update: {},
        create: {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          slug: data.slug
        }
      });
    }
  }

  // Potem kategorie podrzędne
  for (const [name, data] of Object.entries(categoryMap)) {
    if (data.parent !== null) {
      const parent = await prisma.category.findUnique({
        where: { slug: categoryMap[data.parent].slug }
      });

      await prisma.category.upsert({
        where: { slug: data.slug },
        update: {},
        create: {
          name: name,
          slug: data.slug,
          parentId: parent?.id
        }
      });
    }
  }
}

async function importProblem(problemData, filePath) {
  // Określ typ egzaminu i rok na podstawie ścieżki pliku
  const isMaturaFile = filePath.includes('matura');
  const examType = filePath.includes('rozszerzenie') || isMaturaFile ? 'rozszerzona' : 'podstawa';

  // Spróbuj wyciągnąć rok z nazwy pliku lub ścieżki
  const yearMatch = filePath.match(/20\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

  // Spróbuj wyciągnąć miesiąc
  const monthMatch = filePath.match(/(marzec|maj|czerwiec|sierpien|pazdziernik)/i);
  const month = monthMatch ? monthMatch[1].toLowerCase() : null;

  // Tworzenie głównego rekordu problemu
  const problem = await prisma.problem.create({
    data: {
      question: problemData.statement || problemData.question || '',
      answer: problemData.answer || problemData.solution || null,
      difficulty: problemData.difficulty || 3,
      points: problemData.points || null,
      examType: examType,
      year: year,
      month: month,
      problemNumber: problemData.id?.replace(/[#-]/g, '') || null,
      explanation: problemData.explanation || null
    }
  });

  // Dodaj kategorie
  if (problemData.topic) {
    const categoryData = categoryMap[problemData.topic];
    if (categoryData) {
      const category = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });

      if (category) {
        await prisma.categoryProblem.create({
          data: {
            problemId: problem.id,
            categoryId: category.id
          }
        });
      }
    }
  }

  // Dodaj kroki rozwiązania
  if (problemData.steps && Array.isArray(problemData.steps)) {
    for (let i = 0; i < problemData.steps.length; i++) {
      const stepData = problemData.steps[i];
      await prisma.step.create({
        data: {
          problemId: problem.id,
          stepNumber: stepData.step || i + 1,
          content: stepData.hint || stepData.expression || '',
          latex: stepData.expression || null,
          explanation: stepData.explanation || stepData.why || null
        }
      });
    }
  }

  // Dodaj podpowiedzi
  if (problemData.hints && Array.isArray(problemData.hints)) {
    for (let i = 0; i < problemData.hints.length; i++) {
      await prisma.hint.create({
        data: {
          problemId: problem.id,
          hintNumber: i + 1,
          content: problemData.hints[i]
        }
      });
    }
  }

  return problem;
}

async function importJsonFile(filePath) {
  console.log(`📁 Importowanie: ${filePath}`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (Array.isArray(data)) {
      for (const problem of data) {
        await importProblem(problem, filePath);
      }
      console.log(`✅ Zaimportowano ${data.length} zadań z ${path.basename(filePath)}`);
    } else if (typeof data === 'object' && data.problems) {
      for (const problem of data.problems) {
        await importProblem(problem, filePath);
      }
      console.log(`✅ Zaimportowano ${data.problems.length} zadań z ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Błąd przy importowaniu ${filePath}:`, error.message);
  }
}

async function findJsonFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...await findJsonFiles(fullPath));
    } else if (item.endsWith('.json') && !item.includes('package')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  try {
    console.log('🚀 Rozpoczynam migrację danych...\n');

    // Najpierw utwórz kategorie
    await setupCategories();
    console.log('✅ Kategorie utworzone\n');

    // Znajdź wszystkie pliki JSON z danymi
    const dataDir = path.join(__dirname, '../src/data');
    const jsonFiles = await findJsonFiles(dataDir);

    console.log(`📚 Znaleziono ${jsonFiles.length} plików JSON do zaimportowania\n`);

    // Importuj każdy plik
    for (const file of jsonFiles) {
      await importJsonFile(file);
    }

    // Podsumowanie
    const problemCount = await prisma.problem.count();
    const categoryCount = await prisma.category.count();
    const stepCount = await prisma.step.count();

    console.log('\n📊 Podsumowanie migracji:');
    console.log(`  - Zadania: ${problemCount}`);
    console.log(`  - Kategorie: ${categoryCount}`);
    console.log(`  - Kroki rozwiązań: ${stepCount}`);

    console.log('\n✨ Migracja zakończona pomyślnie!');
  } catch (error) {
    console.error('❌ Błąd podczas migracji:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Uruchom migrację
main();