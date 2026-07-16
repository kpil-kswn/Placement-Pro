from fastapi import APIRouter,HTTPException
from database import tests_collection,users_collection
from bson import ObjectId
from pydantic import BaseModel
from datetime import datetime,timezone,timedelta
from database import test_attempts_collection,questions_collection
from services.question_generator import generate_resume_mcq_test
import random
from typing import Dict

class StartTestRequest(BaseModel):
    user_id:str
    test_id:str

class SubmitTestRequest(BaseModel):
    user_id:str
    user_answers:Dict[str,str]

router = APIRouter(prefix="/api/v1/mock-test",tags=["Mock Tests"])


@router.get("/catalog/{user_id}")
async def get_test_catalog(user_id:str):
    try:
        cursor = tests_collection.find({"type":"standard"})
        catalog = []

        for test in cursor:
            catalog.append({
                "id":str(test["_id"]),
                "type":test.get("type"),
                "title":test.get("title"),
                "description":test.get("description"),
                "duration_minutes":test.get("duration_minutes",30),
                "total_questions":test.get("total_questions",30)
            })
        
        try:
            user = users_collection.find_one({"_id":ObjectId(user_id)})
        except Exception:
            user = None
        
        if user and user.get("resumeText") and user["resumeText"].strip()!="":
            catalog.append({
                "id":"dynamic_resume_test",
                "type":"resume_custom",
                "title":"✨ Personalized Resume Assessment",
                "description":"A dynamic 30-question test generated in real-time by AI based entirely on your master resume.",
                "duration_minutes":30,
                "total_questions":30
            })

        return {"catalog":catalog}
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    


@router.post("/attempt/start")
async def start_mock_test(request:StartTestRequest):
    try:
        user_id = request.user_id
        test_id = request.test_id

        question_to_save = []
        duration_minutes = 30

        if test_id == "dynamic_resume_test":
            user = users_collection.find_one({"_id":ObjectId(user_id)})
            if not user or not user.get("resumeText"):
                raise HTTPException(status_code=400,detail="No resume found. Please upload one in your Profile.")
            
            ai_result = generate_resume_mcq_test(user["resumeText"])

            for q in ai_result.questions:
                question_to_save.append({
                    "question_text":q.question_text,
                    "options":q.options,
                    "correct_answer":q.correct_answer,
                    "explanation":q.explanation
                })
        else:
            test = tests_collection.find_one({"_id":ObjectId(test_id)})
            if not test:
                raise HTTPException(status_code=400,detail="Test not found.")
            duration_minutes = test.get("duration_minutes",30)

            pipeline = [
                {"$match":{"test_id":test_id}},
                {"$sample":{"size":30}}
            ]
            cursor = questions_collection.aggregate(pipeline)
            question_to_save = list(cursor)

            if len(question_to_save)==0:
                raise HTTPException(status_code=400,detail="No questions available for this test yet.")
            
        
        now  = datetime.now(timezone.utc)
        end_time = now + timedelta(minutes=duration_minutes)

        attemp_doc = {
            "user_id":user_id,
            "test_id":test_id,
            "status":"in_progress",
            "start_time":now,
            "end_time":end_time,
            "questions":question_to_save,
            "user_answers":{},
            "score":None
        }

        result = test_attempts_collection.insert_one(attemp_doc)
        attempt_id = str(result.inserted_id)

        safe_questions = []
        for index ,q in enumerate(question_to_save):
            shuffled_options = q["options"].copy()
            random.shuffle(shuffled_options)

            safe_questions.append({
                "id":str(index),
                "question_text":q["question_text"],
                "options":shuffled_options
            })
        
        return {
            "attempt_id":attempt_id,
            "end_time":end_time.isoformat(),
            "duration_minutes":duration_minutes,
            "questions":safe_questions
        }
    except Exception as e:
        print("Test Start Error:",e)
        raise HTTPException(status_code=500,detail=str(e))
    

@router.post("/attempt/{attempt_id}/submit")
async def submit_mock_test(attempt_id:str,request:SubmitTestRequest):
    try:
        attempt = test_attempts_collection.find_one({"_id":ObjectId(attempt_id)})
        if not attempt:
            raise HTTPException(status_code=404,detail="Test attempt not found")
        
        if attempt.get("user_id") != request.user_id:
            raise HTTPException(status_code=403,detail="Unauthorized Submission")
        
        if attempt.get("status") == "completed":
            raise HTTPException(status_code=400,detail="This test has already been submitted")
        
        questions = attempt.get("questions",[])
        user_answers = request.user_answers
        score = 0
        total_questions = len(questions)

        for index,question in enumerate(questions):
            q_id = str(index)
            chosen_answer = user_answers.get(q_id)
            if chosen_answer and chosen_answer==question.get("correct_answer"):
                score+=1
        
        percentage = (score/total_questions)*100 if total_questions>0 else 0

        test_attempts_collection.update_one(
            {"_id":ObjectId(attempt_id)},
            {
                "$set":{
                    "status":"completed",
                    "user_answers":user_answers,
                    "score":percentage,
                    "raw_score":f"{score}/{total_questions}"
                }
            }
        )
        return {
            "message":"Test submitted successfully!",
            "score":percentage,
            "raw_score":f"{score}/{total_questions}"
        }
    except Exception as e:
        print("Submission Error",e)
        raise HTTPException(status_code=500,detail=str(e))
    
@router.get("/attempt/{attempt_id}/results")
async def get_test_results(attempt_id: str, user_id: str):
    try:
        attempt = test_attempts_collection.find_one({"_id": ObjectId(attempt_id)})
        
        if not attempt:
            raise HTTPException(status_code=404, detail="Test attempt not found")
        
        if attempt.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        if attempt.get("status") != "completed":
            raise HTTPException(status_code=400, detail="Test is not completed yet.")

        attempt["_id"] = str(attempt["_id"])

        for q in attempt.get("questions", []):
            if "_id" in q:
                q["_id"] = str(q["_id"])
        return {"results": attempt}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))