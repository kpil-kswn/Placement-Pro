from fastapi import FastAPI,UploadFile,File,Form,HTTPException,Body
from services.ats_scanner import evaluate_resume_against_jd,extract_text_from_pdf
from services.chat_service import process_chat_message
from models import ATSResult,ResumeQuestionsResult
from services.question_generator import generate_resume_questions
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.aptech_router import router as aptech_router
import os
from routers import interview_router
from routers.coding_router import router as coding_router
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
app.include_router(aptech_router)
app.include_router(coding_router)
app.include_router(interview_router.router,tags=["AI Voice Interview"])

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


@app.post("/api/v1/resume/questions", response_model=ResumeQuestionsResult)
async def get_resume_questions(resume:UploadFile=File(...)) -> ResumeQuestionsResult:
    safe_filename = resume.filename or ""
    if not safe_filename.endswith('.pdf'):
        raise HTTPException(status_code=400,detail="Only PDF files are allowed")
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text content cannot be empty.")
        
    try:
        return generate_resume_questions(resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/v1/chat")
async def chat_with_ai(
    message : str = Form(...),
    history : str = Form("[]"),
    file : UploadFile = File(None)
):
    try:
        file_bytes = None
        if file:
            safe_filename = file.filename or ""
            if not safe_filename.endswith(".pdf"):
                raise HTTPException (status_code=400,detail="Only pdf files are currently supported in chat.")
            file_bytes = await file.read()
        
        ai_response  = process_chat_message(
            new_message=message,
            history_json=history,
            file_bytes=file_bytes
        )
        return {"response":ai_response}
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

