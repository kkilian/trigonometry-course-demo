# Tagging Rationale for 12 Sample Problems

## Difficulty Assessment Criteria (1-5 stars)

### ⭐ (Level 1) - Bezpośrednie podstawienie
- Single formula application
- No transformations needed
- Direct calculation

### ⭐⭐ (Level 2) - 2-3 kroki przekształceń  
- Basic unit conversions (problems 9, 11)
- Simple algebraic manipulations
- Direct formula usage with minor simplification

### ⭐⭐⭐ (Level 3) - Kilka kroków + wybór metody
- Multiple step transformations (problems 29, 69, 97)
- Requires choosing appropriate formulas
- Combines 2-3 trigonometric identities

### ⭐⭐⭐⭐ (Level 4) - Analiza przypadków
- Complex proofs (problems 39, 78, 120, 162)
- Multiple cases to consider
- Requires deep understanding of concepts
- Combines multiple techniques

### ⭐⭐⭐⭐⭐ (Level 5) - Dowody, zadania z parametrem
- Very complex manipulations (problems 131, 140, 150)
- Long multi-step proofs
- Advanced algebraic techniques
- Non-obvious transformations

## Category Distribution

- **przeliczanie_jednostek** (2 problems): 9, 11
  - Basic conversion between radians and degrees
  
- **upraszczanie_wyrazen** (3 problems): 29, 69, 131
  - Simplifying trigonometric expressions using identities
  
- **dowody_tozsamosci** (3 problems): 39, 120, 140
  - Proving trigonometric identities
  
- **rownania_trygonometryczne** (3 problems): 97, 150, 162
  - Solving trigonometric equations
  
- **uklad_wspolrzednych** (1 problem): 78
  - Application involving coordinate system and line slopes

## Most Common Step Operations

1. **przypomnienie_wzoru** (11 occurrences) - Recalling formulas
2. **przeksztalcenie_algebraiczne** (24 occurrences) - Algebraic transformations
3. **podstawienie_wartosci** (10 occurrences) - Substituting values
4. **obliczenie_wartosci** (8 occurrences) - Computing values
5. **tozsamosc_trygonometryczna** (7 occurrences) - Using trig identities
6. **analiza_przypadkow** (4 occurrences) - Analyzing cases
7. **uproszczenie_wyrazenia** (5 occurrences) - Simplifying expressions
8. **znalezienie_wzorca** (5 occurrences) - Finding patterns

## Tagging Insights

### Pattern Recognition
- Problems starting with "Uzasadnij" (Prove) are typically difficulty 4-5
- Unit conversion problems are consistently difficulty 2
- Problems with multiple sin/cos terms often require identity application
- Equation solving complexity depends on the number of different trig functions involved

### Step Operation Patterns
- Most problems begin with "przypomnienie_wzoru" (recalling formula)
- Middle steps often involve "przeksztalcenie_algebraiczne" (algebraic transformation)
- Final steps typically are "obliczenie_wartosci" (calculation) or "weryfikacja_wyniku" (verification)

### Concept Clustering
- **Basic concepts**: Unit conversion, special angles
- **Intermediate concepts**: Basic identities, reduction formulas
- **Advanced concepts**: Complex proofs, multi-angle formulas, advanced transformations

## Recommendations for API Prompt

Based on this tagging analysis, an effective API prompt should:

1. **Identify problem type** first (conversion, simplification, proof, equation)
2. **Assess complexity** by counting:
   - Number of different trig functions
   - Number of angles/variables
   - Presence of powers or products
3. **Tag steps sequentially** focusing on the mathematical operation type
4. **Use consistent vocabulary** from the 17 identified operations

This structured approach ensures consistent and accurate tagging across all problems.