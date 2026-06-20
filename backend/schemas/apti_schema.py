from pydantic import BaseModel,Field
from typing import List,Optional

class MCQQuestion(BaseModel):
    id:int = Field(...,description="Unique sequential identifier from 1 to 30")
    question_type:str = Field(...,description="'aptitude' or 'technical'")
    question : str = Field(...,description="The clear, unambiguous question text")
    options:List[str] = Field(...,description="Exactly 4 distinct multiple-choice options")
    correct_option:str = Field(...,description="The single-letter key of the correct option: 'A', 'B', 'C', or 'D'")
    explaination: str = Field(...,description="Brief explaination detailing why this specific option is correct")

class AssessmentTestResponse(BaseModel):
    test_id:Optional[str] = Field(None,description="To be populated when DB is hooked up")
    questions:List[MCQQuestion] = Field(...,description="List containing exactly 30 questions")

class SingleAnswerSubmission(BaseModel):
    question_id : int
    selected_option:str

class TestSubmissionRequest(BaseModel):
    test_id:str = Field("stateless-test-id",description="The ID of the test session is being evaluates")
    answers:List[SingleAnswerSubmission]
    original_questions : List[MCQQuestion]

class QuestionEvaluationResult(BaseModel):
    question_id:int
    question:str
    selected_option:str
    correct_option:str
    is_correct:bool
    explaination:str

class TestEvaluationResponse(BaseModel):
    total_questions:int
    correct_answers:int
    score_percentage:float
    results:List[QuestionEvaluationResult]


