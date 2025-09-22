const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function testQueries() {
  console.log('🧪 Testowanie zapytań do bazy danych...\n');

  try {
    // Test 1: Policz wszystkie zadania
    const totalProblems = await prisma.problem.count();
    console.log(`✅ Liczba wszystkich zadań: ${totalProblems}`);

    // Test 2: Znajdź zadania z matury rozszerzonej
    const extendedProblems = await prisma.problem.findMany({
      where: {
        examType: 'rozszerzona'
      },
      take: 5,
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });
    console.log(`✅ Znaleziono ${extendedProblems.length} zadań z matury rozszerzonej`);

    // Test 3: Znajdź zadania z konkretnego roku
    const problems2025 = await prisma.problem.findMany({
      where: {
        year: 2025
      }
    });
    console.log(`✅ Zadania z 2025 roku: ${problems2025.length}`);

    // Test 4: Znajdź zadania według trudności
    const difficultProblems = await prisma.problem.findMany({
      where: {
        difficulty: {
          gte: 4
        }
      },
      take: 3,
      include: {
        steps: true
      }
    });
    console.log(`✅ Trudne zadania (difficulty >= 4): ${difficultProblems.length}`);

    // Test 5: Pobierz kategorie z hierarchią
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        problems: {
          take: 2
        }
      }
    });
    console.log(`✅ Liczba kategorii: ${categories.length}`);

    // Test 6: Znajdź zadania z określonej kategorii (np. Wielomiany)
    const algebraCategory = await prisma.category.findUnique({
      where: {
        slug: 'wielomiany'
      },
      include: {
        problems: {
          include: {
            problem: true
          },
          take: 5
        }
      }
    });

    if (algebraCategory) {
      console.log(`✅ Zadania z kategorii '${algebraCategory.name}': ${algebraCategory.problems.length}`);
    }

    // Test 7: Znajdź zadanie z pełnymi krokami rozwiązania
    const problemWithSteps = await prisma.problem.findFirst({
      where: {
        steps: {
          some: {}
        }
      },
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc'
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        hints: true
      }
    });

    if (problemWithSteps) {
      console.log(`\n📝 Przykładowe zadanie z krokami:`);
      console.log(`   ID: ${problemWithSteps.id}`);
      console.log(`   Treść: ${problemWithSteps.question.substring(0, 100)}...`);
      console.log(`   Liczba kroków: ${problemWithSteps.steps.length}`);
      console.log(`   Kategorie: ${problemWithSteps.categories.map(c => c.category.name).join(', ')}`);
    }

    // Test 8: Zapytanie agregujące - średnia trudność per typ egzaminu
    const avgDifficulty = await prisma.problem.groupBy({
      by: ['examType'],
      _avg: {
        difficulty: true
      },
      _count: {
        id: true
      }
    });

    console.log('\n📊 Statystyki według typu egzaminu:');
    avgDifficulty.forEach(stat => {
      console.log(`   ${stat.examType}: ${stat._count.id} zadań, średnia trudność: ${stat._avg.difficulty?.toFixed(2)}`);
    });

    // Test 9: Wyszukiwanie tekstowe (symulacja wyszukiwania dla chatu AI)
    const searchTerm = 'równanie';
    const searchResults = await prisma.problem.findMany({
      where: {
        OR: [
          {
            question: {
              contains: searchTerm
            }
          },
          {
            explanation: {
              contains: searchTerm
            }
          }
        ]
      },
      take: 5
    });
    console.log(`\n🔍 Wyszukiwanie '${searchTerm}': znaleziono ${searchResults.length} wyników`);

    // Test 10: Znajdź zadania z marca 2025
    const marchProblems = await prisma.problem.findMany({
      where: {
        year: 2025,
        month: 'marzec'
      }
    });
    console.log(`✅ Zadania z marca 2025: ${marchProblems.length}`);

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Uruchom testy
testQueries();