import pdfplumber
import io
import os
import json
from google import genai
from google.genai import types
import time
from models import ATSResult
import dotenv
from dotenv import load_dotenv


load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API'))

def extract_text_from_pdf(file_bytes:bytes)->str:
    text=""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text+=page_text+"\n"
    return text

def evaluate_resume_against_jd(resume_text:str,job_description:str)->dict:
    prompt = f"""
    You are an expert ATS (Applicant Tracking System). 
    Compare the following Resume against the Job Description.
    
    Job Description: {job_description}
    
    Resume: {resume_text}
    
    Respond ONLY with a valid JSON object matching this schema:
    {{
      "match_score": int (0-100),
      "missing_keywords": ["keyword1", "keyword2"],
      "matched_keywords": ["keyword1", "keyword2"],
      "improvement_suggestions": ["suggestion1", "suggestion2"]
    }}
    """
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ATSResult,
                    temperature=0.1
                ),
            )
            
            response_text = response.text
            if not response_text:
                raise ValueError("The AI model failed to return a valid response.")
                
            return json.loads(response_text)
            
        except Exception as e:
            error_message = str(e)
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attempt < max_retries - 1:
                    sleep_time = 2 ** (attempt + 1)
                    print(f"API busy (503). Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                    continue 
            raise e
    raise Exception("Max retries exceeded. AI evaluation service is currently unavailable.")