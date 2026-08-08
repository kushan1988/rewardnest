from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.reward import Reward
from app.models.point_transaction import PointTransaction
from app.schemas.reward import RewardCreate, RewardUpdate
from app.models.child import Child

class RewardService:

    def __init__(self, db: Session):
        self.db = db

    def create_reward(
        self,
        parent_id: UUID,
        data: RewardCreate,
    ) -> Reward:

        reward = Reward(
            parent_id=parent_id,
            name=data.name.strip(),
            description=data.description,
            points_required=data.points_required,
            period=data.period,
        )

        self.db.add(reward)
        self.db.commit()
        self.db.refresh(reward)

        return reward

    def get_rewards(
        self,
        parent_id: UUID,
    ) -> list[Reward]:

        return (
            self.db.query(Reward)
            .filter(
                Reward.parent_id == parent_id,
                Reward.active.is_(True),
            )
            .order_by(
                Reward.points_required.asc()
            )
            .all()
        )

    def get_reward(
        self,
        parent_id: UUID,
        reward_id: UUID,
    ) -> Reward | None:

        return (
            self.db.query(Reward)
            .filter(
                Reward.id == reward_id,
                Reward.parent_id == parent_id,
            )
            .first()
        )

    def update_reward(
        self,
        parent_id: UUID,
        reward_id: UUID,
        data: RewardUpdate,
    ) -> Reward | None:

        reward = self.get_reward(
            parent_id,
            reward_id,
        )

        if not reward:
            return None

        if data.name is not None:
            reward.name = data.name.strip()

        if data.description is not None:
            reward.description = data.description

        if data.points_required is not None:
            reward.points_required = data.points_required

        if data.period is not None:
            reward.period = data.period

        if data.active is not None:
            reward.active = data.active

        self.db.commit()
        self.db.refresh(reward)

        return reward

    def delete_reward(
        self,
        parent_id: UUID,
        reward_id: UUID,
    ) -> bool:

        reward = self.get_reward(
            parent_id,
            reward_id,
        )

        if not reward:
            return False

        self.db.delete(reward)
        self.db.commit()

        return True

    def get_child_reward_eligibility(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> list[dict]:

        # Verify that the child belongs to this parent
        child_exists = (
            self.db.query(Child)
            .filter(
                Child.id == child_id,
                Child.parent_id == parent_id,
            )
            .first()
        )

        if not child_exists:
            raise ValueError("Child not found")

        rewards = (
            self.db.query(Reward)
            .filter(
                Reward.parent_id == parent_id,
                Reward.active.is_(True),
            )
            .order_by(
                Reward.points_required.asc()
            )
            .all()
        )

        today = date.today()

        # Monday of current week
        week_start = today - timedelta(
            days=today.weekday()
        )

        # First day of current month
        month_start = today.replace(day=1)

        results = []

        for reward in rewards:

            if reward.period == "weekly":
                start_date = week_start
            else:
                start_date = month_start

            current_points = (
                self.db.query(
                    func.coalesce(
                        func.sum(PointTransaction.points),
                        0,
                    )
                )
                .filter(
                    PointTransaction.child_id == child_id,
                    PointTransaction.completed_date >= start_date,
                    PointTransaction.completed_date <= today,
                )
                .scalar()
            )

            current_points = int(current_points or 0)

            results.append(
                {
                    "reward_id": reward.id,
                    "reward_name": reward.name,
                    "description": reward.description,
                    "points_required": reward.points_required,
                    "period": reward.period,
                    "child_id": child_id,
                    "current_points": current_points,
                    "eligible": (
                        current_points
                        >= reward.points_required
                    ),
                }
            )

        return results