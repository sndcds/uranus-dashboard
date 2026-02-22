import psycopg2
from collections import defaultdict
from pathlib import Path
from datetime import date
import sys


# ---------------------------
# Usage:
# python3 generate_i18n_flags_file.py uranus.accessibility_flag uranus.accessibility_topic uranusI18nAccessibility uranus-i18n-accessibility.ts
# python3 generate_i18n_flags_file.py uranus.visitor_information_flag uranus.visitor_information_topic uranusI18nVisitorInformation uranus-i18n-visitor-information.ts
# ---------------------------


# ---------------------------
# Config
# ---------------------------

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "oklab",
    "user": "roaldchristesen",
    "password": "",
}

OUTPUT_FILE = Path("uranus-i18n-accessibility.ts")
LANGS = ["en", "de", "da"]

# ---------------------------
# Main function
# ---------------------------

def generate_i18n_flags_file(flag_table, topic_table, base_name, output_file_path):
    OUTPUT_FILE = Path(output_file_path)

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Fetch topics
    cur.execute(f"SELECT topic_id, iso_639_1, name, key FROM {topic_table}")
    topics_raw = cur.fetchall()

    # Fetch flags
    cur.execute(f"SELECT flag, iso_639_1, name, topic_id, key FROM {flag_table}")
    flags_raw = cur.fetchall()

    cur.close()
    conn.close()

    # Process topics
    topics = defaultdict(lambda: defaultdict(dict))
    for topic_id, lang, name, key in topics_raw:
        topics[topic_id]["key"] = key
        topics[topic_id]["translations"][lang] = name

    # Process flags
    flags = defaultdict(lambda: defaultdict(dict))
    for flag_id, lang, name, topic_id, key in flags_raw:
        flags[flag_id]["key"] = key
        flags[flag_id]["topic_id"] = topic_id
        flags[flag_id]["translations"][lang] = name

    # Build translation entries
    translation_entries = {}
    for topic in topics.values():
        translation_entries[topic["key"]] = topic["translations"]
    for flag in flags.values():
        translation_entries[flag["key"]] = flag["translations"]

    # Build flag structure
    topics_struct = []
    for topic_id, topic_data in sorted(topics.items()):
        topic_entry = {
            "topic": topic_id,
            "topic_name": topic_data["key"],
            "flags": [],
        }
        for flag_id, flag_data in sorted(flags.items()):
            if flag_data["topic_id"] == topic_id:
                topic_entry["flags"].append({"id": flag_id, "name": flag_data["key"]})
        topics_struct.append(topic_entry)

    # Generate TS content
    def indent(level):
        return " " * level

    def generate_translations():
        lines = []
        lines.append(f"export const {base_name}Translations: Record<string, Record<'en' | 'de' | 'da', string>> = {{")
        for key, translations in sorted(translation_entries.items()):
            lines.append(f"{indent(4)}{key}: {{")
            for lang in LANGS:
                value = translations.get(lang, "")
                lines.append(f"{indent(8)}{lang}: '{value}',")
            lines.append(f"{indent(4)}}},")
        lines.append("}")
        return "\n".join(lines)

    def generate_flags():
        lines = []
        lines.append(f"export const {base_name}Flags = [")
        for topic in topics_struct:
            lines.append(f"{indent(4)}{{")
            lines.append(f"{indent(8)}topic: {topic['topic']},")
            lines.append(f"{indent(8)}topic_name: '{topic['topic_name']}',")
            lines.append(f"{indent(8)}flags: [")
            for flag in topic["flags"]:
                lines.append(f"{indent(12)}{{ id: {flag['id']}, name: '{flag['name']}' }},")
            lines.append(f"{indent(8)}],")
            lines.append(f"{indent(4)}}},")
        lines.append("]")
        return "\n".join(lines)

    header = f"""/*
    src/i18n/{OUTPUT_FILE.name}

    {date.today()}, Auto-generated
*/
"""
    content = header + "\n" + generate_translations() + "\n\n" + generate_flags()

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(content, encoding="utf-8")

    print(f"✔ TypeScript i18n file generated successfully at {OUTPUT_FILE}")


# ---------------------------
# Run script
# ---------------------------

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python generate_i18n.py <flag_table> <topic_table> <base_name> <output_file_path>")
        sys.exit(1)

    flag_table = sys.argv[1]
    topic_table = sys.argv[2]
    base_name = sys.argv[3]
    output_file_path = sys.argv[4]

    generate_i18n_flags_file(flag_table, topic_table, base_name, output_file_path)