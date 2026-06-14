import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Text, Index
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    instagram_connection = relationship("InstagramConnection", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("Preference", back_populates="user", cascade="all, delete-orphan")
    automation_job = relationship("AutomationJob", back_populates="user", uselist=False, cascade="all, delete-orphan")
    content_scores = relationship("ContentScore", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")


class InstagramConnection(Base):
    __tablename__ = "instagram_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(50), default="DISCONNECTED", nullable=False)  # CONNECTED, DISCONNECTED, CONNECTING
    username = Column(String(100), nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    last_synchronized_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="instagram_connection")


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(100), index=True, nullable=False)
    preference_type = Column(String(50), nullable=False)  # MORE, LESS
    weight = Column(Integer, default=10, nullable=False)  # 1 to 10 scale
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="preferences")

    # Indexing unique preferences per user
    __table_args__ = (
        Index("idx_user_topic", "user_id", "topic"),
    )


class AutomationJob(Base):
    __tablename__ = "automation_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(50), default="DISABLED", nullable=False)  # ACTIVE, PAUSED, DISABLED
    run_interval_hours = Column(Integer, default=6, nullable=False)  # 1, 6
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    actions_completed = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="automation_job")


class ContentScore(Base):
    __tablename__ = "content_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_text = Column(Text, nullable=False)
    content_source = Column(String(100), nullable=True)  # Simulated post URL/ID
    category = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    relevance_score = Column(Integer, nullable=False)  # -10 to +10
    preference_match_score = Column(Integer, nullable=False)  # 0 to 100
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="content_scores")


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    personalization_score = Column(Float, default=50.0, nullable=False)  # 0-100 current match
    feed_relevance_pct = Column(Float, default=50.0, nullable=False)     # Relevance percentage
    preference_accuracy_pct = Column(Float, default=50.0, nullable=False) # Preference match accuracy
    actions_completed = Column(Integer, default=0, nullable=False)
    content_distribution = Column(JSON, default=dict, nullable=False)    # { "Topic": count }
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analytics")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False)  # AUTH, INSTAGRAM_CONNECT, AUTOMATION_RUN, PREFERENCE_UPDATE
    message = Column(String(500), nullable=False)
    log_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activity_logs")
