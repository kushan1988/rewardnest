from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.child import ChildCreate, ChildResponse, ChildUpdate
from app.services.child_service import ChildService


router = APIRouter(
    prefix="/children",
    tags=["Children"],
)


@router.post(
    "",
    response_model=ChildResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_child(
    data: ChildCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ChildService(db)

    return service.create_child(
        parent_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[ChildResponse],
)
def get_children(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ChildService(db)

    return service.get_children(
        parent_id=current_user.id,
    )


@router.get(
    "/{child_id}",
    response_model=ChildResponse,
)
def get_child(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ChildService(db)

    child = service.get_child(
        parent_id=current_user.id,
        child_id=child_id,
    )

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found",
        )

    return child


@router.put(
    "/{child_id}",
    response_model=ChildResponse,
)
def update_child(
    child_id: UUID,
    data: ChildUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ChildService(db)

    child = service.update_child(
        parent_id=current_user.id,
        child_id=child_id,
        data=data,
    )

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found",
        )

    return child


@router.delete(
    "/{child_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_child(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ChildService(db)

    deleted = service.delete_child(
        parent_id=current_user.id,
        child_id=child_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found",
        )

    return None