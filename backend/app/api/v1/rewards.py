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
    RewardEligibilityResponse,
)
from app.services.reward_service import RewardService
from app.schemas.reward_redemption import RewardRedemptionResponse


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

@router.post(
    "/{reward_id}/claim",
    response_model=RewardRedemptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def claim_reward(
    reward_id: UUID,
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    try:
        return service.claim_reward(
            parent_id=current_user.id,
            child_id=child_id,
            reward_id=reward_id,
        )

    except ValueError as exc:
        message = str(exc)

        if message == "Reward not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message,
            )

        if message == "Reward is not active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

        if message == "Child not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )


@router.get(
    "/children/{child_id}/redemptions",
    response_model=list[RewardRedemptionResponse],
)
def get_child_redemptions(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    try:
        return service.get_child_redemptions(
            parent_id=current_user.id,
            child_id=child_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
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

@router.get(
    "/children/{child_id}/eligibility",
    response_model=list[RewardEligibilityResponse],
)
def get_child_reward_eligibility(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RewardService(db)

    try:
        return service.get_child_reward_eligibility(
            parent_id=current_user.id,
            child_id=child_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )