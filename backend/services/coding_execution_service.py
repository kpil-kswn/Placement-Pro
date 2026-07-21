import httpx
import re
from typing import List
from schemas.coding_schema import TestCase
import os
from dotenv import load_dotenv
load_dotenv()


JDOODLE_API_URL = os.getenv("JDOODLE_API_URL", "https://api.jdoodle.com/v1/execute")
JDOODLE_CLIENT_ID = os.getenv('JDOODLE_CLIENT_ID')
JDOODLE_CLIENT_SECRET = os.getenv('JDOODLE_CLIENT_SECRET')

def extract_function_name(code: str) -> str:
    match = re.search(r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(", code)
    if not match:
        raise ValueError("Could not find a valid function definition in your code")
    return match.group(1)

def build_injected_code(user_code: str, test_cases: List[TestCase]) -> str:
    func_name = extract_function_name(user_code)
    
    injected_code = user_code + "\n\n"
    injected_code += "# --- FASTAPI INJECTED TEST RUNNER ---\n"
    injected_code += "import sys\n"

    for i, tc in enumerate(test_cases):
        injected_code += f"""
try:
    result = {func_name}({tc.input_data})
    print(f"---TEST_{i}_RESULT---::{{result}}")
except Exception as e:
    print(f"---TEST_{i}_ERROR---::{{type(e).__name__}}: {{str(e)}}")
"""
    return injected_code

async def execute_with_jdoodle(user_code: str, test_cases: List[TestCase]) -> dict:
    """
    Sends code to JDoodle and maps the response to mimic our old Piston format
    so the router logic doesn't break.
    """
    script_to_run = build_injected_code(user_code, test_cases)
    
    payload = {
        "clientId": JDOODLE_CLIENT_ID,
        "clientSecret": JDOODLE_CLIENT_SECRET,
        "script": script_to_run,
        "language": "python3",
        "versionIndex": "3" # JDoodle's version index for modern Python 3
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(JDOODLE_API_URL, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"JDoodle API error: {response.text}")
            
        data = response.json()
        raw_output = data.get("output", "")
        
        # JDoodle combines standard output and crash errors into one string.
        # We separate global crashes (Syntax/Indentation) from normal test failures.
        stdout_val = raw_output
        stderr_val = ""
        
        if "Traceback (most recent call)" in raw_output or "SyntaxError:" in raw_output or "IndentationError:" in raw_output:
            stderr_val = raw_output
            stdout_val = ""
            
        return {
            "run": {
                "stdout": stdout_val,
                "stderr": stderr_val
            }
        }