from pydantic import BaseModel,Field
from typing import List,Optional
from datetime import datetime

from schemas.apti_schema import MCQQuestion,SingleAnswerSubmission,TestEvaluationResponse
from schemas.coding_schema import CodingProblemGeneration,EvaluationResult

class AptechRound(BaseModel):
    status:str = Field("pending",description="pending,in_progress,completed")
    questions:Optional[List[MCQQuestion]] = []
    user_answers:Optional[List[SingleAnswerSubmission]] = []
    evaluation:Optional[TestEvaluationResponse] = None


class CodingProblemState(BaseModel):
    problem_id:str = Field(...,description="easy1?med1?hard1?")
    difficulty:str = Field(...,description="Easy,Medium,Hard")
    problem_data:Optional[CodingProblemGeneration] = None
    user_code:str = Field("",description="Continuously auto saved code drafts")
    evaluation:Optional[EvaluationResult] = None

class CodingRound(BaseModel):
    status:str = Field("pending",description="pending,in_progress,completed")
    problems:List[CodingProblemState] = []


class InterviewTurn(BaseModel):
    turn_id:int = Field(...,description="Sequential turn number")
    ai_question:str = Field(...,description="What the AI asked")
    user_answer:str = Field(...,description="The transcript of what the user spoke")
    ai_feedback:str = Field(...,description="The AI's evalutation of user's answer")

class InterviewRound(BaseModel):
    status:str = Field("pending",description="pending,in_progress,completed")
    chat_log:List[InterviewTurn] = []
    final_feedback:Optional[str] = Field(None,description="Final summary of interview round")


class PipelineTimestamps(BaseModel):
    started_at:datetime = Field(default_factory=datetime.utcnow)
    completed_at:Optional[datetime] = None


class PlacementPipelineDB(BaseModel):
    user_id:str
    resume_text:str = Field("",description="snapshot for resume used in this pipeline")

    # Options: ROUND_1_APTECH, ROUND_1_INTERMISSION, ROUND_2_CODING, ROUND_2_INTERMISSION, ROUND_3_INTERVIEW, COMPLETED
    global_status:str = Field("ROUND_1_APTECH")
    timestamps:PipelineTimestamps = Field(default_factory=PipelineTimestamps)

    aptech_round:AptechRound = Field(default_factory=AptechRound)
    coding_round:CodingRound = Field(default_factory=CodingRound)
    interview_round:InterviewRound = Field(default_factory=InterviewRound)
    final_report : Optional[str] = None
    



