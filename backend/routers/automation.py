import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models import models
from backend.schemas import schemas
from backend.utils import security
from backend.services.automation_service import AutomationService

router = APIRouter(prefix="/automation", tags=["automation"])

@router.get("/status", response_model=schemas.AutomationStatusResponse)
def get_automation_status(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.AutomationJob).filter(models.AutomationJob.user_id == current_user.id).first()
    if not job:
        # Lazy provision
        job = models.AutomationJob(user_id=current_user.id)
        db.add(job)
        db.commit()
        db.refresh(job)
    return job

@router.post("/start", response_model=schemas.AutomationStatusResponse)
def start_automation(
    payload: schemas.AutomationStartRequest,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.AutomationJob).filter(models.AutomationJob.user_id == current_user.id).first()
    if not job:
        job = models.AutomationJob(user_id=current_user.id)
        db.add(job)
        
    job.status = "ACTIVE"
    job.run_interval_hours = payload.run_interval_hours
    job.last_run_at = datetime.datetime.utcnow()
    job.next_run_at = job.last_run_at + datetime.timedelta(hours=job.run_interval_hours)
    
    # Log
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="AUTOMATION_RUN",
        message=f"FeedFlow Personalization Engine activated. Interval: {payload.run_interval_hours} hr(s)."
    )
    db.add(log)
    
    db.commit()
    db.refresh(job)
    return job

@router.post("/stop", response_model=schemas.AutomationStatusResponse)
def stop_automation(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(models.AutomationJob).filter(models.AutomationJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation job not found"
        )
        
    job.status = "PAUSED"
    job.next_run_at = None
    
    # Log
    log = models.ActivityLog(
        user_id=current_user.id,
        activity_type="AUTOMATION_RUN",
        message="FeedFlow Personalization Engine paused."
    )
    db.add(log)
    
    db.commit()
    db.refresh(job)
    return job

@router.post("/trigger")
async def trigger_automation_sync(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually triggers one simulation sync run. This processes mock posts,
    scores them with Gemini, and updates the analytics database.
    """
    results, trace = await AutomationService.simulate_sync_step(db, current_user.id)
    return {
        "message": f"Successfully processed {len(results)} posts.",
        "results": results,
        "trace": trace
    }
