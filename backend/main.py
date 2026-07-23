import os
import json
from bson import ObjectId
from datetime import datetime,timezone
from database import chats_collection
from dotenv import load_dotenv
from fastapi import FastAPI,UploadFile,File,Form,HTTPException,Body
from fastapi.middleware.cors import CORSMiddleware

from models import ATSResult,Message,ChatSchema
from services.ats_scanner import evaluate_resume_against_jd,extract_text_from_pdf
from services.chat_service import process_chat_message,generate_chat_title

from routers.coding_router import router as coding_router
from routers.mocktest_router import router as mocktest_router
from routers.pipeline_router import router as pipeline_router
load_dotenv()

app = FastAPI(title="PlacementPro Backend")

frontend_url = str(os.getenv("FRONTEND_URL", "http://localhost:3000"))
app.add_middleware(
    CORSMiddleware,
    allow_origins = [frontend_url],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

app.include_router(coding_router)
app.include_router(mocktest_router)
app.include_router(pipeline_router)

@app.post("/api/v1/ats/scan",response_model=ATSResult)
async def scan_resume(resume:UploadFile=File(...),
                      job_description:str=Form(...)):
    safe_filename = resume.filename or ""
    if not safe_filename.endswith(".pdf"):
        raise HTTPException(status_code=400,detail="Only PDF files are allowed")
    try:
        file_bytes = await resume.read()
        resume_text = extract_text_from_pdf(file_bytes)
        ats_analysis = evaluate_resume_against_jd(resume_text,job_description)
        return ats_analysis
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

# to list all chats for a user
@app.get("/api/v1/chats/{user_id}")
async def get_user_chats(user_id:str):
    try:
        cursor = chats_collection.find(
            {"userId":user_id},
            {"title":1,"updated_at":1}
        ).sort("updated_at",-1)

        chats = []
        for chat in cursor:
            chats.append({
                "id":str(chat["_id"]),
                "title":chat.get("title","New Conversation"),
                "updated_at":chat.get("updated_at")
            })
        return {"chats":chats}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

# to get a chat from its chat id for a user
@app.get("/api/v1/chat/{chat_id}")
async def get_single_chat(chat_id:str):
    try:
        chat = chats_collection.find_one({"_id":ObjectId(chat_id)})
        if not chat:
            raise HTTPException(status_code=404,detail="chat not found")
        
        chat["_id"] = str(chat["_id"])
        return {"chat":chat}
    except Exception as e:
        raise HTTPException(status_code=400,detail="Invalid Chat ID")

# to send message and update
@app.post("/api/v1/chat")
async def chat_with_ai(
    message : str = Form(...),
    userId : str = Form(...),
    chatId : str = Form(None),
    file : UploadFile = File(None)
):
    try:
        file_bytes = await file.read() if file else None
        
        user_msg = {"role":"user","text":message,"timestamp":datetime.now(timezone.utc)}
        
        history_for_gemini = []

        if chatId and chatId!="null":
            chat_doc = chats_collection.find_one({"_id":ObjectId(chatId)})
            if not chat_doc:
                raise HTTPException(status_code=404,detail="chat not found")

            history_for_gemini = [{"role":m["role"],"text":m["text"]} for m in chat_doc.get("messages",[])]

            chats_collection.update_one(
                {"_id":ObjectId(chatId)},
                {
                    "$push":{"messages":user_msg},
                    "$set":{"updated_at":datetime.now(timezone.utc)}
                }
            )
        
        else:
            new_title = generate_chat_title(message)
            new_chat = ChatSchema(
                userId=userId,
                title=new_title,
                messages=[Message(**user_msg)]
            )

            result = chats_collection.insert_one(new_chat.dict())
            chatId = str(result.inserted_id)
        
        ai_response_text = process_chat_message(
            new_message=message,
            history_json=json.dumps(history_for_gemini),
            file_bytes=file_bytes
        )

        ai_msg = {"role":"model","text":ai_response_text,"timestamp":datetime.now(timezone.utc)}
        chats_collection.update_one(
            {"_id":ObjectId(chatId)},
            {
                "$push": {"messages": ai_msg},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        return {
            "response": ai_response_text,
            "chatId":chatId
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

