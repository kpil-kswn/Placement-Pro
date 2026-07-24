from fastapi import APIRouter,HTTPException,BackgroundTasks,Body
from bson import ObjectId
import asyncio
from datetime import datetime,timezone
from schemas.pipeline_schema import InterviewTurn
import re
import json
from typing import Optional
from pydantic import BaseModel,Field
from typing import List
import os
import base64
import io
from google import genai
from google.genai import types
from dotenv import load_dotenv
from gtts import gTTS

from schemas.apti_schema import SingleAnswerSubmission,QuestionEvaluationResult
from schemas.pipeline_schema import PlacementPipelineDB,CodingProblemState
from services.aptech_service import generate_assessment_test
from services.coding_service import generate_coding_problem,generate_code_critique
from services.coding_execution_service import execute_with_jdoodle
from database import placement_pipelines_collection,users_collection

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API")
if not GEMINI_API_KEY:
    raise ValueError("CRITICAL: GEMINI_API_KEY is missing from your environment variables!")
client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/api/v1/pipeline",tags=["Placement Pipeline"])


async def generate_coding_problem_background(pipeline_id:str,resume_text:Optional[str]):
    try:
        task_easy = generate_coding_problem(resume_text=resume_text)
        task_medium = generate_coding_problem(resume_text=resume_text)
        task_hard = generate_coding_problem(resume_text=resume_text)

        p1,p2,p3 = await asyncio.gather(task_easy,task_medium,task_hard)

        problems = [
            CodingProblemState(problem_id="prob_1",difficulty="Easy",problem_data=p1,user_code="").dict(),
            CodingProblemState(problem_id="prob_2",difficulty="Medium",problem_data=p2,user_code="").dict(),
            CodingProblemState(problem_id="prob_3",difficulty="Hard",problem_data=p3,user_code="").dict(),
        ]
        placement_pipelines_collection.update_one(
            {"_id":ObjectId(pipeline_id)},
            {"$set":{"coding_round.problems":problems}}
        )
    except Exception as e:
        print(f"Background task failed for pipeline {pipeline_id}:{e}")


@router.get('/{pipeline_id}')
async def get_pipline_data(pipeline_id:str):
    pipeline  = placement_pipelines_collection.find_one({"_id":ObjectId(pipeline_id)})
    if not pipeline:
        raise HTTPException(status_code=404,detail="Pipeline not Found.")
    pipeline["_id"] = str(pipeline["_id"])
    return pipeline


@router.post("/start")
async def start_placement_pipeline(
    background_tasks:BackgroundTasks,
    user_id:str = Body(...),
    resume_text:Optional[str] = Body("")
):
    try:
        pipeline = PlacementPipelineDB(
            user_id=user_id,
            resume_text=resume_text,
            global_status='STARTED'
        )

        pipeline_dict = pipeline.dict(by_alias=True)
        result = placement_pipelines_collection.insert_one(pipeline_dict)
        pipeline_id = str(result.inserted_id)

        aptech_data = await generate_assessment_test(resume_text=resume_text)
        aptech_data.questions = aptech_data.questions[:30]
        placement_pipelines_collection.update_one(
            {"_id":ObjectId(pipeline_id)},
            {"$set":{
                "aptech_round.questions":[q.dict() for q in aptech_data.questions],
                "aptech_round.status":"in_progress"
            }}
        )

        background_tasks.add_task(generate_coding_problem_background,pipeline_id,resume_text)

        return{
            "message":"Pipeline Initialized Successfully",
            "pipeline_id":pipeline_id,
            "aptech_test":aptech_data
        }
    except Exception as e:
        print("Pipeline Start Error:",e)
        raise HTTPException(status_code=500,detail=f"Failed to start pipeline:{str(e)}")



class PipelineAptechSubmit(BaseModel):
    answers:List[SingleAnswerSubmission]

