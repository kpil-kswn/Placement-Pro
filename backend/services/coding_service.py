import os
from typing import Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from schemas.coding_schema import CodingProblemGeneration

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API'))

async def generate_coding_problem(resume_text:Optional[str]=None)->CodingProblemGeneration:
    candidate_context = resume_text if resume_text else "General Python Data structures and Algoritham"

    prompt = f"""
    You are a Senior Staff Software Engineer at a top-tier tech company conducting a technical interview.
    Generate a unique, algorithm-focused coding problem tailored to the experience level and domain found in this candidate's profile:
    
    Candidate Profile Context:
    {candidate_context}
    
    CRITICAL INSTRUCTIONS FOR TEST CASES:
    Because these test cases will be executed in an automated Python sandbox, you MUST format the inputs and outputs exactly as raw Python values.
    
    - starter_code: Must be a valid Python function definition (e.g., `def find_max(arr):\\n    pass`).
    - input_data: Must be written EXACTLY as comma-separated arguments that will be passed into the function. 
      Examples of valid input_data:
        - `[1, 2, 3], 5`  (for a function taking a list and an int)
        - `"hello", "world"` (for a function taking two strings)
    - expected_output: Must be the EXACT literal return value. 
      Examples of valid expected_output: 
        - `[2, 3]` 
        - `True`
        - `"olleh"`
        
    Ensure the hidden test cases include challenging edge cases (empty arrays, negative numbers, extreme values).
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CodingProblemGeneration,
                temperature=0.7
            )
        )
        response_text = response.text
        if not response_text:
            raise ValueError("The AI model failed to return a valid response")
        return CodingProblemGeneration.model_validate_json(response_text)
    
    except Exception as e:
        print(f"Error generating coding problem:{e}")
        raise e
    
