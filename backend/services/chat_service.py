import os
import dotenv
from dotenv import load_dotenv
from google import genai
from google.genai import types
import pdfplumber
import io
import json
import time


load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API'))

def extract_text_from_pdf(file_bytes:bytes)->str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text+=page_text+"\n"
    return text

def process_chat_message(new_message:str,history_json:str,file_bytes:bytes|None = None)->str:
    max_retries = 3
    for attemp in range(max_retries):
        try:
            raw_history = json.loads(history_json)
            gemini_history = []
            for msg in raw_history:
                role = "user" if msg["role"]=="user" else "model"
                gemini_history.append(
                    types.Content(role=role,parts=[types.Part.from_text(text=msg["text"])])
                )
            final_message = new_message
            if(file_bytes):
                extracted_text = extract_text_from_pdf(file_bytes)
                final_message = f"I am attaching a document for context.\n\nDocument Content:\n{extracted_text}\n\nMy Question = {new_message}"
            chat = client.chats.create(
                model='gemini-2.5-flash',
                history=gemini_history,
            )
            response = chat.send_message(final_message)

            if response.text is None:
                raise ValueError("Gemini returned no text")
            return response.text
    
        except Exception as e:
            error_message=str(e)
            if "503" in error_message or "UNAVAILABLE" in error_message:
                if attemp < max_retries-1:
                    sleep_time = 2**(attemp+1)
                    print(f"API busy (503). Retrying question generator in {sleep_time} second...")
                    time.sleep(sleep_time)
                    continue
            raise e
    raise Exception("Max tries excceded.AI evaluation services are currently Unavailable.")
    
