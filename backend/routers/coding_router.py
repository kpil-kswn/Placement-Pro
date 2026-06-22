from fastapi import FastAPI,HTTPException,APIRouter,Body
from typing import Optional
import re
from services.coding_execution_service import execute_with_piston
from schemas.coding_schema import CodingProblemGeneration,CodeSubmission,EvaluationResult
from services.coding_service import generate_coding_problem,generate_code_critique

router = APIRouter(prefix='/api/v1/programming',tags=["Coding Assessment"])


@router.post("/generate",response_model=CodingProblemGeneration)
async def generate_problem(resume_text:Optional[str]=Body(None,embed=True)):
    try:
        problem = await generate_coding_problem(resume_text=resume_text)
        return problem
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@router.post("/execute",response_model=EvaluationResult)
async def execute_code(submission:CodeSubmission):
    try:
        piston_response = await execute_with_piston(
            user_code=submission.source_code,
            test_cases=submission.test_case
        )

        raw_output = piston_response.get("run",{}).get("stdout","")
        stderr = piston_response.get("run",{}).get("stderr","")

        if stderr:
            return EvaluationResult(
                status="Error",
                passed_cases=0,
                total_cases=len(submission.test_case),
                console_output=f"RUNTIME ERROR:\n{stderr}\n{raw_output}"
            )
        
        passed_count = 0
        total_cases = len(submission.test_case)

        for i,tc in enumerate(submission.test_case):
            expected_marker = f"---TEST_{i}_RESULT---::"
            error_marker = f"---TEST_{i}_ERROR---::"

            if error_marker in raw_output:
                continue

            match = re.search(f"{expected_marker}(.*)",raw_output)
            if match:
                actual_output = match.group(1).strip()
                if actual_output == str(tc.expected_output).strip():
                    passed_count+=1
        
        final_status = "Passed" if passed_count == total_cases else "Failed"

        ai_review = None
        if submission.is_submit:
            ai_review = await generate_code_critique(submission.source_code)
        
        return EvaluationResult(
            status=final_status,
            passed_cases=passed_count,
            total_cases=total_cases,
            console_output=raw_output,
            ai_critique=ai_review
        )
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


