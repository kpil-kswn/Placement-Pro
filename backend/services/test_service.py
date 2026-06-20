import os
from google import genai
from typing import Optional
from google.genai import types
from dotenv import load_dotenv
from schemas.apti_schema import AssessmentTestResponse

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API"))

# to generate test questions
async def generate_assessment_test(resume_text: Optional[str]=None)->AssessmentTestResponse:
    profile_context = resume_text if resume_text else "A general software engineering and core computer science profile."
    prompt = f"""
    You are an expert technical interviewer and psychometric evaluator.
    Generate a comprehensive evaluation test consisting of exactly 30 multiple-choice questions.
    
    Structure the test with the following distribution:
    1. Exactly 10 'aptitude' questions: Cover quantitative reasoning, logical deduction, data interpretation, and problem-solving puzzles.
    2. Exactly 20 'technical' questions: Customize these strictly to the domain skills, technical stack, and core engineering principles found within the provided Profile Context.
    
    Profile Context:
    {profile_context}
    
    Rules for compilation:
    - Each question must contain exactly 4 options.
    - Format options distinctively so they can be easily rendered.
    - Assign the correct_option field exactly as one of these strings: "A", "B", "C", or "D".
    - Ensure questions range from medium to high difficulty.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AssessmentTestResponse,
                temperature=0.7
            )
        )
        response_text = response.text
        if not response_text:
            raise ValueError("The AI model failed to return a valid response")
        
        return AssessmentTestResponse.model_validate_json(response_text)
    except Exception as e:
        print(f"Error compiling evaluation questions:{e}")
        raise e