@router.post("/{pipeline_id}/submit-aptech")
async def submit_aptech_round(pipeline_id:str,payload:PipelineAptechSubmit):
    try:
        pipeline = placement_pipelines_collection.find_one({"_id":ObjectId(pipeline_id)})

        if not pipeline:
            raise HTTPException(status_code=404,detail="Pipeline not found")
        
        if pipeline.get("global_status")!="ROUND_1_APTECH":
            raise HTTPException(status_code=400,detail="invalid state candidate is not on round 1")
        
        original_questions = pipeline.get("aptech_round",{}).get("questions",[])
        questions_map = {q["id"]:q for q in original_questions}

        correct_count = 0
        evaluation_result = []

        for user_ans in payload.answers:
            target_question = questions_map.get(user_ans.question_id)
            if not target_question:
                continue
            is_correct = user_ans.selected_option.upper() == target_question["correct_option"].upper()
            if is_correct:
                correct_count+=1
            
            evaluation_result.append(
                QuestionEvaluationResult(
                    question_id=target_question["id"],
                    question=target_question["question"],
                    selected_option=user_ans.selected_option,
                    correct_option=target_question["correct_option"],
                    is_correct=is_correct,
                    explaination=target_question["explaination"]
                ).dict()
            )
        
        total_qs = len(evaluation_result)
        score_pct = (correct_count/total_qs * 100) if total_qs>0 else 0.0

        eval_response = {
            "total_questions":total_qs,
            "correct_answers":correct_count,
            "score_percentage":round(score_pct,2),
            "results":evaluation_result
        }
        placement_pipelines_collection.update_one(
            {"_id":ObjectId(pipeline_id)},
            {
                "$set":{
                    "aptech_round.status":"completed",
                    "aptech_round.user_answers":[a.dict() for a in payload.answers],
                    "aptech_round.evaluation":eval_response,
                    "global_status":"ROUND_1_INTERMISSION"
                }
            }
        )
        return{
            "message":"Round 1 Completed and Graded",
            "next_route":f"/placement/{pipeline_id}/intermission?round=1"
        }
    except Exception as e:
        print("Submit Aptech Error:", e)
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/{pipeline_id}/status")
async def get_pipeline_status(pipeline_id:str):
    try:
        pipeline = placement_pipelines_collection.find_one(
            {"_id":ObjectId(pipeline_id)},
            {"global_status":1,"aptech_round.status":1,"coding_round.status":1,"interview_round.status":1}
        )
        if not pipeline:
            raise HTTPException(status_code=404,detail="Pipeline not found")

        return{
            "pipeline_id": pipeline_id,
            "global_status": pipeline.get("global_status"),
            "aptech_status": pipeline.get("aptech_round", {}).get("status"),
            "coding_status": pipeline.get("coding_round", {}).get("status"),
            "interview_status": pipeline.get("interview_round", {}).get("status")
        }
    except Exception as e:
        print("Status check error:",e)
        raise HTTPException(status_code=500,detail=str(e))



class CodeDraftUpdate(BaseModel):
    problem_id:str = Field(...,description="prob_1?prob_2?prob_3")
    user_code:str = Field(...,description="Current code")

@router.patch("/{pipeline_id}/save-draft")
async def save_code_draft(pipeline_id:str,payload:CodeDraftUpdate):
    try:
        result = placement_pipelines_collection.update_one(
            {
                "_id":ObjectId(pipeline_id),
                "coding_round.problems.problem_id":payload.problem_id
            },
            {
                "$set":{
                    "coding_round.problems.$.user_code":payload.user_code
                }
            }
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404,detail="Pipeline on problem ID not found")
        return{
            "message":"Draft saved successfully"
        }
    except Exception as e:
        print("Draft save Error:",e)
        raise HTTPException(status_code=500,detail=str(e))


