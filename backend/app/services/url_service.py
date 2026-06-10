import random
import string
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.url import URL
from app.services.cache_service import get_cached_url, cache_url
from app.config import settings


def generate_short_code(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


def create_short_url(
    db: Session,
    original_url: str,
    user_id: int | None = None,
    custom_code: str | None = None,
    title: str | None = None,
    expires_at: datetime | None = None,
) -> URL:
    code = custom_code or generate_short_code()

    # Ensure uniqueness
    attempts = 0
    while db.query(URL).filter(URL.short_code == code).first():
        if custom_code:
            raise HTTPException(status_code=400, detail="That custom code is already taken")
        code = generate_short_code()
        attempts += 1
        if attempts > 10:
            raise HTTPException(status_code=500, detail="Could not generate unique code")

    url = URL(
        original_url=str(original_url),
        short_code=code,
        title=title,
        user_id=user_id,
        expires_at=expires_at,
    )
    db.add(url)
    db.commit()
    db.refresh(url)
    return url


async def resolve_url(db: Session, short_code: str) -> str:
    # Cache-first
    cached = await get_cached_url(short_code)
    if cached:
        # Still increment clicks in background (fire-and-forget via DB)
        url = db.query(URL).filter(URL.short_code == short_code).first()
        if url:
            url.clicks += 1
            url.last_accessed = datetime.now(timezone.utc)
            db.commit()
        return cached

    url = db.query(URL).filter(
        URL.short_code == short_code,
        URL.is_active == True,
    ).first()

    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    if url.expires_at and url.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This link has expired")

    url.clicks += 1
    url.last_accessed = datetime.now(timezone.utc)
    db.commit()

    await cache_url(short_code, url.original_url)
    return url.original_url


def get_user_urls(db: Session, user_id: int) -> list[URL]:
    return (
        db.query(URL)
        .filter(URL.user_id == user_id)
        .order_by(URL.created_at.desc())
        .all()
    )


def delete_url(db: Session, short_code: str, user_id: int) -> bool:
    url = db.query(URL).filter(URL.short_code == short_code, URL.user_id == user_id).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    db.delete(url)
    db.commit()
    return True


def get_user_stats(db: Session, user_id: int) -> dict:
    urls = db.query(URL).filter(URL.user_id == user_id).all()
    return {
        "total_urls": len(urls),
        "total_clicks": sum(u.clicks for u in urls),
        "active_urls": sum(1 for u in urls if u.is_active),
    }


def build_url_response(url: URL) -> dict:
    return {
        "id": url.id,
        "short_code": url.short_code,
        "original_url": url.original_url,
        "short_url": f"{settings.BASE_URL}/{url.short_code}",
        "title": url.title,
        "clicks": url.clicks,
        "is_active": url.is_active,
        "expires_at": url.expires_at,
        "created_at": url.created_at,
    }
