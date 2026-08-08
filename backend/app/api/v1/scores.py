from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.score import ScoreResponse, ScoreSummaryResponse
from app.services.score_service import ScoreService


router = APIRouter(
    prefix="/scores",
    tags=["Scores"],
)


@router.get(
    "/children/{child_id}",
    response_model=ScoreResponse,
)
def get_child_score(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ScoreService(db)

    try:
        return ScoreResponse(
            today=service.get_today_score(
                current_user.id,
                child_id,
            ),
            week=service.get_week_score(
                current_user.id,
                child_id,
            ),
            month=service.get_month_score(
                current_user.id,
                child_id,
            ),
            total=service.get_total_score(
                current_user.id,
                child_id,
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )


@router.get(
    "/children/{child_id}/summary",
    response_model=ScoreSummaryResponse,
)
def get_child_score_summary(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ScoreService(db)

    # Date ranges
    today = date.today()

    week_start = today - timedelta(
        days=today.weekday()
    )

    month_start = today.replace(day=1)

    try:
        return ScoreSummaryResponse(
            today=service.get_today_score(
                current_user.id,
                child_id,
            ),
            week=service.get_week_score(
                current_user.id,
                child_id,
            ),
            month=service.get_month_score(
                current_user.id,
                child_id,
            ),
            total=service.get_total_score(
                current_user.id,
                child_id,
            ),
            today_completions=service.get_completion_count(
                current_user.id,
                child_id,
                today,
                today,
            ),
            week_completions=service.get_completion_count(
                current_user.id,
                child_id,
                week_start,
                today,
            ),
            month_completions=service.get_completion_count(
                current_user.id,
                child_id,
                month_start,
                today,
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )