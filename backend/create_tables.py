import sys
import os
from sqlalchemy import create_engine
from models import Base
# Import all models to ensure they are registered with Base
from models import Book, Member, Transaction 

def main():
    if len(sys.argv) < 2:
        print("Usage: python create_tables.py <DATABASE_URL>")
        return

    db_url = sys.argv[1]
    
    # Fix for postgres:// prefix
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    print(f"Connecting to Cloud Database...")
    try:
        engine = create_engine(db_url)
        print("Creating table structures on Supabase...")
        Base.metadata.create_all(bind=engine)
        print("✅ Table structures successfully initialized!")
    except Exception as e:
        print(f"❌ Initialization Failure: {e}")

if __name__ == "__main__":
    main()
