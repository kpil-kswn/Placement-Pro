import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API")
client = genai.Client(api_key=GEMINI_API_KEY)

print("--- Available Gemini Models supporting Generation ---")
# Use the new SDK models service to list all active endpoints
for model in client.models.list():
    if "generateContent" in model.supported_actions:
        print(f"Model ID: {model.name} | Display Name: {model.display_name}")
