#!/usr/bin/env python3
import re
import json
from pathlib import Path

# ===== CONFIG =====
LOCALE_DIR = './src/i18n'                # path to your TS locale files
SOURCE_DIR = './src'                     # path to scan for t('...') usage
LOCALE_FILE_PATTERN = r'\.ts$'           # locale files ending with .ts
SOURCE_FILE_PATTERN = r'\.(ts|vue)$'     # code files ending with .ts (or r'\.(ts|vue)$' for .vue)
PATCH_OUTPUT = './tools/i18n_missing_patch.json'
REQUIRED_LANGUAGES = ['de', 'en', 'da']  # define required languages

# -----------------------------
# Helpers
# -----------------------------
def extract_translation_keys_from_ts(ts_file: Path):
    """
    Extract top-level translation keys from a TypeScript i18n file.
    """
    content = ts_file.read_text(encoding="utf-8", errors="ignore")
    key_pattern = re.compile(r'(\w+)\s*:\s*{[^}]*}', re.MULTILINE)
    keys = set(match.group(1) for match in key_pattern.finditer(content))
    return keys

def extract_translation_keys_from_code(code_dir: Path):
    """
    Recursively scan .ts/.vue files for t('...') calls
    """
    pattern = re.compile(r"t\(\s*['\"]([\w\d_]+)['\"]\s*\)")
    found_keys = set()
    scanned_files = []
    for file_path in code_dir.rglob("*"):
        if re.search(SOURCE_FILE_PATTERN, str(file_path)):
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                matches = pattern.findall(content)
                if matches:
                    scanned_files.append(str(file_path))
                found_keys.update(matches)
            except Exception as e:
                print(f"Failed to read {file_path}: {e}")
    return found_keys, scanned_files

def generate_missing_patch(i18n_keys, code_keys, required_languages):
    """
    Produce a JSON patch with missing translation keys
    """
    missing_keys = code_keys - i18n_keys
    patch = {lang: {} for lang in required_languages}
    for key in missing_keys:
        for lang in required_languages:
            patch[lang][key] = ""
    return patch

def find_unused_keys(i18n_keys, code_keys):
    """
    Find keys present in i18n but never used in code
    """
    return i18n_keys - code_keys

# -----------------------------
# Main
# -----------------------------
def main():
    locale_dir = Path(LOCALE_DIR)
    source_dir = Path(SOURCE_DIR)

    # Extract keys from i18n files
    print("Extracting keys from i18n files...")
    i18n_keys = set()
    scanned_locale_files = []
    for ts_file in locale_dir.rglob("*.ts"):
        keys = extract_translation_keys_from_ts(ts_file)
        if keys:
            scanned_locale_files.append(str(ts_file))
        i18n_keys.update(keys)
    print(f"Found {len(i18n_keys)} translation keys in i18n files")

    # Scan code for t('...') usage
    print("Scanning code for t('...') calls...")
    code_keys, scanned_code_files = extract_translation_keys_from_code(source_dir)
    print(f"Found {len(code_keys)} keys in code")

    # Generate missing patch and unused keys
    patch = generate_missing_patch(i18n_keys, code_keys, REQUIRED_LANGUAGES)
    unused_keys = find_unused_keys(i18n_keys, code_keys)

    # Prepare output
    output_path = Path(PATCH_OUTPUT)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_data = {
        "scanned_locale_files": scanned_locale_files,
        "scanned_code_files": scanned_code_files,
        "missing_translations": patch,
        "unused_translations": list(unused_keys)
    }
    output_path.write_text(json.dumps(output_data, indent=2, ensure_ascii=False))

    # Summary
    print(f"Analysis complete. JSON written to {output_path}")
    print(f"Missing translations: {sum(len(v) for v in patch.values())}")
    print(f"Unused translations: {len(unused_keys)}")
    print(f"Scanned {len(scanned_locale_files)} locale files")
    print(f"Scanned {len(scanned_code_files)} code files")

if __name__ == "__main__":
    main()