#!/usr/bin/env python3
"""
Agent do automatycznego formatowania zadań typu ABCD w plikach JSON maturalnych.

Użycie:
    python format_quiz_questions.py <plik.json>

Przykład:
    python format_quiz_questions.py src/data/matura/podstawa/sierpien2025podstawa/maturasierpien2025podstawa_multistep.json

Co robi:
1. Znajduje wszystkie zadania z opcjami A, B, C, D w polu "statement"
2. Wydziela opcje do osobnego pola "quiz"
3. Zachowuje formatowanie LaTeX
4. Tworzy kopię zapasową oryginalnego pliku
"""

import json
import re
import sys
import os
from datetime import datetime
import shutil


class QuizFormatter:
    """Agent do formatowania zadań typu quiz w plikach JSON."""

    def __init__(self, verbose=True):
        self.verbose = verbose
        self.stats = {
            'total_problems': 0,
            'quiz_problems_found': 0,
            'quiz_problems_updated': 0,
            'already_formatted': 0
        }

    def log(self, message):
        """Wypisuje komunikat jeśli verbose=True."""
        if self.verbose:
            print(message)

    def extract_quiz_options(self, statement):
        """
        Wydziela opcje A, B, C, D ze statement.
        Zwraca tuple: (statement_bez_opcji, opcje_quiz) lub (None, None) jeśli nie znaleziono.
        """
        # Wzorce do wykrywania opcji ABCD
        patterns = [
            # Opcje w jednej linii oddzielone przecinkami
            r'(.*?):\s*A\.\s*([^,]+),\s*B\.\s*([^,]+),\s*C\.\s*([^,]+),\s*D\.\s*(.+)$',
            # Opcje z $A., B., C., D.
            r'(.*?):\s*\$?A\.\s*([^,]+),\s*B\.\s*([^,]+),\s*C\.\s*([^,]+),\s*D\.\s*(.+)$',
            # Tylko 3 opcje (A, B, C)
            r'(.*?):\s*A\.\s*([^,]+),\s*B\.\s*([^,]+),\s*C\.\s*(.+)$',
            # Opcje w nawiasach
            r'(.*?):\s*A\.\s*\(([^)]+)\),\s*B\.\s*\(([^)]+)\),\s*C\.\s*\(([^)]+)\),\s*D\.\s*\(([^)]+)\)$',
        ]

        for pattern in patterns:
            match = re.search(pattern, statement, re.DOTALL)
            if match:
                groups = match.groups()
                statement_clean = groups[0].strip()

                # Upewnij się, że statement kończy się dwukropkiem
                if not statement_clean.endswith(':'):
                    statement_clean += ':'

                # Formatuj opcje
                if len(groups) == 5:  # 4 opcje (A, B, C, D)
                    options = [
                        f"A. {groups[1].strip()}",
                        f"B. {groups[2].strip()}",
                        f"C. {groups[3].strip()}",
                        f"D. {groups[4].strip()}"
                    ]
                elif len(groups) == 4:  # 3 opcje (A, B, C)
                    options = [
                        f"A. {groups[1].strip()}",
                        f"B. {groups[2].strip()}",
                        f"C. {groups[3].strip()}"
                    ]
                else:
                    continue

                quiz_text = '\n'.join(options)
                return statement_clean, quiz_text

        # Sprawdź też bardziej skomplikowane przypadki
        if re.search(r'\bA\.\s*[\w\$].*\bB\.\s*[\w\$].*\bC\.\s*[\w\$]', statement):
            self.log(f"  ⚠️  Znaleziono opcje ABCD, ale nie mogę ich automatycznie wydzielić.")
            self.log(f"      Fragment: {statement[:100]}...")
            return None, None

        return None, None

    def process_problem(self, problem):
        """
        Przetwarza pojedyncze zadanie.
        Zwraca True jeśli zadanie zostało zmodyfikowane.
        """
        # Sprawdź czy zadanie już ma pole quiz
        if 'quiz' in problem:
            self.stats['already_formatted'] += 1
            return False

        # Sprawdź czy statement zawiera opcje ABCD
        statement = problem.get('statement', '')
        if not statement:
            return False

        statement_clean, quiz_text = self.extract_quiz_options(statement)

        if statement_clean and quiz_text:
            # Zaktualizuj zadanie
            problem['statement'] = statement_clean

            # Znajdź pozycję po statement aby wstawić quiz
            keys = list(problem.keys())
            statement_index = keys.index('statement')

            # Utwórz nowy słownik z zachowaniem kolejności
            new_problem = {}
            for i, key in enumerate(keys):
                new_problem[key] = problem[key]
                if i == statement_index:
                    new_problem['quiz'] = quiz_text

            # Zaktualizuj oryginalne zadanie
            problem.clear()
            problem.update(new_problem)

            self.stats['quiz_problems_updated'] += 1
            return True

        return False

    def process_file(self, filepath):
        """
        Przetwarza plik JSON z zadaniami.
        """
        self.log(f"\n🔍 Analizuję plik: {filepath}")

        # Sprawdź czy plik istnieje
        if not os.path.exists(filepath):
            self.log(f"❌ Plik nie istnieje: {filepath}")
            return False

        # Wczytaj plik JSON
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.log(f"❌ Błąd parsowania JSON: {e}")
            return False
        except Exception as e:
            self.log(f"❌ Błąd czytania pliku: {e}")
            return False

        # Sprawdź strukturę danych
        if not isinstance(data, list):
            self.log(f"❌ Plik nie zawiera listy zadań")
            return False

        # Resetuj statystyki
        self.stats = {
            'total_problems': len(data),
            'quiz_problems_found': 0,
            'quiz_problems_updated': 0,
            'already_formatted': 0
        }

        # Przetwórz każde zadanie
        modified = False
        for i, problem in enumerate(data):
            if not isinstance(problem, dict):
                continue

            # Sprawdź czy to zadanie typu ABCD
            statement = problem.get('statement', '')
            if 'A.' in statement and 'B.' in statement:
                self.stats['quiz_problems_found'] += 1

                problem_id = problem.get('id', f'Zadanie {i+1}')
                self.log(f"\n📝 Przetwarzam: {problem_id}")

                if self.process_problem(problem):
                    self.log(f"   ✅ Zaktualizowano")
                    modified = True
                elif 'quiz' in problem:
                    self.log(f"   ℹ️  Już sformatowane")

        # Zapisz zmiany jeśli były modyfikacje
        if modified:
            # Utwórz kopię zapasową
            backup_path = f"{filepath}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(filepath, backup_path)
            self.log(f"\n💾 Utworzono kopię zapasową: {backup_path}")

            # Zapisz zmodyfikowane dane
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                self.log(f"✅ Zapisano zmiany do: {filepath}")
            except Exception as e:
                self.log(f"❌ Błąd zapisu: {e}")
                # Przywróć kopię zapasową
                shutil.move(backup_path, filepath)
                self.log(f"↩️  Przywrócono kopię zapasową")
                return False
        else:
            self.log(f"\nℹ️  Brak zmian do zapisania")

        # Pokaż statystyki
        self.log(f"\n📊 Statystyki:")
        self.log(f"   • Wszystkich zadań: {self.stats['total_problems']}")
        self.log(f"   • Zadań typu ABCD: {self.stats['quiz_problems_found']}")
        self.log(f"   • Zaktualizowano: {self.stats['quiz_problems_updated']}")
        self.log(f"   • Już sformatowane: {self.stats['already_formatted']}")

        return modified

    def process_directory(self, directory):
        """
        Przetwarza wszystkie pliki *_multistep.json w katalogu.
        """
        self.log(f"\n📂 Przeszukuję katalog: {directory}")

        json_files = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('_multistep.json'):
                    json_files.append(os.path.join(root, file))

        if not json_files:
            self.log(f"❌ Nie znaleziono plików *_multistep.json")
            return

        self.log(f"Znaleziono {len(json_files)} plików do przetworzenia")

        for filepath in json_files:
            self.process_file(filepath)


def main():
    """Główna funkcja programu."""

    # Sprawdź argumenty
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    path = sys.argv[1]
    formatter = QuizFormatter(verbose=True)

    # Sprawdź czy to plik czy katalog
    if os.path.isfile(path):
        formatter.process_file(path)
    elif os.path.isdir(path):
        formatter.process_directory(path)
    else:
        print(f"❌ Nieznana ścieżka: {path}")
        sys.exit(1)


if __name__ == '__main__':
    main()