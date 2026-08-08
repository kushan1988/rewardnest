from pydantic import BaseModel


class ScoreResponse(BaseModel):
    today: int
    week: int
    month: int
    total: int


class ScoreSummaryResponse(BaseModel):
    today: int
    week: int
    month: int
    total: int
    today_completions: int
    week_completions: int
    month_completions: int