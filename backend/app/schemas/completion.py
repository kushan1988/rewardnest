from datetime import date
from uuid import UUID

from pydantic import BaseModel


class HabitCompletionCreate(BaseModel):
    child_habit_id: UUID
    completed_date: date | None = None


class HabitCompletionResponse(BaseModel):
    id: UUID
    child_id: UUID
    habit_id: UUID
    points: int
    completed_date: date