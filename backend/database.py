import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Handle Cloud/Production Database URL
# Note: For Supabase Transaction Mode, use the link you provided.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./library.db")

# Standard fix for Postgres protocol prefix (Heroku/Render/Railway)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

# Supabase or Cloud Postgres usually require a pool configuration
engine = create_engine(
    DATABASE_URL, 
    pool_size=10, 
    max_overflow=20,
    connect_args={"check_same_thread": False} if is_sqlite else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
