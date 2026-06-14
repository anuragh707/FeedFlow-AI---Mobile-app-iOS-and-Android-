import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security

router = APIRouter(prefix="/instagram", tags=["instagram"])

# Simulated profile pictures
AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
]

@router.get("/status", response_model=schemas.InstagramConnectionResponse)
def get_instagram_status(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    conn = db.query(models.InstagramConnection).filter(models.InstagramConnection.user_id == current_user.id).first()
    if not conn:
        # Lazy provision
        conn = models.InstagramConnection(user_id=current_user.id)
        db.add(conn)
        db.commit()
        db.refresh(conn)
    return conn

@router.post("/connect", response_model=schemas.InstagramConnectionResponse)
def connect_instagram(
    payload: schemas.InstagramConnectRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    conn = db.query(models.InstagramConnection).filter(models.InstagramConnection.user_id == current_user.id).first()
    if not conn:
        conn = models.InstagramConnection(user_id=current_user.id)
        db.add(conn)

    # Perform high-fidelity connection simulation
    conn.status = "CONNECTED"
    conn.username = payload.username
    conn.profile_picture_url = random.choice(AVATARS)
    conn.last_synchronized_at = datetime.datetime.utcnow()
    
    # Log connection
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="INSTAGRAM_CONNECT",
        message=f"Simulated Instagram connection established with @{payload.username}."
    )
    db.add(log)
    
    db.commit()
    db.refresh(conn)
    return conn

@router.post("/disconnect", response_model=schemas.InstagramConnectionResponse)
def disconnect_instagram(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    conn = db.query(models.InstagramConnection).filter(models.InstagramConnection.user_id == current_user.id).first()
    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instagram connection profile not found"
        )
        
    conn.status = "DISCONNECTED"
    conn.username = None
    conn.profile_picture_url = None
    conn.last_synchronized_at = None
    
    # Log disconnection
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="INSTAGRAM_CONNECT",
        message="Instagram account disconnected."
    )
    db.add(log)
    
    db.commit()
    db.refresh(conn)
    return conn
