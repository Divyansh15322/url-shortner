from pydantic import BaseModel, HttpUrl, field_validator
from datetime import datetime
from typing import Optional


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── URL ───────────────────────────────────────────────────────────────────────

class URLCreate(BaseModel):
    original_url: str
    custom_code: Optional[str] = None
    title: Optional[str] = None
    expires_at: Optional[datetime] = None

    @field_validator("custom_code")
    @classmethod
    def validate_custom_code(cls, v):
        if v and (len(v) < 3 or len(v) > 20):
            raise ValueError("Custom code must be 3-20 characters")
        if v and not v.isalnum():
            raise ValueError("Custom code must be alphanumeric")
        return v


class URLResponse(BaseModel):
    id: int
    short_code: str
    original_url: str
    short_url: str
    title: Optional[str]
    clicks: int
    is_active: bool
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class URLStats(BaseModel):
    total_urls: int
    total_clicks: int
    active_urls: int
