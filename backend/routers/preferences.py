from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security

router = APIRouter(prefix="/preferences", tags=["preferences"])

@router.get("", response_model=List[schemas.PreferenceResponse])
def get_preferences(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    prefs = db.query(models.Preference).filter(models.Preference.user_id == current_user.id).all()
    return prefs

@router.post("/update", response_model=List[schemas.PreferenceResponse])
def update_preferences(
    payload: schemas.PreferencesUpdateRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    # Delete current user preferences
    db.query(models.Preference).filter(models.Preference.user_id == current_user.id).delete()

    # Save new preferences
    saved_prefs = []
    for item in payload.preferences:
        pref = models.Preference(
            user_id=current_user.id,
            topic=item.topic,
            preference_type=item.preference_type,
            weight=item.weight
        )
        db.add(pref)
        saved_prefs.append(pref)

    # Log changes
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="PREFERENCE_UPDATE",
        message=f"Updated content preferences. Saved {len(saved_prefs)} rules."
    )
    db.add(log)
    
    db.commit()
    
    # Refresh session items
    for p in saved_prefs:
        db.refresh(p)
        
    return saved_prefs
