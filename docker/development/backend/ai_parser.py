import google.generativeai as genai
import json
import os
from typing import Dict, Any

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)

# Translations for UI labels
LABEL_TRANSLATIONS = {
    "en": {
        "about": "About",
        "skills": "Skills",
        "experience": "Experience",
        "education": "Education",
        "projects": "Projects",
        "certifications": "Certifications",
        "languages": "Languages",
        "contact": "Contact"
    },
    "de": {
        "about": "Über mich",
        "skills": "Fähigkeiten",
        "experience": "Berufserfahrung",
        "education": "Ausbildung",
        "projects": "Projekte",
        "certifications": "Zertifikate",
        "languages": "Sprachen",
        "contact": "Kontakt"
    },
    "fr": {
        "about": "À propos",
        "skills": "Compétences",
        "experience": "Expérience professionnelle",
        "education": "Formation",
        "projects": "Projets",
        "certifications": "Certifications",
        "languages": "Langues",
        "contact": "Contact"
    },
    "ko": {
        "about": "소개",
        "skills": "기술",
        "experience": "경력",
        "education": "학력",
        "projects": "프로젝트",
        "certifications": "자격증",
        "languages": "언어",
        "contact": "연락처"
    },
    "es": {
        "about": "Acerca de",
        "skills": "Habilidades",
        "experience": "Experiencia",
        "education": "Educación",
        "projects": "Proyectos",
        "certifications": "Certificaciones",
        "languages": "Idiomas",
        "contact": "Contacto"
    }
}

def parse_resume_with_ai(resume_text: str) -> Dict[str, Any]:
    """
    Parse resume text using Google Gemini AI
    Detects language and extracts structured data
    """
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
Analyze this resume/CV and extract structured information.

CRITICAL INSTRUCTIONS:
1. Detect the language of the resume (ISO 639-1 code: en, de, fr, ko, es, etc.)
2. Extract ALL information maintaining the ORIGINAL language
3. Return ONLY valid JSON, no markdown formatting, no explanations
4. All text fields must be in the resume's original language

Resume text:
{resume_text}

Return JSON with this exact structure:
{{
  "language": "en|de|fr|ko|es|...",
  "name": "Full name",
  "title": "Job title or professional headline",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, Country",
  "summary": "Professional summary or objective (keep in original language)",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {{
      "company": "Company name",
      "position": "Job title",
      "location": "Location",
      "start_date": "Start date",
      "end_date": "End date or Present",
      "description": "Job description and achievements"
    }}
  ],
  "education": [
    {{
      "institution": "School/University name",
      "degree": "Degree type and field",
      "location": "Location",
      "start_date": "Start date",
      "end_date": "End date",
      "description": "Additional details"
    }}
  ],
  "projects": [
    {{
      "name": "Project name",
      "description": "Project description",
      "technologies": "Technologies used",
      "url": "Project URL if available"
    }}
  ],
  "certifications": [
    {{
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained"
    }}
  ],
  "languages_spoken": [
    {{
      "language": "Language name",
      "proficiency": "Proficiency level"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object, no additional text, no markdown code blocks.
"""
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        data = json.loads(response_text)
        
        # Validate required fields
        if "name" not in data:
            raise ValueError("Failed to extract name from resume")
        
        # Set defaults for missing fields
        data.setdefault("language", "en")
        data.setdefault("title", "")
        data.setdefault("email", "")
        data.setdefault("phone", "")
        data.setdefault("location", "")
        data.setdefault("summary", "")
        data.setdefault("skills", [])
        data.setdefault("experience", [])
        data.setdefault("education", [])
        data.setdefault("projects", [])
        data.setdefault("certifications", [])
        data.setdefault("languages_spoken", [])
        
        return data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing resume with AI: {str(e)}")

def get_labels(language_code: str) -> Dict[str, str]:
    """Get UI labels for a specific language"""
    return LABEL_TRANSLATIONS.get(language_code, LABEL_TRANSLATIONS["en"])
