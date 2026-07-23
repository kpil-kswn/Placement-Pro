from fastapi import FastAPI,HTTPException,APIRouter,Body
from typing import Optional
import re
import traceback
from services.coding_execution_service import execute_with_jdoodle
from schemas.coding_schema import CodingProblemGeneration,CodeSubmission,EvaluationResult
from services.coding_service import generate_coding_problem,generate_code_critique

router = APIRouter(prefix='/api/v1/programming',tags=["Coding Assessment"])

@router.post("/execute",response_model=EvaluationResult)
async def execute_code(submission:CodeSubmission):
    try:
        jdoodle_response = await execute_with_jdoodle(
            user_code=submission.source_code,
            test_cases=submission.test_case
        )
        raw_output = jdoodle_response.get("run",{}).get("stdout","")
        stderr = jdoodle_response.get("run",{}).get("stderr","")
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
    except ValueError as ve:
        return EvaluationResult(
            status="Error",
            passed_cases=0,
            total_cases=len(submission.test_case),
            console_output=f"SYNTAX ERROR:\n{str(ve)}\n\nPlease ensure your code includes a valid function definition (e.g., 'def my_function():')."
        )
    except Exception as e:
        print("\n" + "="*50)
        print("🚨 CRITICAL BACKEND CRASH DETECTED 🚨")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500,detail=str(e))


