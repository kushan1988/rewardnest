from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.reward import (
    RewardCreate,
    RewardResponse,
    RewardUpdate,
)
from app.services.reward_service import RewardService


router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"],
)


@router.post(
    "",
    response_model=RewardResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reward(
    data: RewardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    return service.create_reward(
        parent_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[RewardResponse],
)
def get_rewards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    return service.get_rewards(
        parent_id=current_user.id,
    )


@router.get(
    "/{reward_id}",
    response_model=RewardResponse,
)
def get_reward(
    reward_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    reward = service.get_reward(
        parent_id=current_user.id,
        reward_id=reward_id,
    )

    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found",
        )

    return reward


@router.put(
    "/{reward_id}",
    response_model=RewardResponse,
)
def update_reward(
    reward_id: UUID,
    data: RewardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    reward = service.update_reward(
        parent_id=current_user.id,
        reward_id=reward_id,
        data=data,
    )

    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found",
        )

    return reward


@router.delete(
    "/{reward_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_reward(
    reward_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    deleted = service.delete_reward(
        parent_id=current_user.id,
        reward_id=reward_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found",
        )

    return None