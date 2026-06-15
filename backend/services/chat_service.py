import os
import dotenv
from dotenv import load_dotenv
from google import genai
from google.genai import types
import pdfplumber
import io
import json


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
        print(f"chat service error:{e}")
        raise e

    
