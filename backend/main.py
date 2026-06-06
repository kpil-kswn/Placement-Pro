from fastapi import FastAPI,UploadFile,File,Form,HTTPException,Body
from services.ats_scanner import evaluate_resume_against_jd,extract_text_from_pdf
from models import ATSResult,ResumeQuestionsResult
from services.question_generator import generate_resume_questions
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI(title="PlacementPro Backend")

frontend_url = os.getenv('FRONTEND_URL')
app.add_middleware(
    CORSMiddleware,
    allow_origins = [frontend_url],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.post("/api/v1/ats/scan",response_model=ATSResult)
async def scan_resume(resume:UploadFile=File(...),
                      job_description:str=Form(...)):
    if not resume.filename.endswith('.pdf'):
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
    if not resume.filename.endswith('.pdf'):
        raise HTTPException(status_code=400,detail="Only PDF files are allowed")
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text content cannot be empty.")
        
    try:
        return generate_resume_questions(resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))