from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reward import Reward
from app.models.reward_redemption import RewardRedemption
from app.schemas.reward import RewardCreate, RewardUpdate
from app.services.score_service import ScoreService

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

        score_service = ScoreService(self.db)

        score_service.validate_child(
            parent_id=parent_id,
            child_id=child_id,
        )

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

        weekly_points = score_service.get_weekly_points(
            child_id
        )

        monthly_points = score_service.get_monthly_points(
            child_id
        )

        results = []

        for reward in rewards:

            if reward.period == "weekly":
                current_points = weekly_points

            elif reward.period == "monthly":
                current_points = monthly_points

            else:
                current_points = 0

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

    # Rewards Redemption
    def get_available_points(
        self,
        child_id: UUID,
        reward: Reward,
    ) -> int:

        score_service = ScoreService(self.db)

        if reward.period == "weekly":
            earned_points = score_service.get_weekly_points(
                child_id
            )
        else:
            earned_points = score_service.get_monthly_points(
                child_id
            )

        redeemed_points = (
            self.db.query(
                RewardRedemption.points_spent
            )
            .filter(
                RewardRedemption.child_id == child_id,
                RewardRedemption.reward_id == reward.id,
                RewardRedemption.status.in_(
                    ["pending", "approved"]
                ),
            )
            .all()
        )

        reserved_points = sum(
            points[0] for points in redeemed_points
        )

        return max(
            earned_points - reserved_points,
            0,
        )

    def get_available_points(
        self,
        child_id: UUID,
        reward: Reward,
    ) -> int:

        score_service = ScoreService(self.db)

        if reward.period == "weekly":
            earned_points = score_service.get_weekly_points(
                child_id
            )
        else:
            earned_points = score_service.get_monthly_points(
                child_id
            )

        today = date.today()

        if reward.period == "weekly":
            period_start = today - timedelta(
                days=today.weekday()
            )
        else:
            period_start = today.replace(day=1)

        redeemed_points = (
            self.db.query(
                func.coalesce(
                    func.sum(
                        RewardRedemption.points_spent
                    ),
                    0,
                )
            )
            .filter(
                RewardRedemption.child_id == child_id,
                RewardRedemption.period == reward.period,
                RewardRedemption.status.in_(
                    ["pending", "approved"]
                ),
                RewardRedemption.requested_at >= period_start,
            )
            .scalar()
        )

        return max(
            int(earned_points) - int(redeemed_points or 0),
            0,
        )

    def claim_reward(
        self,
        parent_id: UUID,
        child_id: UUID,
        reward_id: UUID,
    ) -> RewardRedemption:

        score_service = ScoreService(self.db)

        # Make sure the child belongs to this parent
        score_service.validate_child(
            parent_id=parent_id,
            child_id=child_id,
        )

        # Make sure the reward belongs to this parent
        reward = self.get_reward(
            parent_id=parent_id,
            reward_id=reward_id,
        )

        if not reward:
            raise ValueError("Reward not found")

        if not reward.active:
            raise ValueError("Reward is not active")

        available_points = self.get_available_points(
            child_id=child_id,
            reward=reward,
        )

        if available_points < reward.points_required:
            raise ValueError(
                f"Insufficient points. "
                f"Available: {available_points}, "
                f"Required: {reward.points_required}"
            )

        redemption = RewardRedemption(
            child_id=child_id,
            reward_id=reward.id,
            points_spent=reward.points_required,
            period=reward.period,
            status="pending",
        )

        self.db.add(redemption)
        self.db.commit()
        self.db.refresh(redemption)

        return redemption

    def get_child_redemptions(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> list[RewardRedemption]:

        score_service = ScoreService(self.db)

        score_service.validate_child(
            parent_id=parent_id,
            child_id=child_id,
        )

        return (
            self.db.query(RewardRedemption)
            .join(
                Reward,
                Reward.id == RewardRedemption.reward_id,
            )
            .filter(
                RewardRedemption.child_id == child_id,
                Reward.parent_id == parent_id,
            )
            .order_by(
                RewardRedemption.requested_at.desc()
            )
            .all()
        )