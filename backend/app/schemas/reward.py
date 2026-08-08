from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RewardCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    points_required: int = Field(
        ...,
        ge=1,
        le=100000,
    )

    period: str = Field(
        default="weekly",
        pattern="^(weekly|monthly)$",
    )


class RewardUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=500,
    )

    points_required: int | None = Field(
        default=None,
        ge=1,
        le=100000,
    )

    period: str | None = Field(
        default=None,
        pattern="^(weekly|monthly)$",
    )

    active: bool | None = None


class RewardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_id: UUID
    name: str
    description: str | None
    points_required: int
    period: str
    active: bool
    created_at: datetime
    updated_at: datetime

class RewardEligibilityResponse(BaseModel):
    reward_id: UUID
    reward_name: str
    description: str | None
    points_required: int
    period: str

    child_id: UUID
    current_points: int

    eligible: bool