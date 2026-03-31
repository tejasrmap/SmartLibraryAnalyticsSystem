import csv
with open('books.csv', mode='r', encoding='utf-8', errors='ignore') as f:
    reader = csv.reader(f)
    header = next(reader)
    print(f"Header: {header}")
    first_row = next(reader)
    print(f"First row: {first_row}")
    print(f"Row length: {len(first_row)}")