@router.post("/{pipeline_id}/submit-coding")
async def submit_coding_round(pipeline_id:str):
    try:
        pipeline = placement_pipelines_collection.find_one({"_id":ObjectId(pipeline_id)})
        if not pipeline:
            raise HTTPException(status_code=404,detail="Pipline not found")

        if pipeline.get("global_status") != "ROUND_2_CODING":
            pass

        problems = pipeline.get("coding_round",{}).get("problems",[])
        updated_problems = []

        for prob in problems:
            user_code = prob.get("user_code","")
            test_cases = prob.get("problem_data",{}).get("hidden_test_cases",[]) + prob.get("problem_data",{}).get("problem_test_cases",[])

            if not user_code.strip() or "def " not in user_code:
                prob["evaluation"]={
                    "status":"Failed",
                    "passed_cases":0,
                    "total_cases":len(test_cases),
                    "console_output":"No valid code submitted",
                    "ai_critique":"The candidate did not provide any valid solution"
                }
                updated_problems.append(prob)
                continue

            try:
                jdoodle_response = await execute_with_jdoodle(user_code, test_cases)
                
                run_data = jdoodle_response.get("run", {})
                raw_output = run_data.get("stdout", "")
                stderr = run_data.get("stderr", "")
                
                if stderr:
                    ai_review = await generate_code_critique(user_code)
                    prob["evaluation"] = {
                        "status": "Failed",
                        "passed_cases": 0,
                        "total_cases": len(test_cases),
                        "console_output": f"RUNTIME/SYNTAX ERROR:\n{stderr}",
                        "ai_critique": ai_review
                    }
                    updated_problems.append(prob)
                    continue

                passed_count = 0
                total_cases = len(test_cases)

                for i, tc in enumerate(test_cases):
                    expected_marker = f"---TEST_{i}_RESULT---::"
                    error_marker = f"---TEST_{i}_ERROR---::"
                    
                    if error_marker not in raw_output:
                        match = re.search(f"{expected_marker}(.*)", raw_output)
                        if match and match.group(1).strip() == str(tc.get("expected_output", "")).strip():
                            passed_count += 1
                
                final_status = "Passed" if passed_count == total_cases else "Failed"
                ai_review = await generate_code_critique(user_code)
                
                prob["evaluation"] = {
                    "status": final_status,
                    "passed_cases": passed_count,
                    "total_cases": total_cases,
                    "console_output": raw_output if raw_output else "No output generated.",
                    "ai_critique": ai_review
                }

            except Exception as execution_error:
                print(f"⚠️ JDoodle API Failure: {execution_error}. Engaging AI Fallback Grader!")
                ai_review = await generate_code_critique(user_code)
                prob["evaluation"] = {
                    "status": "Failed", 
                    "passed_cases": 0,
                    "total_cases": len(test_cases),
                    "console_output": "Execution timeout or infinite loop detected. The code took too long to run.",
                    "ai_critique": ai_review
                }
                
            updated_problems.append(prob)
        
        placement_pipelines_collection.update_one(
            {"_id":ObjectId(pipeline_id)},
            {
                "$set":{
                    "coding_round.problems":updated_problems,
                    "coding_round.status":"completed",
                    "global_status":"ROUND_2_INTERMISSION"
                }
            }
        )

        return{
            "message":"Round 2 Coding Graded Successfully",
            "next_route":f"/placement/{pipeline_id}/intermission?round=2"
        }

    except Exception as e:
        print("Submit Coding Error:",e)
        raise HTTPException(status_code=500,detail=str(e))

    
class Message(BaseModel):
    role: str  # "user" or "model"
    text: str = ""
    audio_b64 : Optional[str] = None

class ChatRequest(BaseModel):
    messages: list[Message]
    user_id:Optional[str] = None

@router.post('/interview')
async def interview_chat(request: ChatRequest):
    try:
        candidate_context = "Software Engineer with Python and React experience."
        if request.user_id:
            user_profile = users_collection.find_one({"_id": ObjectId(request.user_id)})
            if user_profile and user_profile.get("resume_text"):
                candidate_context = user_profile.get("resume_text")
        system_instruction = (
            "You are an elite technical interviewer. "
            f"Context about the candidate: {candidate_context}\n"
            "Do NOT ask them to recite their resume. Instead, pick a specific technology, project, or skill mentioned in their context and ask a deep, challenging technical question about it. "
            "When the candidate answers, first evaluate their answer (score out of 10) and give a brief 1-sentence critique. "
            "THEN, ask the next technical follow-up question based on their answer or another resume topic. "
            "You MUST format your response exactly like this:\n"
            "EVALUATION: <score and critique>\n"
            "QUESTION: <your next question>"
        )

        contents = [
            types.Content(
                role="user", 
                parts=[types.Part.from_text(text="I am ready to begin the interview.")]
            )
        ]
        user_transcript = ""

        if len(request.messages)>0:
            user_msg = request.messages[-1]
            if user_msg.audio_b64:
                print("Audio received transcribing...")
                audio_bytes = base64.b64decode(user_msg.audio_b64)
                audio_part = types.Part.from_bytes(data=audio_bytes,mime_type="audio/webm")
                stt_response = await client.aio.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[audio_part,"Transcribe exactly what the user said. Return only the transcript."]
                )
                user_transcript = stt_response.text.strip() if stt_response.text else "*(Inaudible)*"                
                user_msg.text = user_transcript
            else:
                user_transcript = user_msg.text
        
            for msg in request.messages:
                contents.append(
                    types.Content(role=msg.role,parts=[types.Part.from_text(text=msg.text)])
                )
        else:
            contents = [
                types.Content(
                    role="user", 
                    parts=[types.Part.from_text(text="Hello! Please start the interview by greeting me and asking about a challenging project I've worked on recently.")]
                )
            ]

        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash', 
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )
        
        full_reply = response.text or ""
        eval_text = ""
        question_text = full_reply

        if "QUESTION:" in full_reply:
            parts = full_reply.split("QUESTION:")
            eval_text = parts[0].replace("EVALUATION:","").strip()
            question_text = parts[1].strip()

        tts = gTTS(text=question_text,lang='en',tld='com')
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_base64 = base64.b64encode(fp.read()).decode('utf-8')
            
        return{
            "transcript":user_transcript,
            "evaluation":eval_text,
            "reply":question_text,
            "full_text":full_reply,
            "audio":audio_base64
        }

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



