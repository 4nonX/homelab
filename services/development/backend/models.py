from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Portfolio data (parsed from resume)
    language = Column(String(10), default="en")
    name = Column(String, nullable=False)
    title = Column(String)
    email = Column(String)
    phone = Column(String)
    location = Column(String)
    summary = Column(Text)
    skills = Column(JSON)  # Array of strings
    experience = Column(JSON)  # Array of objects
    education = Column(JSON)  # Array of objects
    projects = Column(JSON)  # Array of objects
    certifications = Column(JSON)  # Array of objects
    languages_spoken = Column(JSON)  # Array of objects
    profile_photo = Column(Text)  # Base64 encoded image
    
    # Customization
    theme = Column(String, default="modern")
    custom_css = Column(Text)
    show_contact = Column(Boolean, default=True)
    
    # Metadata
    original_filename = Column(String)
    resume_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published = Column(Boolean, default=True)
    
    # Analytics
    views = Column(Integer, default=0)
    
    # Relations
    user = relationship("User", back_populates="portfolios")

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    sender_name = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
