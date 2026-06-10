from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.url import URLCreate, URLResponse, URLStats
from app.services.url_service import (
    create_short_url, resolve_url, get_user_urls,
    delete_url, get_user_stats, build_url_response
)
from app.services.auth_service import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter(tags=["urls"])


@router.post("/shorten", response_model=URLResponse)
async def shorten(
    payload: URLCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    url = create_short_url(
        db,
        original_url=payload.original_url,
        user_id=current_user.id if current_user else None,
        custom_code=payload.custom_code,
        title=payload.title,
        expires_at=payload.expires_at,
    )
    return build_url_response(url)


@router.get("/my-urls", response_model=list[URLResponse])
def my_urls(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    urls = get_user_urls(db, current_user.id)
    return [build_url_response(u) for u in urls]


@router.get("/my-stats", response_model=URLStats)
def my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_stats(db, current_user.id)


@router.delete("/urls/{short_code}")
def delete(
    short_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_url(db, short_code, current_user.id)
    return {"message": "Deleted"}


@router.get("/{short_code}")
async def redirect(short_code: str, db: Session = Depends(get_db)):
    original = await resolve_url(db, short_code)
    return RedirectResponse(url=original, status_code=302)
