from fastapi import APIRouter

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/recent")
def recent():
    return [{"agent":"demo","action":"recorded"}]
