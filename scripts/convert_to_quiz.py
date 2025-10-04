#!/usr/bin/env python3
"""
Convert quiz-like problems (with A, B, C, D options) to proper quiz format
"""

import json
import re
import sys

def extract_options(statement):
    """Extract A, B, C, D options from statement"""
    # Pattern to match: A. ... , B. ... , C. ... , D. ...
    # Options can have LaTeX math in them

    # Find where options start
    option_match = re.search(r'(A\.\s*.+?)\s*,\s*(B\.\s*.+?)\s*,\s*(C\.\s*.+?)\s*,\s*(D\.\s*.+?)(?:\s*$|\s*\.|\s*\?)', statement, re.DOTALL)

    if not option_match:
        return None, statement

    # Extract individual options
    options = {}
    full_options_text = option_match.group(0)

    # Split by option letters
    parts = re.split(r'([A-D]\.)', full_options_text)

    current_letter = None
    current_text = ""

    for part in parts:
        if re.match(r'^[A-D]\.$', part.strip()):
            if current_letter:
                options[current_letter] = current_text.strip().rstrip(',').strip()
            current_letter = part.strip()[0]
            current_text = ""
        else:
            current_text += part

    # Add last option
    if current_letter:
        options[current_letter] = current_text.strip().rstrip(',').rstrip('.').strip()

    # Clean statement (remove options part)
    clean_statement = statement[:option_match.start()].strip()

    # Remove trailing colons or "jest równa:" etc
    clean_statement = re.sub(r':?\s*$', '', clean_statement)

    # Format quiz text
    quiz_text = '\n'.join([f'{letter}. {text}' for letter, text in sorted(options.items())])

    return quiz_text, clean_statement


def find_correct_answer(problem, quiz_options):
    """Try to find the correct answer from steps or solutions"""
    # Parse quiz options to get actual values
    options_map = {}  # {letter: value}
    for line in quiz_options.split('\n'):
        match = re.match(r'([A-D])\.\s*(.+)$', line.strip())
        if match:
            letter = match.group(1)
            value = match.group(2).strip()
            options_map[letter] = value

    # Check if there's a final answer in solutions
    if 'solutions' in problem and problem['solutions']:
        last_solution = problem['solutions'][-1].strip()

        # Compare with each option
        for letter, option_value in options_map.items():
            # Normalize for comparison (remove spaces, $, etc)
            solution_normalized = last_solution.replace(' ', '').replace('$', '')
            option_normalized = option_value.replace(' ', '').replace('$', '')

            if solution_normalized == option_normalized:
                return letter

            # Also try comparing the LaTeX content
            if solution_normalized in option_normalized or option_normalized in solution_normalized:
                # More flexible match
                if len(solution_normalized) > 2 and len(option_normalized) > 2:
                    return letter

    # Check if last step expression equals one of the options
    if 'steps' in problem and problem['steps']:
        last_step = problem['steps'][-1]
        expression = last_step.get('expression', '')

        # Extract final value from expression (often "... = value")
        final_value_match = re.search(r'=\s*([^=]+)$', expression)
        if final_value_match:
            final_value = final_value_match.group(1).strip()

            for letter, option_value in options_map.items():
                solution_normalized = final_value.replace(' ', '').replace('$', '')
                option_normalized = option_value.replace(' ', '').replace('$', '')

                if solution_normalized == option_normalized:
                    return letter

    return None


def create_explanation(problem):
    """Create brief explanation from first few steps"""
    if 'steps' not in problem or not problem['steps']:
        return None

    # Use first 2-3 steps as explanation
    explanations = []
    for i, step in enumerate(problem['steps'][:3]):
        if 'expression' in step:
            explanations.append(step['expression'])

    if explanations:
        return ' '.join(explanations)

    return None


def convert_to_quiz(problem):
    """Convert a problem with A, B, C, D options to quiz format"""
    statement = problem.get('statement', '')

    # Check if it has A, B, C, D options
    if not all(f'{letter}.' in statement for letter in ['A', 'B', 'C', 'D']):
        # Not a quiz problem
        problem['type'] = 'open'
        return problem

    # Extract options
    quiz_text, clean_statement = extract_options(statement)

    if not quiz_text:
        # Failed to extract, keep as open
        problem['type'] = 'open'
        return problem

    # Find correct answer
    correct_answer = find_correct_answer(problem, quiz_text)

    # Create explanation
    explanation = create_explanation(problem)

    # Update problem
    problem['type'] = 'quiz'
    problem['statement'] = clean_statement
    problem['quiz'] = quiz_text

    if correct_answer:
        problem['answer'] = correct_answer

    if explanation:
        problem['explanation'] = explanation

    return problem


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert_to_quiz.py <json_file>")
        sys.exit(1)

    file_path = sys.argv[1]

    # Load data
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} problems...")

    converted_count = 0
    open_count = 0

    # Process each problem
    for i, problem in enumerate(data):
        original_type = problem.get('type')
        converted = convert_to_quiz(problem)

        if converted['type'] == 'quiz':
            converted_count += 1
            print(f"  ✓ {i+1}. {problem['id']} → QUIZ")
        else:
            open_count += 1
            if i < 25:  # First 25 are usually quiz on podstawa
                print(f"  ⚠ {i+1}. {problem['id']} → OPEN (couldn't convert)")

    print(f"\nResults:")
    print(f"  Quiz problems: {converted_count}")
    print(f"  Open problems: {open_count}")

    # Save back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved to {file_path}")


if __name__ == "__main__":
    main()