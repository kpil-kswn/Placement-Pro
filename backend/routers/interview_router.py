import os
import base64
import io
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
from gtts import gTTS
from typing import Optional

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API")
if not GEMINI_API_KEY:
    raise ValueError("CRITICAL: GEMINI_API_KEY is missing from your environment variables!")

client = genai.Client(api_key=GEMINI_API_KEY)

class Message(BaseModel):
    role: str  # "user" or "model"
    text: str = ""
    audio_b64 : Optional[str] = None

class ChatRequest(BaseModel):
    messages: list[Message]

@router.post('/interview')
async def interview_chat(request: ChatRequest):
    try:
        system_instruction = (
            "You are an elite technical interviewer. "
            "When the candidate answers, first evaluate their answer (score out of 10) and give a brief 1-sentence critique. "
            "THEN, ask the next technical follow-up question. "
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

 