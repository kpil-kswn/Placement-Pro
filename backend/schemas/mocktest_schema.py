from pydantic import BaseModel,Field
from typing import List,Dict,Optional
from datetime import datetime,timezone


class QuestionSchema(BaseModel):
    test_id:Optional[str] = None
    question_text:str
    options: List[str]
    correct_answer:str
    explanation:str
    class Config:
        extra="ignore"
    
class TestCatalogSchema(BaseModel):
    type:str
    title:str
    description:str
    duration_minute:int = 30
    total_question:int = 30
    class Config:
        extra = "ignore"

class TestAttemptSchema(BaseModel):
    user_id: str
    test_id: Optional[str] = None
    status:str = "In_progress"

    start_time:datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    end_time:datetime

    questions:List[QuestionSchema] = []

    user_answers:Dict[str,str] = {}
    score :Optional[int] = None

    class Config:
        extra = "ignore"


