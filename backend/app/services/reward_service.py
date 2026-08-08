from uuid import UUID

from sqlalchemy.orm import Session

from app.models.reward import Reward
from app.schemas.reward import RewardCreate, RewardUpdate


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