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
            today=service.get_daily_points(
                child_id=child_id,
                reference_date=date.today(),
            ),
            week=service.get_weekly_points(
                child_id=child_id,
                reference_date=date.today(),
            ),
            month=service.get_monthly_points(
                child_id=child_id,
                reference_date=date.today(),
            ),
            total=service.get_total_points(
                child_id=child_id,
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

    today = date.today()

    week_start = today - timedelta(
        days=today.weekday()
    )

    month_start = today.replace(day=1)

    try:
        service.validate_child(
            parent_id=current_user.id,
            child_id=child_id,
        )

        return ScoreSummaryResponse(
            today=service.get_daily_points(
                child_id=child_id,
                reference_date=today,
            ),
            week=service.get_weekly_points(
                child_id=child_id,
                reference_date=today,
            ),
            month=service.get_monthly_points(
                child_id=child_id,
                reference_date=today,
            ),
            total=service.get_total_points(
                child_id=child_id,
            ),
            today_completions=service.get_completion_count(
                child_id=child_id,
                start_date=today,
                end_date=today,
            ),
            week_completions=service.get_completion_count(
                child_id=child_id,
                start_date=week_start,
                end_date=today,
            ),
            month_completions=service.get_completion_count(
                child_id=child_id,
                start_date=month_start,
                end_date=today,
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )