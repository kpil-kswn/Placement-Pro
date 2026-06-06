import os
import json
import time
from google import genai
from google.genai import types
from models import ResumeQuestionsResult
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API'))

def generate_resume_questions(resume_text:str)->ResumeQuestionsResult:
    prompt=prompt = f"""
    You are a seasoned technical interviewer at a top-tier product company.
    Analyze the following resume text and generate exactly 30 high-yield interview questions.
    
    The questions must be deep, specific to the tech stacks mentioned, and directly address 
    the projects, tools, frameworks, and job experience listed. Do not make generic questions.
    
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
                    response_schema=ResumeQuestionsResult,
                    temperature=0.3
                ),
            ) 
            response_text = response.text
            if not response_text:
                raise ValueError("The AI model failed to generate questions.")
            
            return ResumeQuestionsResult.model_validate_json(response_text)
        
        except Exception as e:
            error_message=str(e)
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attemp < max_retries-1:
                    sleep_time = 2**(attemp+1)
                    print(f"API busy (503). Retrying question generator in {sleep_time} second...")
                    time.sleep(sleep_time)
                    continue
            raise e