from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.point_transaction import PointTransaction


class ScoreService:

    def __init__(self, db: Session):
        self.db = db

    def _verify_child(
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

    def get_today_score(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> int:

        self._verify_child(parent_id, child_id)

        today = date.today()

        result = (
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

        return int(result or 0)

    def get_week_score(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> int:

        self._verify_child(parent_id, child_id)

        today = date.today()

        # Monday = start of week
        week_start = today - timedelta(
            days=today.weekday()
        )

        result = (
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

        return int(result or 0)

    def get_month_score(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> int:

        self._verify_child(parent_id, child_id)

        today = date.today()

        month_start = today.replace(day=1)

        result = (
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

        return int(result or 0)

    def get_total_score(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> int:

        self._verify_child(parent_id, child_id)

        result = (
            self.db.query(
                func.coalesce(
                    func.sum(PointTransaction.points),
                    0,
                )
            )
            .filter(
                PointTransaction.child_id == child_id,
            )
            .scalar()
        )

        return int(result or 0)

    def get_completion_count(
        self,
        parent_id: UUID,
        child_id: UUID,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> int:

        self._verify_child(parent_id, child_id)

        query = (
            self.db.query(
                func.count(PointTransaction.id)
            )
            .filter(
                PointTransaction.child_id == child_id,
            )
        )

        if start_date:
            query = query.filter(
                PointTransaction.completed_date >= start_date
            )

        if end_date:
            query = query.filter(
                PointTransaction.completed_date <= end_date
            )

        return int(query.scalar() or 0)