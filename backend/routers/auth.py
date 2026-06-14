from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )

    # Hash the password
    hashed_password = security.get_password_hash(user_in.password)

    # Create new user
    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Provision default models for simulated dashboard correctness
    # 1. Default Instagram Connection
    instagram_conn = models.InstagramConnection(
        user_id=new_user.id,
        status="DISCONNECTED",
        username=None,
        profile_picture_url=None
    )
    db.add(instagram_conn)

    # 2. Default Preferences (4 positive, 2 negative)
    defaults = [
        ("Artificial Intelligence", "MORE", 10),
        ("Productivity", "MORE", 8),
        ("Startups", "MORE", 9),
        ("Technology", "MORE", 8),
        ("Gossip", "LESS", 10),
        ("Politics", "LESS", 8)
    ]
    for topic, pref_type, weight in defaults:
        pref = models.Preference(
            user_id=new_user.id,
            topic=topic,
            preference_type=pref_type,
            weight=weight
        )
        db.add(pref)

    # 3. Default Automation Job
    auto_job = models.AutomationJob(
        user_id=new_user.id,
        status="DISABLED",
        run_interval_hours=6
    )
    db.add(auto_job)

    # 4. Default Analytics Snapshot
    analytics = models.Analytics(
        user_id=new_user.id,
        personalization_score=50.0,
        feed_relevance_pct=50.0,
        preference_accuracy_pct=75.0,
        actions_completed=0,
        content_distribution={}
    )
    db.add(analytics)

    # Log registration activity
    log = models.ActivityLog(
        user_id=new_user.id,
        activity_type="AUTH",
        message="Account registered. Default preferences and templates provisioned."
    )
    db.add(log)
    
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm username field matches email in our design
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log Login activity
    log = models.ActivityLog(
        user_id=user.id,
        activity_type="AUTH",
        message="Successful user login via API."
    )
    db.add(log)
    db.commit()

    # Generate Access Token
    access_token = security.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    # Simulates logout endpoint
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="AUTH",
        message="User logged out of session."
    )
    db.add(log)
    db.commit()
    return {"message": "Logged out successfully"}

@router.get("/profile", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(security.get_current_user)):
    return current_user