class PipelineInterviewSubmit(BaseModel):
    chat_log:List[InterviewTurn]

@router.post("/{pipeline_id}/finish-interview")
async def finish_interview_round(pipeline_id:str,payload:PipelineInterviewSubmit):
    try:
        pipeline = placement_pipelines_collection.find_one({"_id":ObjectId(pipeline_id)})
        if not pipeline:
            raise HTTPException(status_code=404,detail="Pipeline not found.")
        
        try:
            chat_text = "\n".join([f"AI:{t.ai_question}\nCandidate:{t.user_answer}" for t in payload.chat_log])
            prompt = f"Based on this technical interview transcript, write a brief 2-sentence summary of the candidate's communication skills and confidence:\n\n{chat_text}"
            ai_response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            final_feedback = ai_response.text.strip()
        except Exception as e:
            print("Failed to generate final AI feedback:",e)
            final_feedback = "The interview was completed,but AI final summary generation failed."

        placement_pipelines_collection.update_one(
            {"_id":ObjectId(pipeline_id)},
            {
                "$set":{
                    "interview_round.chat_log":[turn.dict() for turn in payload.chat_log],
                    "interview_round.status":"completed",
                    "interview_round.final_feedback":final_feedback,
                    "global_status":"COMPLETED",
                    "timestamps.completed_at":datetime.now(timezone.utc)
                }
            }
        )
        return {
            "message":"Placement Pipeline Successfully Completed",
            "next_route":f"/placement/{pipeline_id}/results"
        }
    except Exception as e:
        print("Finish Interview Error:",e)
        raise HTTPException(status_code=500,detail=str(e))


class FinalPlacementReport(BaseModel):
    readiness_level: str = Field(description="A short label (e.g., 'Industry Ready', 'Needs Core Practice', 'Strong Performer')")
    overall_score_out_of_100: int = Field(description="Integer score out of 100 across all rounds.")
    executive_summary: str = Field(description="1 paragraph summary of their overall performance.")
    top_strengths: List[str] = Field(description="Top 3 technical and communication strengths.")
    key_weaknesses: List[str] = Field(description="Key areas where the candidate struggled.")
    action_plan: List[str] = Field(description="3 to 5 actionable steps to improve before a real interview.")

@router.get("/{pipeline_id}/results")
async def get_final_results(pipeline_id: str):
    try:
        pipeline = placement_pipelines_collection.find_one({"_id": ObjectId(pipeline_id)})
        if not pipeline:
            raise HTTPException(status_code=404, detail="Pipeline not found")
        if pipeline.get("final_report"):
            pipeline["_id"] = str(pipeline["_id"])
            return {"status": "success", "report": pipeline["final_report"], "pipeline_data": pipeline}
        aptech = pipeline.get("aptech_round", {}).get("evaluation", {})
        aptech_score = aptech.get("score_percentage", 0)        
        coding = pipeline.get("coding_round", {}).get("problems", [])
        coding_summary = []
        for p in coding:
            eval_data = p.get("evaluation", {})
            coding_summary.append({
                "difficulty": p.get("difficulty"),
                "status": eval_data.get("status"),
                "passed": eval_data.get("passed_cases"),
                "total": eval_data.get("total_cases"),
                "ai_critique": eval_data.get("ai_critique")
            })
            
        interview = pipeline.get("interview_round", {}).get("chat_log", [])
        interview_summary = "\n".join([f"Q: {t.get('ai_question')}\nA: {t.get('user_answer')}\nFeedback: {t.get('ai_feedback')}" for t in interview])
        
        prompt = f"""
        You are an expert Enterprise Technical Recruiter and Career Coach. 
        Evaluate this candidate's performance across 3 rounds and generate a Final Placement Readiness Report.
        
        ROUND 1: Aptitude & Tech (MCQ) - Score: {aptech_score}%
        ROUND 2: Coding Test - {json.dumps(coding_summary)}
        ROUND 3: Technical Voice Interview - {interview_summary}
        """
        
        # 6. Force Gemini to return JSON matching the Pydantic schema
        ai_response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=FinalPlacementReport,
                temperature=0.2
            )
        )
        final_report = json.loads(ai_response.text)
        
        placement_pipelines_collection.update_one(
            {"_id": ObjectId(pipeline_id)},
            {"$set": {"final_report": final_report, "global_status": "COMPLETED"}}
        )
        
        pipeline["_id"] = str(pipeline["_id"])
        return {"status": "success", "report": final_report, "pipeline_data": pipeline}
        
    except Exception as e:
        print("Report Generation Error:", e)
        raise HTTPException(status_code=500, detail=str(e))



            
