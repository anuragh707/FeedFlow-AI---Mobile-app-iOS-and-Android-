from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security
from backend.services.gemini_service import GeminiService

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/analyze", response_model=schemas.AIAnalysisResponse)
async def analyze_custom_post(
    payload: schemas.AIAnalysisRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes a custom text entry using Gemini, classifying it into a category
    and calculating relevance & match scores based on the current user's preferences.
    """
    if not payload.content_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content text cannot be empty"
        )
        
    # Analyze category & confidence
    analysis = await GeminiService.analyze_content(payload.content_text)
    category = analysis["category"]
    confidence = analysis["confidence"]
    
    # Retrieve user preferences to calculate scoring
    user_prefs = db.query(models.Preference).filter(models.Preference.user_id == current_user.id).all()
    pref_dict = {p.topic: (p.preference_type, p.weight) for p in user_prefs}
    
    # Calculate scores
    relevance_score, match_score = GeminiService.calculate_scores(category, confidence, pref_dict)
    
    return {
        "category": category,
        "confidence": confidence,
        "relevance_score": relevance_score,
        "preference_match_score": match_score
    }
