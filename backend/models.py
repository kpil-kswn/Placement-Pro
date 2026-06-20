from pydantic import BaseModel,Field
from typing import List,Optional

class ATSResult(BaseModel):
    match_score:int
    missing_keyword:list[str]
    matched_keywords:list[str]
    improvement_suggestions:list[str]

class InterViewQuestion(BaseModel):
    category:str
    question:str
    why_asked:str

class ResumeQuestionsResult(BaseModel):
    total_questions:int
    questions:List[InterViewQuestion]
