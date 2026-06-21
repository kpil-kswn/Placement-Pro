import os
from typing import Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from schemas.coding_schema import CodingProblemGeneration
import time

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
    
    - starter_code: Must be ONLY the initial Python function definition with a `pass` or `return` placeholder. 
      CRITICAL: DO NOT write the actual solution, algorithm, or any helper functions. ONLY provide the bare signature.
      Example of valid starter_code: `def solve_problem(arr, target):\n    return`
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
    max_retries = 3
    for attemp in range(max_retries):
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
            error_message=str(e)
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attemp < max_retries-1:
                    sleep_time = 2**(attemp+1)
                    print(f"API busy (503). Retrying question generator in {sleep_time} second...")
                    time.sleep(sleep_time)
                    continue
            raise e
    raise Exception("Max tries excceded.AI evaluation services are currently Unavailable.")
    
