import csv
import random
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import date, timedelta
import os

# Create tables
models.Base.metadata.create_all(bind=engine)

def clear_db(db: Session):
    try:
        db.query(models.Transaction).delete()
        db.query(models.Member).delete()
        db.query(models.Book).delete()
        db.commit()
    except Exception:
        db.rollback()
        print("Initial setup: No existing data to purge.")


def seed_data():
    db = SessionLocal()
    print("Purging existing data...")
    clear_db(db)
    
    # Categories for distribution
    categories_pool = ["Computer Science", "Mathematics", "Physics", "Fiction", "Biography", "History", "Engineering", "Arts"]
    
    csv_path = "../books.csv"
    if not os.path.exists(csv_path):
        # Fallback if relative path is different
        csv_path = "books.csv"
        
    print(f"Reading data from {csv_path}...")
    
    books = []
    try:
        with open(csv_path, mode='r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            next(reader)  # Skip header
            
            count = 0
            for row in reader:
                if count >= 5000: break
                
                # Column mapping: ISBN10 (0), ISBN13 (1), Title (2), Author (3), Cover (4), Publisher (5), Pages (6)
                isbn_val = row[0]
                title_val = row[2]
                author_val = row[3]
                
                # Skip if empty
                if not title_val or not author_val: continue
                
                # Handle potentially missing columns or malformed page data
                cover_val = row[4] if len(row) > 4 else None
                publisher_val = row[5] if len(row) > 5 else None
                pages_val = int(row[6]) if len(row) > 6 and row[6].strip().isdigit() else 0
                
                book = models.Book(
                    title=title_val[:190],  # Truncate to avoid field overflow
                    author=author_val[:90],
                    isbn=isbn_val[:20],
                    category=random.choice(categories_pool),
                    cover_url=cover_val[:250] if cover_val else None,
                    publisher=publisher_val[:190] if publisher_val else None,
                    pages=pages_val,
                    status=models.BookStatus.AVAILABLE,
                    added_date=date.today() - timedelta(days=random.randint(1, 400)) # Increased spread
                )
                db.add(book)
                books.append(book)
                count += 1
                
        db.commit()
        print(f"Successfully synchronized Athena Registry with {len(books)} high-fidelity records.")
        
    except Exception as e:
        print(f"Error seeding books: {e}")
        db.rollback()
        return

    # Add Members
    members = []
    member_names = ["Alice Vance", "Bob Smith", "Charlie Day", "Diana Prince", "Ethan Hunt", "Fiona Apple", "George Costanza", "Hank Hill", "Ivy League", "Jack Sparrow", "Kim Possible", "Luke Skywalker", "Mona Lisa", "Neo Matrix", "Oscar Wilde", "Peter Parker", "Quinn Fabray", "Ron Weasley", "Sarah Connor", "Tony Stark"]
    
    for i, name in enumerate(member_names):
        member = models.Member(
            name=name,
            email=f"{name.lower().replace(' ', '.')}@athena.edu",
            phone=f"555-0{random.randint(100, 999)}"
        )
        db.add(member)
        members.append(member)
    
    db.commit()
    print(f"Seeded {len(members)} members.")
    
    # Add active transactions for high-fidelity simulation
    print("Generating active transactions...")
    for _ in range(150):
        book = random.choice(books)
        member = random.choice(members)
        
        # Don't double-issue the same book in the seed
        if book.status == models.BookStatus.AVAILABLE:
            issue_date = date.today() - timedelta(days=random.randint(1, 90))
            due_date = issue_date + timedelta(days=14)
            
            # Determine outcome
            rand = random.random()
            return_date = None
            fine = 0.0
            
            if rand > 0.4: # Returned
                return_date = issue_date + timedelta(days=random.randint(1, 20))
                book.status = models.BookStatus.AVAILABLE
                if return_date > due_date:
                    fine = float((return_date - due_date).days * 1.5)
            elif rand > 0.1: # Issued & Not Returned
                book.status = models.BookStatus.ISSUED
            else: # Lost
                book.status = models.BookStatus.LOST
            
            transaction = models.Transaction(
                book_id=book.id,
                member_id=member.id,
                issue_date=issue_date,
                due_date=due_date,
                return_date=return_date,
                fine_amount=fine
            )
            db.add(transaction)

    db.commit()
    db.close()
    print("Database fully synchronized with real data!")

if __name__ == "__main__":
    seed_data()
