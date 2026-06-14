from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# ==========================================
# Auth Schemas
# ==========================================

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# ==========================================
# Instagram Connection Schemas
# ==========================================

class InstagramConnectRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)

class InstagramConnectionResponse(BaseModel):
    status: str
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    last_synchronized_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================================
# Preference Schemas
# ==========================================

class PreferenceItem(BaseModel):
    topic: str
    preference_type: str  # MORE, LESS
    weight: int = Field(10, ge=1, le=10)

class PreferencesUpdateRequest(BaseModel):
    preferences: List[PreferenceItem]

class PreferenceResponse(BaseModel):
    id: int
    topic: str
    preference_type: str
    weight: int

    class Config:
        from_attributes = True

# ==========================================
# Automation Schemas
# ==========================================

class AutomationStartRequest(BaseModel):
    run_interval_hours: int = Field(6, ge=1, le=24)

class AutomationStatusResponse(BaseModel):
    status: str
    run_interval_hours: int
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    actions_completed: int

    class Config:
        from_attributes = True

# ==========================================
# AI Schemas
# ==========================================

class AIAnalysisRequest(BaseModel):
    content_text: str

class AIAnalysisResponse(BaseModel):
    category: str
    confidence: float
    relevance_score: int
    preference_match_score: int

class AIInsight(BaseModel):
    message: str
    improvement_pct: Optional[float] = None
    trend_type: str  # POSITIVE, INFO, WARNING

class AnalyticsDashboardResponse(BaseModel):
    automation_status: str
    actions_completed: int
    last_sync: Optional[datetime] = None
    personalization_score: float
    previous_score: float
    improvement_pct: float
    feed_relevance_pct: float
    preference_accuracy_pct: float
    content_distribution: Dict[str, int]
    history: List[Dict[str, Any]]
    insights: List[AIInsight]

# ==========================================
# Activity Log Schema
# ==========================================

class ActivityLogResponse(BaseModel):
    id: int
    activity_type: str
    message: str
    log_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
