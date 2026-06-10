from fastapi import APIRouter
from app.database import check_db_connection
from app.services.cache_service import check_redis_connection

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    db_ok = check_db_connection()
    redis_ok = await check_redis_connection()
    return {
        "status": "healthy" if db_ok and redis_ok else "degraded",
        "database": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "error",
    }
