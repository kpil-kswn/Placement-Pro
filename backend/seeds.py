from database import tests_collection, questions_collection

def run_seed():
    print("Connecting to MongoDB...")
    
    tests_collection.delete_many({"type": "standard"})
    questions_collection.delete_many({}) 
    print("Cleared old tests and questions.")    
    standard_tests = [
      {
    "type": "standard",
    "title": "Database Management Systems (DBMS)",
    "description": "Test your core database knowledge, including SQL queries, normalization forms, ACID properties, indexing, and transaction management.",
    "duration_minutes": 30,
    "total_questions": 30
  },
  {
    "type": "standard",
    "title": "System Design",
    "description": "Evaluate your architectural skills covering horizontal vs vertical scaling, load balancing, microservices, caching strategies, and distributed systems.",
    "duration_minutes": 45,
    "total_questions": 30
  },
  {
    "type": "standard",
    "title": "Object-Oriented Programming (OOPs)",
    "description": "Assess your understanding of core paradigms: inheritance, polymorphism, encapsulation, abstraction, and common design patterns.",
    "duration_minutes": 30,
    "total_questions": 30
  },
  {
    "type": "standard",
    "title": "Computer Networks",
    "description": "Check your grasp of the OSI model, TCP/IP vs UDP, routing protocols, DNS resolution, HTTP/HTTPS, and network security fundamentals.",
    "duration_minutes": 30,
    "total_questions": 30
  },
  {
    "type": "standard",
    "title": "Operating Systems",
    "description": "Dive into low-level computing concepts like memory management, process scheduling algorithms, deadlocks, multithreading, and file systems.",
    "duration_minutes": 30,
    "total_questions": 30
  }
    ]

    # 3. Insert tests and grab their new unique IDs
    test_result = tests_collection.insert_many(standard_tests)
    test_ids = test_result.inserted_ids
    
    dbms_id = str(test_ids[0])
    system_design_id = str(test_ids[1])

    print(f"Inserted tests. DBMS ID: {dbms_id}, System Design ID: {system_design_id}")

    # 4. Define the Questions using the dynamic IDs
    questions = [
        # --- DBMS QUESTIONS ---
        {
            "test_id": dbms_id,
            "question_text": "What does ACID stand for in the context of database transactions?",
            "options": [
                "Atomicity, Consistency, Isolation, Durability",
                "Accuracy, Completeness, Isolation, Dependability",
                "Atomicity, Concurrency, Integrity, Durability",
                "Allocation, Consistency, Isolation, Dependency"
            ],
            "correct_answer": "Atomicity, Consistency, Isolation, Durability",
            "explanation": "ACID properties guarantee that database transactions are processed reliably, even in the event of errors or power failures."
        },
        {
            "test_id": dbms_id,
            "question_text": "Which normal form dictates that a table should have no transitive dependency?",
            "options": ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
            "correct_answer": "Third Normal Form (3NF)",
            "explanation": "3NF requires that every non-prime attribute is non-transitively dependent on every candidate key of the table."
        },
        {
            "test_id": dbms_id,
            "question_text": "What is the primary advantage of a clustered index over a non-clustered index?",
            "options": [
                "It allows for faster inserts and updates.",
                "It physically sorts the data rows in the table.",
                "You can have multiple clustered indexes per table.",
                "It requires less disk space to store."
            ],
            "correct_answer": "It physically sorts the data rows in the table.",
            "explanation": "A clustered index determines the physical order of data in a table, making range queries incredibly fast."
        },

        # --- SYSTEM DESIGN QUESTIONS ---
        {
            "test_id": system_design_id,
            "question_text": "What is the main difference between horizontal and vertical scaling?",
            "options": [
                "Vertical scaling adds more machines; horizontal scaling adds more CPU/RAM to an existing machine.",
                "Horizontal scaling adds more machines; vertical scaling adds more CPU/RAM to an existing machine.",
                "Horizontal scaling is only used for databases; vertical scaling is for web servers.",
                "There is no practical difference."
            ],
            "correct_answer": "Horizontal scaling adds more machines; vertical scaling adds more CPU/RAM to an existing machine.",
            "explanation": "Horizontal scaling (scaling out) distributes the load across multiple nodes, while vertical scaling (scaling up) beefs up a single node."
        },
        {
            "test_id": system_design_id,
            "question_text": "Which caching strategy writes data to the cache and the backend database simultaneously?",
            "options": ["Write-behind", "Write-through", "Write-around", "Cache-aside"],
            "correct_answer": "Write-through",
            "explanation": "Write-through caching ensures high data consistency because data is safely written to both the cache and the primary database at the same time."
        },
        {
            "test_id": system_design_id,
            "question_text": "In a microservices architecture, what is the primary role of an API Gateway?",
            "options": [
                "To store application data persistently.",
                "To act as a single entry point, handling routing, composition, and protocol translation.",
                "To compile the frontend React code.",
                "To manage the CI/CD pipeline deployments."
            ],
            "correct_answer": "To act as a single entry point, handling routing, composition, and protocol translation.",
            "explanation": "The API Gateway abstracts the underlying microservices, providing a unified interface for clients and handling cross-cutting concerns like authentication and rate limiting."
        }
    ]

    # 5. Insert the questions
    q_result = questions_collection.insert_many(questions)
    
    print(f"✅ Success! Inserted {len(q_result.inserted_ids)} questions into the database.")
    print("You can now click 'Start Assessment' on DBMS or System Design!")

if __name__ == "__main__":
    run_seed()