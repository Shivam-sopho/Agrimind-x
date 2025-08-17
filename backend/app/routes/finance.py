from fastapi import APIRouter
from ..agents.financeflow import submit_finance
from ..core.schemas import FinanceSubmit

router = APIRouter(prefix="/finance", tags=["financeflow"])

@router.post("/submit")
def submit(payload: FinanceSubmit):
    return submit_finance(payload)
