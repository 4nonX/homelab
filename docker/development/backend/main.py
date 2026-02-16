from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import pdfplumber
import os
import shutil
from datetime import datetime

from database import get_db, init_db
from models import User, Portfolio, ContactMessage
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user
)
from ai_parser import parse_resume_with_ai, get_labels

# Initialize FastAPI
app = FastAPI(title="Portfolio Builder API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PortfolioUpdate(BaseModel):
    theme: Optional[str] = None
    show_contact: Optional[bool] = None
    published: Optional[bool] = None
    name: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None
    languages_spoken: Optional[List[dict]] = None
    profile_photo: Optional[str] = None

class ContactMessageCreate(BaseModel):
    sender_name: str
    sender_email: EmailStr
    message: str

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio Builder API"}

# ==================== AUTH ROUTES ====================

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )

    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username
        }
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

# ==================== PORTFOLIO ROUTES ====================

@app.post("/api/portfolio/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{current_user.username}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )

    try:
        parsed_data = parse_resume_with_ai(text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )

    existing_portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()

    if existing_portfolio:
        existing_portfolio.language = parsed_data["language"]
        existing_portfolio.name = parsed_data["name"]
        existing_portfolio.title = parsed_data.get("title")
        existing_portfolio.email = parsed_data.get("email")
        existing_portfolio.phone = parsed_data.get("phone")
        existing_portfolio.location = parsed_data.get("location")
        existing_portfolio.summary = parsed_data.get("summary")
        existing_portfolio.skills = parsed_data.get("skills", [])
        existing_portfolio.experience = parsed_data.get("experience", [])
        existing_portfolio.education = parsed_data.get("education", [])
        existing_portfolio.projects = parsed_data.get("projects", [])
        existing_portfolio.certifications = parsed_data.get("certifications", [])
        existing_portfolio.languages_spoken = parsed_data.get("languages_spoken", [])
        existing_portfolio.original_filename = file.filename
        existing_portfolio.resume_path = file_path
        existing_portfolio.updated_at = datetime.utcnow()
        portfolio = existing_portfolio
    else:
        portfolio = Portfolio(
            user_id=current_user.id,
            language=parsed_data["language"],
            name=parsed_data["name"],
            title=parsed_data.get("title"),
            email=parsed_data.get("email"),
            phone=parsed_data.get("phone"),
            location=parsed_data.get("location"),
            summary=parsed_data.get("summary"),
            skills=parsed_data.get("skills", []),
            experience=parsed_data.get("experience", []),
            education=parsed_data.get("education", []),
            projects=parsed_data.get("projects", []),
            certifications=parsed_data.get("certifications", []),
            languages_spoken=parsed_data.get("languages_spoken", []),
            original_filename=file.filename,
            resume_path=file_path
        )
        db.add(portfolio)

    db.commit()
    db.refresh(portfolio)

    return {
        "message": "Resume uploaded and parsed successfully",
        "portfolio_id": portfolio.id,
        "language": portfolio.language
    }

@app.get("/api/portfolio/me")
def get_my_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    return {
        "id": portfolio.id,
        "language": portfolio.language,
        "name": portfolio.name,
        "title": portfolio.title,
        "email": portfolio.email,
        "phone": portfolio.phone,
        "location": portfolio.location,
        "summary": portfolio.summary,
        "skills": portfolio.skills,
        "experience": portfolio.experience,
        "education": portfolio.education,
        "projects": portfolio.projects,
        "certifications": portfolio.certifications,
        "languages_spoken": portfolio.languages_spoken,
        "profile_photo": portfolio.profile_photo,
        "theme": portfolio.theme,
        "show_contact": portfolio.show_contact,
        "published": portfolio.published,
        "views": portfolio.views,
        "created_at": portfolio.created_at,
        "updated_at": portfolio.updated_at
    }

@app.patch("/api/portfolio/me")
def update_portfolio(
    update_data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    if update_data.theme is not None:
        portfolio.theme = update_data.theme
    if update_data.show_contact is not None:
        portfolio.show_contact = update_data.show_contact
    if update_data.published is not None:
        portfolio.published = update_data.published
    if update_data.name is not None:
        portfolio.name = update_data.name
    if update_data.title is not None:
        portfolio.title = update_data.title
    if update_data.summary is not None:
        portfolio.summary = update_data.summary
    if update_data.location is not None:
        portfolio.location = update_data.location
    if update_data.email is not None:
        portfolio.email = update_data.email
    if update_data.phone is not None:
        portfolio.phone = update_data.phone
    if update_data.skills is not None:
        portfolio.skills = update_data.skills
    if update_data.experience is not None:
        portfolio.experience = update_data.experience
    if update_data.education is not None:
        portfolio.education = update_data.education
    if update_data.projects is not None:
        portfolio.projects = update_data.projects
    if update_data.certifications is not None:
        portfolio.certifications = update_data.certifications
    if update_data.languages_spoken is not None:
        portfolio.languages_spoken = update_data.languages_spoken
    if update_data.profile_photo is not None:
        portfolio.profile_photo = update_data.profile_photo
        
    portfolio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portfolio)

    return {"message": "Portfolio updated successfully"}

@app.get("/api/portfolio/{username}")
def get_public_portfolio(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == user.id,
        Portfolio.published == True
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or not published"
        )

    portfolio.views += 1
    db.commit()

    labels = get_labels(portfolio.language)

    return {
        "username": user.username,
        "language": portfolio.language,
        "name": portfolio.name,
        "title": portfolio.title,
        "email": portfolio.email if portfolio.show_contact else None,
        "phone": portfolio.phone if portfolio.show_contact else None,
        "location": portfolio.location,
        "summary": portfolio.summary,
        "skills": portfolio.skills,
        "experience": portfolio.experience,
        "education": portfolio.education,
        "projects": portfolio.projects,
        "certifications": portfolio.certifications,
        "languages_spoken": portfolio.languages_spoken,
        "profile_photo": portfolio.profile_photo,
        "theme": portfolio.theme,
        "show_contact": portfolio.show_contact,
        "views": portfolio.views,
        "labels": labels
    }

@app.get("/api/portfolios")
def list_portfolios(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    portfolios = db.query(Portfolio, User).join(User).filter(
        Portfolio.published == True
    ).order_by(Portfolio.created_at.desc()).limit(limit).offset(offset).all()

    return [
        {
            "username": user.username,
            "name": portfolio.name,
            "title": portfolio.title,
            "views": portfolio.views,
            "created_at": portfolio.created_at
        }
        for portfolio, user in portfolios
    ]

# ==================== CONTACT ROUTES ====================

@app.post("/api/contact/{username}")
def send_contact_message(
    username: str,
    message_data: ContactMessageCreate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    message = ContactMessage(
        portfolio_id=portfolio.id,
        sender_name=message_data.sender_name,
        sender_email=message_data.sender_email,
        message=message_data.message
    )

    db.add(message)
    db.commit()

    return {"message": "Message sent successfully"}

@app.get("/api/contact/messages")
def get_contact_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        return []

    messages = db.query(ContactMessage).filter(
        ContactMessage.portfolio_id == portfolio.id
    ).order_by(ContactMessage.created_at.desc()).all()

    return [
        {
            "id": msg.id,
            "sender_name": msg.sender_name,
            "sender_email": msg.sender_email,
            "message": msg.message,
            "created_at": msg.created_at,
            "read": msg.read
        }
        for msg in messages
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
