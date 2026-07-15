import os
import json
import time
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API'))

class AIInterviewQuestion(BaseModel):
    question_text:str
    options:List[str]
    correct_answer:str
    explanation:str

class AIResumeTestResult(BaseModel):
    questions:List[AIInterviewQuestion]

def generate_resume_mcq_test(resume_text:str)->AIResumeTestResult:
    prompt = f"""
    You are a strict technical interviewer.
    Analyze the following resume text and generate exactly 30 multiple-choice questions (MCQs).
    
    The questions must be deep, specific to the tech stacks mentioned, and directly address 
    the projects, tools, and experience listed. 
    
    For each question, provide:
    1. The question text.
    2. Exactly 4 plausible options in an array.
    3. The exact string of the correct answer (must match one of the options exactly).
    4. A short explanation of why it is correct.
    
    Resume Content:
    {resume_text}
    """

    max_retries = 3
    for attemp in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents = prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIResumeTestResult,
                    temperature=0.3
                ),
            ) 
            response_text = response.text
            if not response_text:
                raise ValueError("The AI model failed to generate questions.")
            
            return AIResumeTestResult.model_validate_json(response_text)
        
        except Exception as e:
            error_message=str(e)
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attemp < max_retries-1:
                    sleep_time = 2**(attemp+1)
                    print(f"API busy (503). Retrying question generator in {sleep_time} second...")
                    time.sleep(sleep_time)
                    continue
            raise e
    raise Exception("Max tries excceded.AI evaluation services are currently Unavailable.")