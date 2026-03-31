from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import date, timedelta

class BookStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ISSUED = "Issued"
    LOST = "Lost"

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    isbn = Column(String, unique=True, index=True)
    category = Column(String)
    cover_url = Column(String, nullable=True)
    publisher = Column(String, nullable=True)
    pages = Column(Integer, nullable=True)
    status = Column(Enum(BookStatus), default=BookStatus.AVAILABLE)
    added_date = Column(Date, default=date.today)


    transactions = relationship("Transaction", back_populates="book")

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    membership_date = Column(Date, default=date.today)

    transactions = relationship("Transaction", back_populates="member")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"))
    member_id = Column(Integer, ForeignKey("members.id"))
    issue_date = Column(Date, default=date.today)
    due_date = Column(Date, default=lambda: date.today() + timedelta(days=14))
    return_date = Column(Date, nullable=True)
    fine_amount = Column(Float, default=0.0)

    book = relationship("Book", back_populates="transactions")
    member = relationship("Member", back_populates="transactions")
