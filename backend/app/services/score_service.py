from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.point_transaction import PointTransaction


class ScoreService:

    def __init__(self, db: Session):
        self.db = db

    def validate_child(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> Child:

        child = (
            self.db.query(Child)
            .filter(
                Child.id == child_id,
                Child.parent_id == parent_id,
            )
            .first()
        )

        if not child:
            raise ValueError("Child not found")

        return child

    def get_total_points(
        self,
        child_id: UUID,
    ) -> int:

        total = (
            self.db.query(
                func.coalesce(
                    func.sum(PointTransaction.points),
                    0,
                )
            )
            .filter(
                PointTransaction.child_id == child_id
            )
            .scalar()
        )

        return int(total or 0)

    def get_daily_points(
        self,
        child_id: UUID,
        reference_date: date | None = None,
    ) -> int:

        today = reference_date or date.today()

        total = (
            self.db.query(
                func.coalesce(
                    func.sum(PointTransaction.points),
                    0,
                )
            )
            .filter(
                PointTransaction.child_id == child_id,
                PointTransaction.completed_date == today,
            )
            .scalar()
        )

        return int(total or 0)

    def get_weekly_points(
        self,
        child_id: UUID,
        reference_date: date | None = None,
    ) -> int:

        today = reference_date or date.today()

        week_start = today - timedelta(
            days=today.weekday()
        )

        total = (
            self.db.query(
                func.coalesce(
                    func.sum(PointTransaction.points),
                    0,
                )
            )
            .filter(
                PointTransaction.child_id == child_id,
                PointTransaction.completed_date >= week_start,
                PointTransaction.completed_date <= today,
            )
            .scalar()
        )

        return int(total or 0)

    def get_monthly_points(
        self,
        child_id: UUID,
        reference_date: date | None = None,
    ) -> int:

        today = reference_date or date.today()

        month_start = today.replace(day=1)

        total = (
            self.db.query(
                func.coalesce(
                    func.sum(PointTransaction.points),
                    0,
                )
            )
            .filter(
                PointTransaction.child_id == child_id,
                PointTransaction.completed_date >= month_start,
                PointTransaction.completed_date <= today,
            )
            .scalar()
        )

        return int(total or 0)

    def get_score_summary(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> dict:

        self.validate_child(
            parent_id=parent_id,
            child_id=child_id,
        )

        return {
            "child_id": child_id,
            "daily_points": self.get_daily_points(
                child_id
            ),
            "weekly_points": self.get_weekly_points(
                child_id
            ),
            "monthly_points": self.get_monthly_points(
                child_id
            ),
            "total_points": self.get_total_points(
                child_id
            ),
        }

    def get_completion_count(
        self,
        child_id: UUID,
        start_date: date,
        end_date: date,
    ) -> int:

        count = (
            self.db.query(PointTransaction.id)
            .filter(
                PointTransaction.child_id == child_id,
                PointTransaction.completed_date >= start_date,
                PointTransaction.completed_date <= end_date,
            )
            .count()
        )

        return count