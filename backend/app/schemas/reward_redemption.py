from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RewardRedemptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    child_id: UUID
    reward_id: UUID
    points_spent: int
    period: str
    status: str
    requested_at: datetime
    approved_at: datetime | None