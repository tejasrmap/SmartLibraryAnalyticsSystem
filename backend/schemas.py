from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from models import BookStatus

class TransactionBase(BaseModel):
    book_id: int
    member_id: int
    issue_date: date
    due_date: date

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    return_date: Optional[date]
    fine_amount: Optional[float]

class Transaction(TransactionBase):
    id: int
    return_date: Optional[date]
    fine_amount: float

    class Config:
        from_attributes = True

class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    cover_url: Optional[str] = None
    publisher: Optional[str] = None
    pages: Optional[int] = 0
    status: BookStatus = BookStatus.AVAILABLE


class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    status: Optional[BookStatus] = None

class Book(BookBase):
    id: int
    added_date: date
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    name: str
    email: str
    phone: str

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Member(MemberBase):
    id: int
    membership_date: date
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_books: int
    available_books: int
    issued_books: int
    total_members: int
    overdue_transactions: int
    category_distribution: dict
    monthly_borrowing: dict

class TransactionLogRow(BaseModel):
    id: int
    book_title: str
    member_name: str
    issue_date: date
    type: str # 'issue', 'return', etc.

class PaginatedBooks(BaseModel):
    total: int
    items: List[Book]


