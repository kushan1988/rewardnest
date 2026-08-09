from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.habit import (
    ChildHabitCreate,
    ChildHabitResponse,
    HabitCreate,
    HabitResponse,
    HabitUpdate,
)
from app.schemas.point_transaction import PointTransactionResponse
from app.services.habit_service import HabitService

router = APIRouter(
    prefix="/habits",
    tags=["Habits"],
)


# =========================================================
# HABIT DEFINITIONS
# =========================================================


@router.post(
    "",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_habit(
    data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    return service.create_habit(
        parent_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[HabitResponse],
)
def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    return service.get_habits(
        parent_id=current_user.id,
    )


@router.get(
    "/{habit_id}",
    response_model=HabitResponse,
)
def get_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    habit = service.get_habit(
        parent_id=current_user.id,
        habit_id=habit_id,
    )

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return habit


@router.put(
    "/{habit_id}",
    response_model=HabitResponse,
)
def update_habit(
    habit_id: UUID,
    data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    habit = service.update_habit(
        parent_id=current_user.id,
        habit_id=habit_id,
        data=data,
    )

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return habit


@router.delete(
    "/{habit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    deleted = service.delete_habit(
        parent_id=current_user.id,
        habit_id=habit_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return None


# =========================================================
# CHILD HABIT ASSIGNMENTS
# =========================================================


@router.post(
    "/{habit_id}/assign",
    response_model=ChildHabitResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_habit(
    habit_id: UUID,
    data: ChildHabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    try:
        return service.assign_habit(
            parent_id=current_user.id,
            habit_id=habit_id,
            child_id=data.child_id,
            points=data.points,
        )

    except ValueError as exc:
        message = str(exc)

        if "already assigned" in message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        )


@router.get(
    "/children/{child_id}",
    response_model=list[ChildHabitResponse],
)
def get_child_habits(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    try:
        return service.get_child_habits(
            parent_id=current_user.id,
            child_id=child_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.patch(
    "/assignments/{child_habit_id}/deactivate",
    status_code=status.HTTP_204_NO_CONTENT,
)   
def deactivate_child_habit(
    child_habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    deactivated = service.deactivate_child_habit(
        parent_id=current_user.id,
        child_habit_id=child_habit_id,
    )

    if not deactivated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned habit not found",
        )

    return None


# =========================================================
# COMPLETION / POINTS
# =========================================================


@router.post(
    "/assignments/{child_habit_id}/complete",
    response_model=PointTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def complete_habit(
    child_habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    try:
        return service.complete_habit(
            parent_id=current_user.id,
            child_habit_id=child_habit_id,
        )

    except ValueError as exc:
        message = str(exc)

        if "already been completed" in message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        if "inactive" in message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        )


@router.get(
    "/children/{child_id}/points",
    response_model=list[PointTransactionResponse],
)
def get_point_history(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = HabitService(db)

    try:
        return service.get_point_history(
            parent_id=current_user.id,
            child_id=child_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )