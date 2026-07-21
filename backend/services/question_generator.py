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
    You are an elite Senior Technical Interviewer. I am going to provide you with a candidate's resume. 

    YOUR INSTRUCTIONS:
    1. DO NOT ask questions about the resume document itself. Do not ask about dates, job titles, or what the user wrote.
    2. Analyze the resume and extract the core programming languages, frameworks, databases, and architectural concepts the candidate claims to know.
    3. Generate a moderate-to-tough 30-question multiple-choice technical exam to test if the candidate actually possesses the skills they listed. 
    4. The questions must be conceptual, scenario-based, or code-behavior questions based on their tech stack.

    Return the response STRICTLY as a JSON array of objects with the following keys:
    "question_text" (string), "options" (array of 4 strings), "correct_answer" (string), and "explanation" (string).

    Here is the candidate's resume:
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