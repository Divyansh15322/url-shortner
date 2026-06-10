import redis.asyncio as aioredis
from app.config import settings

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_cached_url(short_code: str) -> str | None:
    try:
        return await redis_client.get(f"url:{short_code}")
    except Exception:
        return None


async def cache_url(short_code: str, original_url: str, ttl: int = 3600):
    try:
        await redis_client.setex(f"url:{short_code}", ttl, original_url)
    except Exception:
        pass


async def invalidate_cache(short_code: str):
    try:
        await redis_client.delete(f"url:{short_code}")
    except Exception:
        pass


async def check_redis_connection() -> bool:
    try:
        await redis_client.ping()
        return True
    except Exception:
        return False
