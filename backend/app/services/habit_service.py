from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.child_habit import ChildHabit
from app.models.habit import Habit
from app.models.point_transaction import PointTransaction
from app.schemas.habit import (
    ChildHabitCreate,
    HabitCreate,
    HabitUpdate,
)


class HabitService:

    def __init__(self, db: Session):
        self.db = db

    # --------------------------------------------------
    # HABIT
    # --------------------------------------------------

    def create_habit(
        self,
        parent_id: UUID,
        data: HabitCreate,
    ) -> Habit:

        habit = Habit(
            parent_id=parent_id,    
            name=data.name.strip(),
            description=data.description,
        )

        self.db.add(habit)
        self.db.commit()
        self.db.refresh(habit)

        return habit

    def get_habits(
        self,
        parent_id: UUID,
    ) -> list[Habit]:

        return (
            self.db.query(Habit)
            .filter(
                Habit.parent_id == parent_id,
            )
            .order_by(Habit.created_at.asc())
            .all()
        )

    def get_habit(
        self,
        parent_id: UUID,
        habit_id: UUID,
    ) -> Habit | None:

        return (
            self.db.query(Habit)
            .filter(Habit.id == habit_id,
                    Habit.parent_id == parent_id,
                    )
            .first()
        )

    def update_habit(
        self,
        parent_id: UUID,
        habit_id: UUID,
        data: HabitUpdate,
    ) -> Habit | None:

        habit = self.get_habit(
            parent_id=parent_id,
            habit_id=habit_id,
        )

        if not habit:
            return None

        if data.name is not None:
            habit.name = data.name.strip()

        if data.description is not None:
            habit.description = data.description

        self.db.commit()
        self.db.refresh(habit)

        return habit

    def delete_habit(
        self,
        parent_id: UUID,
        habit_id: UUID,
    ) -> bool:

        habit = self.get_habit(
            parent_id=parent_id,
            habit_id=habit_id,
        )

        if not habit:
            return False

        self.db.delete(habit)
        self.db.commit()

        return True

    # --------------------------------------------------
    # CHILD HABIT
    # --------------------------------------------------

    def assign_habit(
        self,
        parent_id: UUID,
        child_id: UUID,
        habit_id: UUID,
        points: int,
    ):

        if points <= 0:
            raise ValueError("Points must be greater than zero")

        # Verify child belongs to parent
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

        # Verify habit belongs to parent
        habit = (
            self.db.query(Habit)
            .filter(
                Habit.id == habit_id,
                Habit.parent_id == parent_id,
            )
            .first()
        )

        if not habit:
            raise ValueError("Habit not found")

        # Check existing assignment
        existing = (
            self.db.query(ChildHabit)
            .filter(
                ChildHabit.child_id == child_id,
                ChildHabit.habit_id == habit_id,
            )
            .first()
        )

        if existing:

            if existing.active:
                raise ValueError(
                    "Habit is already assigned to this child"
                )

            # Reactivate existing assignment
            existing.active = True
            existing.points = points

            self.db.commit()
            self.db.refresh(existing)

            return existing

        # Create new assignment
        child_habit = ChildHabit(
            child_id=child_id,
            habit_id=habit_id,
            points=points,
            active=True,
        )

        self.db.add(child_habit)
        self.db.commit()
        self.db.refresh(child_habit)

        return child_habit

    def get_child_habits(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> list[ChildHabit]:

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

        return (
            self.db.query(ChildHabit)
            .filter(
                ChildHabit.child_id == child_id,
                ChildHabit.active.is_(True),
            )
            .order_by(ChildHabit.created_at.asc())
            .all()
        )

    def get_child_habit(
        self,
        parent_id: UUID,
        child_habit_id: UUID,
    ) -> ChildHabit | None:

        return (
            self.db.query(ChildHabit)
            .join(
                Child,
                Child.id == ChildHabit.child_id,
            )
            .filter(
                ChildHabit.id == child_habit_id,
                Child.parent_id == parent_id,
            )
            .first()
        )

    def deactivate_child_habit(
        self,
        parent_id: UUID,
        child_habit_id: UUID,
    ) -> bool:

        child_habit = self.get_child_habit(
            parent_id,
            child_habit_id,
        )

        if not child_habit:
            return False

        child_habit.active = False

        self.db.commit()

        return True

    # --------------------------------------------------
    # COMPLETE HABIT
    # --------------------------------------------------

    def complete_habit(
        self,
        parent_id: UUID,
        child_habit_id: UUID,
    ) -> PointTransaction:

        child_habit = self.get_child_habit(
            parent_id,
            child_habit_id,
        )

        if not child_habit:
            raise ValueError(
                "Assigned habit not found"
            )

        if not child_habit.active:
            raise ValueError(
                "Habit is inactive"
            )

        today = date.today()

        existing = (
            self.db.query(PointTransaction)
            .filter(
                PointTransaction.child_habit_id
                == child_habit.id,
                PointTransaction.completed_date
                == today,
            )
            .first()
        )

        if existing:
            raise ValueError(
                "Habit has already been completed for this date"
            )

        transaction = PointTransaction(
            child_id=child_habit.child_id,
            child_habit_id=child_habit.id,
            habit_id=child_habit.habit_id,
            points=child_habit.points,
            completed_date=today,
        )

        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)

        return transaction

    # --------------------------------------------------
    # POINT HISTORY
    # --------------------------------------------------

    def get_point_history(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> list[PointTransaction]:

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

        return (
            self.db.query(PointTransaction)
            .filter(
                PointTransaction.child_id == child_id
            )
            .order_by(
                PointTransaction.completed_date.desc(),
                PointTransaction.created_at.desc(),
            )
            .all()
        )