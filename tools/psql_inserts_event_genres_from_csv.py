import csv
from datetime import datetime

INPUT_CSV = "uranus-event-types-and-genres.csv"  # Change this to your CSV filename

def sql_escape(value: str) -> str:
    """Escape single quotes for SQL."""
    return value.replace("'", "''")

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

with open(INPUT_CSV, newline="", encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)

    for row in reader:
        # Skip empty or malformed rows
        if len(row) < 4:
            continue

        # Skip header or non-numeric IDs
        try:
            type_id = int(row[0])
        except ValueError:
            continue

        # Only type_id >= 1000
        if type_id < 1000:
            continue

        # Calculate event_type_id
        event_type_id = type_id // 1000

        da, de, en = row[1], row[2], row[3]

        entries = [
            ("da", da),
            ("de", de),
            ("en", en),
        ]

        for lang, name in entries:
            if not name.strip():
                continue

            print(
                "INSERT INTO uranus.genre_type "
                "(type_id, name, iso_639_1, modified_at, event_type_id) "
                f"VALUES ({type_id}, '{sql_escape(name)}', '{lang}', '{now}', {event_type_id});"
            )