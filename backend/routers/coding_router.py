from fastapi import FastAPI,HTTPException,APIRouter,Body
from typing import Optional

from schemas.coding_schema import CodingProblemGeneration,CodeSubmission,EvaluationResult
from services.coding_service import generate_coding_problem

router = APIRouter(prefix='/api/v1/programming',tags=["Coding Assessment"])

@router.post("/generate",response_model=CodingProblemGeneration)
async def generate_problem(resume_text:Optional[str]=Body(None,embed=True)):
    try:
        problem = await generate_coding_problem(resume_text=resume_text)
        return problem
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

