from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine

from app.api.v1.auth import router as auth_router
from app.api.v1.children import router as children_router
from app.api.v1.habits import router as habits_router
from app.api.v1.scores import router as scores_router
from app.api.v1.rewards import router as rewards_router

app = FastAPI(
    title="RewardNest API",
    version="0.1.0",
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    children_router,
    prefix="/api/v1",
)

app.include_router(
    habits_router,
    prefix="/api/v1",
)

app.include_router(
    scores_router,
    prefix="/api/v1",
)

app.include_router(
    rewards_router,
    prefix="/api/v1",
)

@app.get("/")
def home():
    return {"message": "RewardNest API"}


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }