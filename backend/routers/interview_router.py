# import os
# import json
# import asyncio
# import base64
# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from google import genai
# from google.genai import types
# from dotenv import load_dotenv

# load_dotenv()

# router = APIRouter()

# # Matches your original environment variable
# GEMINI_API_KEY = os.getenv("GEMINI_API") or os.getenv("GEMINI_API_KEY") 
# if not GEMINI_API_KEY:
#     raise ValueError("CRITICAL: GEMINI_API_KEY is missing from your environment variables!")

# MODEL_NAME = 'gemini-3.1-flash-live-preview' 
# client = genai.Client(api_key=GEMINI_API_KEY)

# @router.websocket("/ws/interview")
# async def interview_websocket(websocket: WebSocket):
#     await websocket.accept()
#     print("Candidate connected to AI Interview stream")
    
#     # Exact config mapping from your reference server.ts
#     config = types.LiveConnectConfig(
#         response_modalities=["AUDIO"],
#         speech_config=types.SpeechConfig(
#             voice_config=types.VoiceConfig(
#                 prebuilt_voice_config=types.PrebuiltVoiceConfig(
#                     voice_name="Zephyr"
#                 )
#             )
#         ),
#         system_instruction=types.Content(parts=[types.Part.from_text(
#             text="You are an elite technical interviewer conducting a live voice interview. Keep your questions and responses brief, natural, and conversational (under 2-3 sentences). Do not output markdown code blocks. Speak directly to the candidate."
#         )])
#     )

#     try:
#         async with client.aio.live.connect(model=MODEL_NAME, config=config) as session:
#             print("Gemini Live Session Opened")
            
#             # --- FIX 1: Passed positionally. No more 'input=' crash ---
#             await session.send(
#                 "Hello! Please start the interview by greeting me and asking about a challenging project I've worked on recently.",
#                 end_of_turn=True
#             )

#             async def receive_from_gemini():
#                 try:
#                     async for response in session.receive():
#                         server_content = response.server_content
#                         if server_content is not None:
#                             model_turn = server_content.model_turn
#                             if model_turn is not None and model_turn.parts is not None:
#                                 for part in model_turn.parts:
#                                     if part.inline_data and part.inline_data.data:
#                                         b64_audio = base64.b64encode(part.inline_data.data).decode('utf-8')
#                                         await websocket.send_text(json.dumps({
#                                             "type": "audioStream", 
#                                             "data": b64_audio
#                                         }))
                                        
#                             if server_content.turn_complete:
#                                 await websocket.send_text(json.dumps({"type": "turnComplete"}))
#                 except Exception as e:
#                     print(f"Gemini receive error: {e}")
#                     await websocket.send_text(json.dumps({"type": "error", "message": f"Gemini Error: {str(e)}"}))

#             async def receive_from_client():
#                 try:
#                     while True:
#                         message = await websocket.receive_text()
#                         data = json.loads(message)
                        
#                         if data.get("type") == "realtimeInput":
#                             audio_b64 = data.get("audioData")
#                             if audio_b64:
#                                 audio_bytes = base64.b64decode(audio_b64)
#                                 # --- FIX 2: Using the official Part object to stream audio smoothly ---
#                                 await session.send(
#                                     types.Part.from_bytes(data=audio_bytes, mime_type="audio/pcm;rate=16000"),
#                                     end_of_turn=False
#                                 )
                                
#                         elif data.get("type") == "contentUpdateText":
#                             await session.send(data.get("text"), end_of_turn=True)
#                 except Exception as e:
#                     print(f"Client receive error: {e}")
#                     await websocket.send_text(json.dumps({"type": "error", "message": f"Client Error: {str(e)}"}))

#             gemini_task = asyncio.create_task(receive_from_gemini())
#             client_task = asyncio.create_task(receive_from_client())
            
#             done, pending = await asyncio.wait(
#                 [gemini_task, client_task],
#                 return_when=asyncio.FIRST_COMPLETED,
#             )
            
#             for p in pending:
#                 p.cancel()
                
#     except WebSocketDisconnect:
#         print("Candidate disconnected from session")
#     except Exception as e:
#         print("Error encountered during streaming:", str(e))
#         try:
#             await websocket.send_json({"type": "error", "message": f"Connection Error: {str(e)}"})
#         except:
#             pass

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API") or os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("CRITICAL: GEMINI_API_KEY is missing from your environment variables!")

client = genai.Client(api_key=GEMINI_API_KEY)

class Message(BaseModel):
    role: str  # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    messages: list[Message]

# Ensure this matches your Next.js fetch URL! 
# (If your fetch is http://127.0.0.1:8000/api/interview, and your main.py has prefix="/api", keep this as '/interview')
@router.post('/interview')
async def interview_chat(request: ChatRequest):
    try:
        system_instruction = (
            "You are an elite technical interviewer conducting a live interview. "
            "Keep your questions and responses brief, natural, and conversational (under 2-3 sentences). "
            "Do not output markdown code blocks. Ask tough follow-up questions based on the candidate's answers."
        )

        # 1. Build the exact conversation array Gemini expects
        # We start with the mandatory 'user' prompt to satisfy Google's servers
        contents = [
            types.Content(
                role="user", 
                parts=[types.Part.from_text(text="I am ready to begin the interview.")]
            )
        ]
        
        # 2. Append the entire frontend history (which perfectly alternates model -> user)
        for msg in request.messages:
            contents.append(
                types.Content(
                    role=msg.role, 
                    parts=[types.Part.from_text(text=msg.text)]
                )
            )

        # 3. THE FIX: Use generate_content instead of chats.create. 
        # This is 100% stable for REST APIs and completely ignores Pylance history bugs!
        response = await client.aio.models.generate_content(
            model='gemini-1.5-flash', # Or gemini-2.0-flash if you fixed your quota limits
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7 
            )
        )

        return {"reply": response.text}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))