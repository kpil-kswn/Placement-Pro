from fastapi import FastAPI,HTTPException,Body,APIRouter
from schemas.apti_schema import AssessmentTestResponse,TestSubmissionRequest,TestEvaluationResponse,QuestionEvaluationResult
from services.aptech_service import generate_assessment_test
from typing import Optional

router = APIRouter(prefix="/api/v1/assessment",tags=["Aptitude and Technical Test"])

@router.post("/generate",response_model=AssessmentTestResponse)
async def create_new_test(
    resume_text : Optional[str] = Body(None,embed=True)
):
    try:
        test_payload = await generate_assessment_test(resume_text=resume_text)
        return test_payload
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Failed to generate assessment content:{str(e)}")
    

@router.post("/evaluate",response_model=TestEvaluationResponse)
async def evaluate_test_submission(payload:TestSubmissionRequest):
    try:
        questions_map = {q.id:q for q in payload.original_questions}
        correct_count = 0
        evaluation_result = []

        for user_ans in payload.answers:
            target_question = questions_map.get(user_ans.question_id)
            if not target_question:
                continue
            is_correct = user_ans.selected_option.upper() == target_question.correct_option.upper()
            
            if is_correct:
                correct_count+=1
            
            evaluation_result.append(
                QuestionEvaluationResult(
                    question_id=target_question.id,
                    question=target_question.question,
                    selected_option=user_ans.selected_option,
                    correct_option=target_question.correct_option,
                    is_correct=is_correct,
                    explaination=target_question.explaination
                )
            )
        
        total_qs = len(evaluation_result)
        score_pct = (correct_count/total_qs*100) if total_qs>0 else 0.0

        return TestEvaluationResponse(
            total_questions=total_qs,
            correct_answers=correct_count,
            score_percentage=round(score_pct,2),
            results=evaluation_result
        )
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Evaluation execution Failure:{str(e)}")
    


