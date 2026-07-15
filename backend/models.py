from pydantic import BaseModel,Field
from typing import List,Optional
from datetime import datetime,timezone

# for ats
class ATSResult(BaseModel):
    match_score:int
    missing_keyword:list[str]
    matched_keywords:list[str]
    improvement_suggestions:list[str]

# for chat
class Message(BaseModel):
    role:str
    text:str
    timestamp:datetime = Field(default_factory=lambda:datetime.now(timezone.utc))

class ChatSchema(BaseModel):
    userId:str
    title:str = "New Conversation"
    messages : List[Message] = []
    created_at:datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    class Config:
        extra = "ignore"

        