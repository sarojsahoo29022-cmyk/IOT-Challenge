from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.classroom import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Smart classroom monitoring API. The current provider is demo-only; no hardware or database is connected.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(router, prefix=settings.api_prefix)


@app.get("/health", tags=["System"])
def health() -> dict[str, str | bool]:
    return {"status": "ok", "mode": "DEMO", "hardware_connected": False}
