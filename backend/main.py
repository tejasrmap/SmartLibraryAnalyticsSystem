from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List
import models, schemas, database
from database import engine, get_db
from sqlalchemy import func
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Booklytics Intelligence API")

# Configure Production CORS
frontend_url = os.getenv("FRONTEND_URL")

if frontend_url and frontend_url != "*":
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://booklytics-ten.vercel.app",
        frontend_url,
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # If no URL specified, allow ALL for initial testing
    # Note: allow_credentials must be False when using "*"
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )





@app.get("/")
def read_root():
    return {"message": "Booklytics Intelligence System API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Booklytics Backend"}

# --- Books ---
@app.get("/books", response_model=List[schemas.Book])
def get_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Book).offset(skip).limit(limit).all()

@app.get("/books/paginated", response_model=schemas.PaginatedBooks)
def get_books_paginated(skip: int = 0, limit: int = 10, search: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Book)
    if search:
        query = query.filter(
            (models.Book.title.contains(search)) | 
            (models.Book.author.contains(search)) | 
            (models.Book.isbn.contains(search))
        )
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@app.post("/books", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(book_id: int, book_update: schemas.BookUpdate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    update_data = book_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_book, key, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

@app.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Resource successfully decommissioned"}


# --- Members ---
@app.get("/members", response_model=List[schemas.Member])
def get_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Member).offset(skip).limit(limit).all()

@app.post("/members", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = models.Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

# --- Transactions ---
@app.post("/transactions/issue", response_model=schemas.Transaction)
def issue_book(book_id: int, member_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book or book.status != models.BookStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Book not available")
    
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    transaction = models.Transaction(
        book_id=book_id,
        member_id=member_id,
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=14)
    )
    book.status = models.BookStatus.ISSUED
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

@app.post("/transactions/return/{transaction_id}", response_model=schemas.Transaction)
def return_book(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction or transaction.return_date:
        raise HTTPException(status_code=400, detail="Transaction not found or already returned")
    
    transaction.return_date = date.today()
    transaction.book.status = models.BookStatus.AVAILABLE
    
    # Simple fine calculation: $1 per day overdue
    if transaction.return_date > transaction.due_date:
        overdue_days = (transaction.return_date - transaction.due_date).days
        transaction.fine_amount = float(overdue_days * 1.0)
    
    db.commit()
    db.refresh(transaction)
    return transaction

# --- Analytics ---
@app.get("/analytics/summary", response_model=schemas.AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total_books = db.query(models.Book).count()
    available_books = db.query(models.Book).filter(models.Book.status == models.BookStatus.AVAILABLE).count()
    issued_books = db.query(models.Book).filter(models.Book.status == models.BookStatus.ISSUED).count()
    total_members = db.query(models.Member).count()
    
    overdue_count = db.query(models.Transaction).filter(
        models.Transaction.return_date == None,
        models.Transaction.due_date < date.today()
    ).count()
    
    # Category Distribution
    categories = db.query(models.Book.category, func.count(models.Book.id)).group_by(models.Book.category).all()
    cat_dist = {cat: count for cat, count in categories}
    
    # Borrowing trends (last 6 months)
    # This is a simplified version
    monthly_trends = {}
    for i in range(6):
        target_month = (date.today() - timedelta(days=30*i)).strftime("%Y-%m")
        monthly_trends[target_month] = db.query(models.Transaction).filter(
            func.strftime("%Y-%m", models.Transaction.issue_date) == target_month
        ).count()
    
    return {
        "total_books": total_books,
        "available_books": available_books,
        "issued_books": issued_books,
        "total_members": total_members,
        "overdue_transactions": overdue_count,
        "category_distribution": cat_dist,
        "monthly_borrowing": monthly_trends
    }

@app.get("/analytics/recent", response_model=List[schemas.TransactionLogRow])
def get_recent_transactions(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).order_by(models.Transaction.issue_date.desc()).limit(10).all()
    
    results = []
    for tx in transactions:
        results.append({
            "id": tx.id,
            "book_title": tx.book.title,
            "member_name": tx.member.name,
            "issue_date": tx.issue_date,
            "type": "Issue" if not tx.return_date else "Return"
        })
    return results

