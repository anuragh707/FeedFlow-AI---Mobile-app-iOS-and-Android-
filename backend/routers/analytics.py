import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security
from backend.services.gemini_service import GeminiService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=schemas.AnalyticsDashboardResponse)
async def get_dashboard_data(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch job, connection, analytics
    job = db.query(models.AutomationJob).filter(models.AutomationJob.user_id == current_user.id).first()
    conn = db.query(models.InstagramConnection).filter(models.InstagramConnection.user_id == current_user.id).first()
    analytics = db.query(models.Analytics).filter(models.Analytics.user_id == current_user.id).first()

    # Load recent scores to build history charts and calculations
    scores = db.query(models.ContentScore)\
        .filter(models.ContentScore.user_id == current_user.id)\
        .order_by(models.ContentScore.created_at.asc())\
        .all()

    # Base values
    automation_status = job.status if job else "DISABLED"
    actions_completed = job.actions_completed if job else 0
    last_sync = conn.last_synchronized_at if conn else None
    
    personalization_score = 50.0
    feed_relevance_pct = 50.0
    preference_accuracy_pct = 75.0
    content_distribution = {}

    if analytics:
        personalization_score = analytics.personalization_score
        feed_relevance_pct = analytics.feed_relevance_pct
        preference_accuracy_pct = analytics.preference_accuracy_pct
        content_distribution = analytics.content_distribution

    # Compute improvement % based on first half vs second half of scores
    improvement_pct = 0.0
    previous_score = 50.0
    
    if len(scores) >= 4:
        half = len(scores) // 2
        first_half_avg = sum(s.preference_match_score for s in scores[:half]) / half
        second_half_avg = sum(s.preference_match_score for s in scores[half:]) / (len(scores) - half)
        
        previous_score = round(first_half_avg, 1)
        if first_half_avg > 0:
            improvement_pct = round(((second_half_avg - first_half_avg) / first_half_avg) * 100.0, 1)
        else:
            improvement_pct = 0.0

    # Build chronological line chart history data
    history_data = []
    # Take at most last 15 scores to avoid cluttering charts
    for idx, s in enumerate(scores[-15:]):
        history_data.append({
            "id": s.id,
            "label": f"P{idx + 1}",
            "match_score": s.preference_match_score,
            "relevance": s.relevance_score,
            "category": s.category,
            "timestamp": s.created_at.strftime("%I:%M %p")
        })

    # Fetch preferences for AI insight generation context
    prefs = db.query(models.Preference).filter(models.Preference.user_id == current_user.id).all()
    
    # Generate AI insights using Gemini
    insights = await GeminiService.generate_insights(scores, prefs)

    return {
        "automation_status": automation_status,
        "actions_completed": actions_completed,
        "last_sync": last_sync,
        "personalization_score": personalization_score,
        "previous_score": previous_score,
        "improvement_pct": improvement_pct,
        "feed_relevance_pct": feed_relevance_pct,
        "preference_accuracy_pct": preference_accuracy_pct,
        "content_distribution": content_distribution,
        "history": history_data,
        "insights": insights
    }

@router.get("/logs", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(models.ActivityLog)\
        .filter(models.ActivityLog.user_id == current_user.id)\
        .order_by(models.ActivityLog.created_at.desc())\
        .limit(25)\
        .all()
    return logs
