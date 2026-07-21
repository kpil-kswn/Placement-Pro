import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set in python backend.")

client = MongoClient(MONGODB_URI)
db = client.test 

chats_collection = db.chats
users_collection = db.users
tests_collection = db.tests
questions_collection = db.questions
test_attempts_collection = db.test_attempts
placement_pipelines_collection = db["placement_pipelines"]


