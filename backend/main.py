import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import engine, Base
from backend.routers import auth, preferences, instagram, automation, analytics, ai

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FeedFlow API",
    description="AI-Driven Personalization Engine for Social Content",
    version="1.0.0"
)

# Configure CORS for Expo mobile clients and web interfaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Modules
app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(instagram.router)
app.include_router(automation.router)
app.include_router(analytics.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FeedFlow AI Core",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
