import httpx
import re
from typing import List
from schemas.coding_schema import TestCase

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

def extract_function_name(code:str)->str:
    match = re.search(r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(",code)
    if not match:
        raise ValueError("Could not find a valid function definition in your code")
    return match.group(1)

def build_injected_code(user_code:str,test_cases:List[TestCase])->str:
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


async def execute_with_piston(user_code:str,test_cases:List[TestCase],language:str="python")->dict:

    script_to_run = build_injected_code(user_code,test_cases)
    payload = {
        "language":language,
        "version":"3.10",
        "files":[
            {
                "name":"main.py",
                "content":script_to_run
            }
        ]
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(PISTON_API_URL,json=payload)
        if response.status_code!=200:
            raise Exception(f"Piston API error:{response.text}")
        return response.json()