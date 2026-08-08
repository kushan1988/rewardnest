from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ChildCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date | None = None
    avatar: str | None = Field(default=None, max_length=50)


class ChildUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    date_of_birth: date | None = None
    avatar: str | None = Field(default=None, max_length=50)


class ChildResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_id: UUID
    name: str
    date_of_birth: date | None
    avatar: str | None
    created_at: datetime
    updated_at: datetime