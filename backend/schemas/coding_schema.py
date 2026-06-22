from pydantic import BaseModel,Field
from typing import List,Optional

class TestCase(BaseModel):
    input_data:str=Field(...,description="The exact raw string input to evaluate.")
    expected_output:str=Field(...,description="The exact expected stdout or return value.")

class CodingProblemGeneration(BaseModel):
    title:str=Field(...,description="A clear, professional title for the algorithmic challenge.")
    difficulty:str=Field(...,description="Must be exactly: 'Easy', 'Medium', or 'Hard'.")
    problem_statement:str=Field(...,description="The full problem description in Markdown format. Include constraints.")
    starter_code:str=Field(...,description="The initial Python function definition with a 'pass' or 'return' placeholder.")
    public_test_cases:List[TestCase]=Field(...,description="1 to 2 basic test cases that will be visible to the user on the UI.")
    hidden_test_cases:List[TestCase]=Field(...,description="3 to 5 complex edge cases used strictly by the backend for secure grading.")

class CodeSubmission(BaseModel):
    source_code:str=Field(...,description="The user's submitted python code")
    test_case:List[TestCase] =Field(...,description="The hidden and public test cases to evaluate against")
    is_submit:bool = Field(default=False,description="True if final submission, False if just running public tests.")
    
class EvaluationResult(BaseModel):
    status:str = Field(...,description="Passed,Failed,Error")
    passed_cases:int
    total_cases:int
    console_output:str = Field(...,description="Raw stdout from Piston or tracebook errors")
    ai_critique:Optional[str]=None

