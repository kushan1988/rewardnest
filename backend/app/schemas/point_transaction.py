from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PointTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    child_id: UUID
    child_habit_id: UUID
    habit_id: UUID
    points: int
    completed_date: date
    note: str | None
    created_at: datetime