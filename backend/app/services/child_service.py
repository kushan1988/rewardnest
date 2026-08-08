from uuid import UUID

from sqlalchemy.orm import Session

from app.models.child import Child
from app.schemas.child import ChildCreate, ChildUpdate


class ChildService:
    def __init__(self, db: Session):
        self.db = db

    def create_child(
        self,
        parent_id: UUID,
        data: ChildCreate,
    ) -> Child:
        child = Child(
            parent_id=parent_id,
            name=data.name.strip(),
            date_of_birth=data.date_of_birth,
            avatar=data.avatar,
        )

        self.db.add(child)
        self.db.commit()
        self.db.refresh(child)

        return child

    def get_children(self, parent_id: UUID) -> list[Child]:
        return (
            self.db.query(Child)
            .filter(Child.parent_id == parent_id)
            .order_by(Child.created_at.asc())
            .all()
        )

    def get_child(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> Child | None:
        return (
            self.db.query(Child)
            .filter(
                Child.id == child_id,
                Child.parent_id == parent_id,
            )
            .first()
        )

    def update_child(
        self,
        parent_id: UUID,
        child_id: UUID,
        data: ChildUpdate,
    ) -> Child | None:
        child = self.get_child(parent_id, child_id)

        if not child:
            return None

        if data.name is not None:
            child.name = data.name.strip()

        if data.date_of_birth is not None:
            child.date_of_birth = data.date_of_birth

        if data.avatar is not None:
            child.avatar = data.avatar

        self.db.commit()
        self.db.refresh(child)

        return child

    def delete_child(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> bool:
        child = self.get_child(parent_id, child_id)

        if not child:
            return False

        self.db.delete(child)
        self.db.commit()

        return True