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

    test_result = tests_collection.insert_many(standard_tests)
    test_ids = test_result.inserted_ids
    
    dbms_id = str(test_ids[0])
    sd_id = str(test_ids[1])
    oops_id= str(test_ids[2])
    cn_id = str(test_ids[3])
    os_id = str(test_ids[4])

    print(f"Inserted tests. DBMS ID: {dbms_id}, System Design ID: {sd_id}")

    questions = [
    {
    "test_id": dbms_id,
    "question_text": "In the context of Multi-Version Concurrency Control (MVCC), which of the following statements is true?",
    "options": [
      "Readers block writers until the read transaction commits.",
      "Writers block readers until the write transaction commits.",
      "Readers do not block writers, and writers do not block readers.",
      "All transactions are serialized using strict two-phase locking."
    ],
    "correct_answer": "Readers do not block writers, and writers do not block readers.",
    "explanation": "MVCC creates multiple versions of data. When a transaction writes, it creates a new version. Readers simply read an older snapshot of the data, meaning read and write operations do not block each other."
  },
  {
    "test_id": dbms_id,
    "question_text": "Which of the following database anomalies is entirely prevented by the 'Repeatable Read' isolation level, but allows another specific anomaly to occur?",
    "options": [
      "Prevents Dirty Reads, allows Lost Updates",
      "Prevents Non-repeatable Reads, allows Phantom Reads",
      "Prevents Phantom Reads, allows Dirty Reads",
      "Prevents Lost Updates, allows Non-repeatable Reads"
    ],
    "correct_answer": "Prevents Non-repeatable Reads, allows Phantom Reads",
    "explanation": "Repeatable Read guarantees that if you read a row twice in one transaction, the data won't change (preventing non-repeatable reads). However, it does not lock range insertions, allowing new rows to appear (phantom reads)."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the primary characteristic of Strict Two-Phase Locking (Strict 2PL)?",
    "options": [
      "A transaction must acquire all locks simultaneously before executing.",
      "A transaction releases read locks immediately after reading, but holds write locks until commit.",
      "A transaction holds all its exclusive (write) locks until it commits or aborts.",
      "A transaction cannot acquire any new locks once it releases its first lock, but exclusive locks are released early."
    ],
    "correct_answer": "A transaction holds all its exclusive (write) locks until it commits or aborts.",
    "explanation": "Strict 2PL mandates that a transaction holds all its exclusive locks until the transaction ends. This guarantees strict serializability and completely prevents cascading rollbacks."
  },
  {
    "test_id": dbms_id,
    "question_text": "In database recovery, what are the three distinct phases of the ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) algorithm?",
    "options": [
      "Analysis, Undo, Redo",
      "Analysis, Redo, Undo",
      "Checkpointing, Redo, Undo",
      "Logging, Analysis, Redo"
    ],
    "correct_answer": "Analysis, Redo, Undo",
    "explanation": "ARIES operates in three phases: Analysis (identifies dirty pages and active transactions), Redo (repeats history to reconstruct the state at crash), and Undo (rolls back uncommitted transactions)."
  },
  {
    "test_id": dbms_id,
    "question_text": "Why is Boyce-Codd Normal Form (BCNF) considered strictly stronger than Third Normal Form (3NF)?",
    "options": [
      "BCNF eliminates all multi-valued dependencies.",
      "BCNF requires that every determinant must be a candidate key, whereas 3NF allows a non-key attribute to determine part of a candidate key.",
      "BCNF removes transitive dependencies, which 3NF ignores.",
      "BCNF ensures lossless join decomposition, which 3NF does not."
    ],
    "correct_answer": "BCNF requires that every determinant must be a candidate key, whereas 3NF allows a non-key attribute to determine part of a candidate key.",
    "explanation": "3NF has an exception: X -> Y is allowed if Y is part of a candidate key (a prime attribute). BCNF removes this exception, stating strictly that X MUST be a superkey."
  },
  {
    "test_id": dbms_id,
    "question_text": "Under what condition is a 'Sort-Merge Join' generally more efficient than a 'Hash Join'?",
    "options": [
      "When both tables are highly fragmented and have no indexes.",
      "When one table is vastly smaller than the other.",
      "When both tables are already sorted on the join key.",
      "When the join condition uses a non-equi join (e.g., > or <)."
    ],
    "correct_answer": "When both tables are already sorted on the join key.",
    "explanation": "If the input relations are already sorted (for example, due to a clustered index), Sort-Merge Join avoids the expensive sorting phase and executes extremely fast in O(N + M) time."
  },
  {
    "test_id": dbms_id,
    "question_text": "In a distributed database utilizing Two-Phase Commit (2PC), what is the primary drawback of the protocol?",
    "options": [
      "It cannot handle more than two participating databases.",
      "It is a blocking protocol; if the coordinator crashes after the 'prepare' phase, participants are locked indefinitely.",
      "It provides eventual consistency rather than strict consistency.",
      "It requires a synchronized global clock across all nodes."
    ],
    "correct_answer": "It is a blocking protocol; if the coordinator crashes after the 'prepare' phase, participants are locked indefinitely.",
    "explanation": "If the coordinator goes down after participants have voted 'yes' but before sending the final 'commit' or 'abort', the participants must hold their locks indefinitely until the coordinator recovers."
  },
  {
    "test_id": dbms_id,
    "question_text": "What does a 'Covering Index' mean in query optimization?",
    "options": [
      "An index that spans all columns in a table.",
      "An index that includes all the columns required by a query, allowing the database to avoid reading the actual data table.",
      "An index used exclusively for covering up deleted records via soft deletes.",
      "A primary key index that covers foreign key constraints."
    ],
    "correct_answer": "An index that includes all the columns required by a query, allowing the database to avoid reading the actual data table.",
    "explanation": "If an index contains all the fields specified in the SELECT, JOIN, and WHERE clauses, the query can be resolved entirely from the index pages without doing an expensive physical table lookup."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the primary use case for a Bitmap Index?",
    "options": [
      "Tables with high-cardinality columns (e.g., unique user IDs).",
      "Read-heavy tables with low-cardinality columns (e.g., Gender, Boolean flags).",
      "Write-heavy tables where frequent updates occur.",
      "Full-text search across large text BLOBs."
    ],
    "correct_answer": "Read-heavy tables with low-cardinality columns (e.g., Gender, Boolean flags).",
    "explanation": "Bitmap indexes use bit arrays for distinct values. They are highly compressed and extremely fast for bitwise operations (AND/OR) on low-cardinality data, but terrible for write-heavy environments due to locking."
  },
  {
    "test_id": dbms_id,
    "question_text": "In the context of the CAP Theorem, how do traditional RDBMS systems (like PostgreSQL or MySQL) classify?",
    "options": [
      "AP (Available and Partition Tolerant)",
      "CP (Consistent and Partition Tolerant)",
      "CA (Consistent and Available)",
      "None of the above"
    ],
    "correct_answer": "CA (Consistent and Available)",
    "explanation": "Traditional single-node RDBMS systems prioritize Consistency and Availability. Because they are not distributed by default, they do not natively handle Network Partitions (P)."
  },
  {
    "test_id": dbms_id,
    "question_text": "Which SQL window function will assign identical ranks to tied rows and leave gaps in the subsequent ranking numbers?",
    "options": ["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()"],
    "correct_answer": "RANK()",
    "explanation": "RANK() assigns the same rank to ties but skips the next numbers (e.g., 1, 2, 2, 4). DENSE_RANK() does not leave gaps (e.g., 1, 2, 2, 3)."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the Thomas Write Rule in timestamp-based concurrency control?",
    "options": [
      "A transaction must always write to the disk immediately.",
      "If an older transaction tries to write to a value that has already been updated by a newer transaction, the older write is safely ignored.",
      "Writers must lock the entire table before updating.",
      "Writes can only occur if the read timestamp is zero."
    ],
    "correct_answer": "If an older transaction tries to write to a value that has already been updated by a newer transaction, the older write is safely ignored.",
    "explanation": "The Thomas Write Rule optimizes timestamp ordering by recognizing that an obsolete write can simply be ignored without rolling back the transaction, as a newer value already exists."
  },
  {
    "test_id": dbms_id,
    "question_text": "Which normal form deals specifically with eliminating non-trivial multi-valued dependencies?",
    "options": ["Second Normal Form (2NF)", "Boyce-Codd Normal Form (BCNF)", "Fourth Normal Form (4NF)", "Fifth Normal Form (5NF)"],
    "correct_answer": "Fourth Normal Form (4NF)",
    "explanation": "4NF is reached when a table is in BCNF and contains no multi-valued dependencies, meaning an independent attribute should not map to multiple independent attributes in the same table."
  },
  {
    "test_id": dbms_id,
    "question_text": "What happens if you use the 'UNION' operator instead of 'UNION ALL' in SQL?",
    "options": [
      "UNION is faster because it does not check for duplicates.",
      "UNION ALL removes duplicate rows, making it slower.",
      "UNION removes duplicate rows by performing an implicit distinct/sort operation, making it slower than UNION ALL.",
      "There is no performance difference between the two."
    ],
    "correct_answer": "UNION removes duplicate rows by performing an implicit distinct/sort operation, making it slower than UNION ALL.",
    "explanation": "UNION ALL simply concatenates result sets, which is fast. UNION must scan the final result set and eliminate duplicates, requiring additional CPU and memory overhead."
  },
  {
    "test_id": dbms_id,
    "question_text": "In a B+ Tree index, what is the 'fill factor'?",
    "options": [
      "The percentage of memory allocated for the entire index.",
      "The percentage of space on each index page left empty to accommodate future data insertions and avoid page splits.",
      "The ratio of deleted records to active records in an index.",
      "The maximum depth the B+ tree is allowed to reach."
    ],
    "correct_answer": "The percentage of space on each index page left empty to accommodate future data insertions and avoid page splits.",
    "explanation": "A fill factor of 80% means index pages are left 20% empty. This prevents expensive 'page splits' when new rows are inserted in the middle of the index structure."
  },
  {
    "test_id": dbms_id,
    "question_text": "In deadlock prevention, how does the 'Wait-Die' scheme operate?",
    "options": [
      "Older transactions wait for younger ones; younger transactions are aborted if they request a lock held by an older one.",
      "Younger transactions wait for older ones; older transactions are aborted if they request a lock held by a younger one.",
      "All transactions wait randomly until a timeout occurs.",
      "Transactions immediately die if they encounter any lock."
    ],
    "correct_answer": "Older transactions wait for younger ones; younger transactions are aborted if they request a lock held by an older one.",
    "explanation": "Wait-Die is a non-preemptive scheme. If an older transaction requests a lock held by a younger one, it WAITS. If a younger transaction requests a lock held by an older one, it DIES (rolls back)."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the primary difference between a Clustered and Non-Clustered index?",
    "options": [
      "A table can have multiple clustered indexes but only one non-clustered index.",
      "A clustered index determines the physical storage order of data; a non-clustered index stores a logical ordering and pointers to the physical data.",
      "Clustered indexes are used only for text search, while non-clustered are for integers.",
      "Non-clustered indexes are automatically created on primary keys."
    ],
    "correct_answer": "A clustered index determines the physical storage order of data; a non-clustered index stores a logical ordering and pointers to the physical data.",
    "explanation": "Because data can only be sorted physically in one way, a table can only have one clustered index. Non-clustered indexes contain pointers (or clustered keys) to locate the actual rows."
  },
  {
    "test_id": dbms_id,
    "question_text": "When executing a SQL query, in what order are the following clauses logically evaluated?",
    "options": [
      "SELECT, FROM, WHERE, GROUP BY, HAVING",
      "FROM, WHERE, GROUP BY, HAVING, SELECT",
      "FROM, GROUP BY, WHERE, HAVING, SELECT",
      "SELECT, WHERE, FROM, GROUP BY, HAVING"
    ],
    "correct_answer": "FROM, WHERE, GROUP BY, HAVING, SELECT",
    "explanation": "Logically, the database determines the table (FROM), filters rows (WHERE), groups the data (GROUP BY), filters the groups (HAVING), and finally projects the columns (SELECT)."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is 'Data Independence' in a DBMS architecture?",
    "options": [
      "The ability of the database to operate without an internet connection.",
      "The ability to change the schema at one level of a database system without having to change the schema at the next higher level.",
      "The separation of the database server from the web server hardware.",
      "The guarantee that transactions will not interfere with each other."
    ],
    "correct_answer": "The ability to change the schema at one level of a database system without having to change the schema at the next higher level.",
    "explanation": "Logical Data Independence allows changing the conceptual schema without altering external views. Physical Data Independence allows changing storage structures without altering the conceptual schema."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is a 'Correlated Subquery'?",
    "options": [
      "A subquery that runs entirely independently of the outer query.",
      "A subquery that returns multiple columns instead of just one.",
      "A subquery that depends on values from the outer query for its execution, forcing it to be evaluated row-by-row.",
      "A subquery used strictly inside the HAVING clause."
    ],
    "correct_answer": "A subquery that depends on values from the outer query for its execution, forcing it to be evaluated row-by-row.",
    "explanation": "Because a correlated subquery references columns from the outer query, it cannot be executed just once. It must be executed repeatedly for every row processed by the outer query, often making it computationally expensive."
  },
  {
    "test_id": dbms_id,
    "question_text": "In Data Warehousing, what distinguishes a Snowflake Schema from a Star Schema?",
    "options": [
      "A Star Schema has no dimension tables.",
      "A Snowflake Schema normalizes its dimension tables into multiple related tables, whereas a Star Schema uses highly denormalized dimension tables.",
      "A Snowflake Schema is strictly for NoSQL databases.",
      "A Star Schema uses multi-valued dimensions."
    ],
    "correct_answer": "A Snowflake Schema normalizes its dimension tables into multiple related tables, whereas a Star Schema uses highly denormalized dimension tables.",
    "explanation": "Star schemas are denormalized for faster read performance. Snowflake schemas normalize the dimension tables to save storage space and maintain data integrity, at the cost of requiring more complex joins."
  },
  {
    "test_id": dbms_id,
    "question_text": "Which RAID configuration is highly recommended for storing database Transaction Logs (WAL) due to its excellent write performance and redundancy?",
    "options": ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
    "correct_answer": "RAID 10",
    "explanation": "RAID 10 (1+0) combines mirroring and striping. It provides high redundancy and excellent write performance, which is critical for transaction logs. RAID 5 suffers from write penalties due to parity calculations."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the primary function of a Cost-Based Optimizer (CBO) in a relational database?",
    "options": [
      "To automatically bill cloud customers based on CPU usage.",
      "To evaluate multiple query execution plans based on internal statistics and select the one with the lowest estimated resource cost.",
      "To compress data on disk to save hardware costs.",
      "To enforce foreign key constraints during massive batch inserts."
    ],
    "correct_answer": "To evaluate multiple query execution plans based on internal statistics and select the one with the lowest estimated resource cost.",
    "explanation": "The CBO uses metadata (table sizes, index distributions, histograms) to estimate the cost of various execution paths (e.g., hash join vs nested loop) and picks the fastest one."
  },
  {
    "test_id": dbms_id,
    "question_text": "How do Columnar databases (like Amazon Redshift or Snowflake) achieve massive compression and read speed for analytical queries compared to Row-based databases?",
    "options": [
      "They store data in JSON format.",
      "They store all values of a single column contiguously on disk, allowing for efficient type-specific compression and minimizing I/O for aggregations.",
      "They keep all data entirely in RAM and never write to disk.",
      "They use B-Trees instead of B+ Trees."
    ],
    "correct_answer": "They store all values of a single column contiguously on disk, allowing for efficient type-specific compression and minimizing I/O for aggregations.",
    "explanation": "By storing columns together, the database can heavily compress similar data types and only load the specific columns requested by a query into memory, making OLAP workloads blazingly fast."
  },
  {
    "test_id": dbms_id,
    "question_text": "What does a 'Cascading Rollback' refer to?",
    "options": [
      "When a hardware failure causes multiple servers in a cluster to fail sequentially.",
      "When the database runs out of undo space and crashes.",
      "When an uncommitted transaction aborts, forcing the rollback of other transactions that read its dirty data.",
      "When a trigger automatically fires a rollback command."
    ],
    "correct_answer": "When an uncommitted transaction aborts, forcing the rollback of other transactions that read its dirty data.",
    "explanation": "If Transaction A writes a value, and Transaction B reads it before A commits, and then A fails and rolls back, Transaction B must also be rolled back to maintain consistency. This is prevented by Strict 2PL."
  },
  {
    "test_id": dbms_id,
    "question_text": "In a distributed NoSQL database like Cassandra, what does the concept of 'Hinted Handoff' solve?",
    "options": [
      "It allows a node to temporarily store a write for a downed neighbor, handing it over once the neighbor comes back online.",
      "It resolves conflicts when two users update the same record.",
      "It encrypts passwords before storing them.",
      "It shifts primary keys sequentially to prevent hot spots."
    ],
    "correct_answer": "It allows a node to temporarily store a write for a downed neighbor, handing it over once the neighbor comes back online.",
    "explanation": "Hinted handoff improves availability. If node A is meant to receive a write but is offline, node B will accept the write, store it locally as a 'hint', and forward it to A when A recovers."
  },
  {
    "test_id": dbms_id,
    "question_text": "Which property of a hash function is most crucial to ensure an optimal Hash Index structure in a DBMS?",
    "options": [
      "Cryptographic security (e.g., SHA-256).",
      "Reversibility (ability to decrypt the hash back to the original key).",
      "Uniform distribution to minimize hash collisions (buckets overflowing).",
      "The ability to sort keys alphabetically."
    ],
    "correct_answer": "Uniform distribution to minimize hash collisions (buckets overflowing).",
    "explanation": "If a hash function does not distribute keys uniformly, it creates 'bucket skew' where many keys map to the same bucket. This causes the database to perform slow linear searches within that bucket."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the purpose of the 'UNDO' log in database recovery?",
    "options": [
      "To reapply committed transactions that were lost from memory during a crash.",
      "To roll back the effects of uncommitted transactions that had partially written to disk before a crash.",
      "To undelete rows dropped by a user.",
      "To reverse the schema changes made by an ALTER TABLE statement."
    ],
    "correct_answer": "To roll back the effects of uncommitted transactions that had partially written to disk before a crash.",
    "explanation": "Because modern databases flush dirty pages to disk before transactions commit (Steal policy), the UNDO log is required to reverse those uncommitted changes if the system crashes."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is a 'Tethered Query' or 'Nested Loop Join' worst-case time complexity, assuming Table A has N rows and Table B has M rows?",
    "options": ["O(N + M)", "O(N log M)", "O(N * M)", "O(1)"],
    "correct_answer": "O(N * M)",
    "explanation": "A standard Nested Loop Join takes every row in Table A and scans the entirety of Table B to find matches. Without indexes, this requires N * M comparisons, making it terrible for large tables."
  },
  {
    "test_id": dbms_id,
    "question_text": "What is the primary mechanism used to prevent SQL Injection attacks?",
    "options": [
      "Base64 Encoding all user inputs.",
      "Using Parameterized Queries (Prepared Statements).",
      "Truncating strings to 50 characters.",
      "Hosting the database on a private subnet."
    ],
    "correct_answer": "Using Parameterized Queries (Prepared Statements).",
    "explanation": "Parameterized queries separate the SQL code from the user-provided data. The database driver ensures that the input is treated strictly as a literal value, never as executable code, entirely neutralizing SQL injection."
  },
  {
    "test_id": sd_id,
    "question_text": "In the context of the CAP theorem, how does the PACELC theorem extend our understanding of distributed systems?",
    "options": [
      "It proves that Consistency and Availability can be achieved simultaneously if latency is ignored.",
      "It states that in the absence of a network Partition (E), the system must trade off between Latency (L) and Consistency (C).",
      "It introduces Eventual Consistency as a mandatory requirement for highly available systems.",
      "It replaces the CAP theorem entirely for microservice architectures."
    ],
    "correct_answer": "It states that in the absence of a network Partition (E), the system must trade off between Latency (L) and Consistency (C).",
    "explanation": "PACELC states: if there is a Partition (P), trade off Availability (A) or Consistency (C); Else (E), trade off Latency (L) or Consistency (C). It addresses normal operation, not just failure scenarios."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary purpose of 'Virtual Nodes' in a Consistent Hashing ring?",
    "options": [
      "To encrypt data at rest before hashing.",
      "To distribute the load more evenly across physical servers, especially when servers have heterogeneous capacities.",
      "To allow the caching of static assets on edge servers.",
      "To prevent unauthorized nodes from joining the hash ring."
    ],
    "correct_answer": "To distribute the load more evenly across physical servers, especially when servers have heterogeneous capacities.",
    "explanation": "Without virtual nodes, a ring can become unbalanced if nodes are spaced unevenly. By assigning multiple virtual nodes per physical server, the load is distributed much more uniformly across the cluster."
  },
  {
    "test_id": sd_id,
    "question_text": "When designing a distributed transaction spanning multiple microservices, what is the 'Saga Pattern' primarily used for?",
    "options": [
      "Locking all databases simultaneously until the entire transaction completes.",
      "Managing a sequence of local transactions where each step publishes an event to trigger the next step, using compensating transactions to handle failures.",
      "Routing API requests through a single gateway to ensure strict serializability.",
      "Synchronously replicating data across data centers to prevent data loss."
    ],
    "correct_answer": "Managing a sequence of local transactions where each step publishes an event to trigger the next step, using compensating transactions to handle failures.",
    "explanation": "Because Two-Phase Commit (2PC) is blocking and scales poorly in microservices, the Saga pattern uses a sequence of independent local transactions. If one fails, previously completed steps execute compensating (undo) transactions."
  },
  {
    "test_id": sd_id,
    "question_text": "Which load balancing algorithm is most appropriate when users maintain long-lived stateful connections (like WebSockets) to the server?",
    "options": [
      "Round Robin",
      "Least Connections",
      "IP Hash",
      "Random Selection"
    ],
    "correct_answer": "Least Connections",
    "explanation": "Round Robin blindly sends traffic sequentially, which can overwhelm a server if earlier connections don't drop. 'Least Connections' directs traffic to the server with the fewest active connections, maintaining balance for long-lived sessions."
  },
  {
    "test_id": sd_id,
    "question_text": "In a high-throughput system like a social media newsfeed, what is the 'Thundering Herd' problem?",
    "options": [
      "When a single database query returns too many rows, crashing the application server.",
      "When a highly popular cached item expires, causing a massive spike of identical requests to hit the backend database simultaneously.",
      "When millions of users upload images at the exact same time.",
      "When a load balancer fails and sends all traffic to a single node."
    ],
    "correct_answer": "When a highly popular cached item expires, causing a massive spike of identical requests to hit the backend database simultaneously.",
    "explanation": "If a celebrity's viral post expires from the cache, millions of concurrent reads will suddenly miss the cache and hit the database at once. Solutions include adding 'jitter' to TTLs or using mutex locks during cache regeneration."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary advantage of a 'Write-Back' (or Write-Behind) caching strategy over a 'Write-Through' strategy?",
    "options": [
      "It guarantees strict data consistency between the cache and the database.",
      "It reduces write latency for the client by initially writing only to the cache and asynchronously syncing to the database later.",
      "It prevents cache invalidation logic from failing.",
      "It eliminates the need for cache evictions."
    ],
    "correct_answer": "It reduces write latency for the client by initially writing only to the cache and asynchronously syncing to the database later.",
    "explanation": "Write-Back is extremely fast because the client doesn't wait for the slow database write. However, it risks data loss if the cache server crashes before the asynchronous sync completes."
  },
  {
    "test_id": sd_id,
    "question_text": "When generating unique IDs in a distributed system, how does Twitter's 'Snowflake' algorithm ensure uniqueness without a centralized coordination database?",
    "options": [
      "By using standard 128-bit UUIDs generated randomly.",
      "By combining a timestamp, a datacenter ID, a machine ID, and an incrementing sequence number into a 64-bit integer.",
      "By electing a single master node via Paxos to issue IDs.",
      "By hashing the user's IP address and email."
    ],
    "correct_answer": "By combining a timestamp, a datacenter ID, a machine ID, and an incrementing sequence number into a 64-bit integer.",
    "explanation": "Snowflake generates sortable, 64-bit integers locally on the application servers. The combination of machine ID and timestamp ensures global uniqueness without the latency of calling a central database."
  },
  {
    "test_id": sd_id,
    "question_text": "In a microservices architecture, what is the 'Circuit Breaker' pattern used for?",
    "options": [
      "To permanently terminate idle connections.",
      "To detect failures in a downstream service and temporarily halt requests to it, preventing system-wide cascading failures.",
      "To automatically restart crashed Docker containers.",
      "To throttle incoming client requests if they exceed rate limits."
    ],
    "correct_answer": "To detect failures in a downstream service and temporarily halt requests to it, preventing system-wide cascading failures.",
    "explanation": "If Service A calls Service B and Service B is failing/timing out, a Circuit Breaker 'opens', failing fast for subsequent calls so Service A doesn't exhaust its own thread pool waiting for B."
  },
  {
    "test_id": sd_id,
    "question_text": "How do 'Vector Clocks' help resolve conflicts in a distributed database like Amazon Dynamo?",
    "options": [
      "They use GPS-synchronized hardware clocks to assign exact timestamps to writes.",
      "They maintain a list of (node, counter) pairs for each data item to detect causality and determine if concurrent writes occurred.",
      "They elect a leader to serialize all writes sequentially.",
      "They automatically discard the older version of the data."
    ],
    "correct_answer": "They maintain a list of (node, counter) pairs for each data item to detect causality and determine if concurrent writes occurred.",
    "explanation": "Vector clocks track the history of updates across different nodes. If two nodes update the same item concurrently, their vector clocks will show a conflict, which the database then passes to the application layer to resolve."
  },
  {
    "test_id": sd_id,
    "question_text": "When designing a location-based service (like Uber or Yelp), why is a 'Geohash' or 'Quadtree' heavily preferred over standard SQL latitude/longitude columns?",
    "options": [
      "Because standard databases cannot store floating-point numbers accurately.",
      "They map 2D coordinates into 1D strings or tree structures, allowing for ultra-fast spatial indexing and 'find near me' queries.",
      "They automatically calculate the traffic-adjusted ETA between two points.",
      "They consume significantly less disk space than integers."
    ],
    "correct_answer": "They map 2D coordinates into 1D strings or tree structures, allowing for ultra-fast spatial indexing and 'find near me' queries.",
    "explanation": "Querying raw lat/lon involves expensive mathematical formulas (Haversine) on every row. Geohashing converts coordinates into a string where items sharing a prefix are geographically close, turning a math problem into a lightning-fast string prefix lookup."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the fundamental difference between a Forward Proxy and a Reverse Proxy?",
    "options": [
      "A forward proxy balances load; a reverse proxy caches data.",
      "A forward proxy sits in front of clients to mask their identities; a reverse proxy sits in front of servers to mask their infrastructure.",
      "A forward proxy handles HTTP traffic; a reverse proxy handles HTTPS traffic.",
      "Forward proxies are hardware-based, while reverse proxies are software-based."
    ],
    "correct_answer": "A forward proxy sits in front of clients to mask their identities; a reverse proxy sits in front of servers to mask their infrastructure.",
    "explanation": "Clients use a Forward Proxy (like a VPN) to access the internet anonymously. Servers use a Reverse Proxy (like NGINX) to accept incoming internet traffic, handle SSL termination, and route it to backend microservices."
  },
  {
    "test_id": sd_id,
    "question_text": "When designing an API that allows users to submit a payment, what is the most robust way to handle 'Idempotency' to prevent double-charging?",
    "options": [
      "Ensure the database relies strictly on ACID properties.",
      "Require the client to send a unique 'Idempotency-Key' in the header; the server stores this key and returns the cached response if it sees the key again.",
      "Implement a Token Bucket rate limiter.",
      "Use UDP instead of TCP so duplicate packets are dropped."
    ],
    "correct_answer": "Require the client to send a unique 'Idempotency-Key' in the header; the server stores this key and returns the cached response if it sees the key again.",
    "explanation": "If a client submits a payment, doesn't get a response due to a network blip, and retries, the server uses the Idempotency Key to recognize the retry and safely return the original success message without charging the card twice."
  },
  {
    "test_id": sd_id,
    "question_text": "In a distributed consensus protocol like Raft or Paxos, what constitutes a 'Quorum'?",
    "options": [
      "A 100% agreement from all nodes in the cluster.",
      "The minimum number of nodes (usually a strict majority, (N/2)+1) that must acknowledge an operation for it to be considered committed.",
      "The specific node currently acting as the leader.",
      "A background thread that monitors node health."
    ],
    "correct_answer": "The minimum number of nodes (usually a strict majority, (N/2)+1) that must acknowledge an operation for it to be considered committed.",
    "explanation": "A quorum guarantees that even if a minority of nodes fail or are partitioned, the system can continue operating. Requiring a majority ensures that no two partitions can elect different leaders simultaneously (Split Brain)."
  },
  {
    "test_id": sd_id,
    "question_text": "Which technology is specifically optimized to act as a highly available, distributed, append-only commit log for streaming event data?",
    "options": ["Redis", "PostgreSQL", "Apache Kafka", "MongoDB"],
    "correct_answer": "Apache Kafka",
    "explanation": "Kafka is designed as a distributed commit log. Unlike traditional message queues that delete messages after reading, Kafka appends messages to disk, allowing consumers to process and replay massive streams of data at their own pace."
  },
  {
    "test_id": sd_id,
    "question_text": "When designing a large-scale chat application (like WhatsApp), how do you typically manage real-time message delivery from the server to the client?",
    "options": [
      "The client uses short HTTP polling every 1 second.",
      "The server pushes messages via long-lived WebSocket connections.",
      "The client queries a REST API using GraphQL.",
      "The server sends an SMS text message containing the data payload."
    ],
    "correct_answer": "The server pushes messages via long-lived WebSocket connections.",
    "explanation": "WebSockets provide full-duplex, persistent connections over a single TCP connection. This eliminates the overhead of constantly opening/closing HTTP connections (polling) and allows the server to instantly push messages to the client."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary trade-off of choosing a 'Log-Structured Merge-Tree' (LSM-Tree) over a 'B-Tree' for your database engine?",
    "options": [
      "LSM-Trees provide significantly faster read performance at the expense of very slow writes.",
      "LSM-Trees provide massive write throughput by appending data sequentially, but reads can be slower and require background compaction.",
      "LSM-Trees cannot handle range queries.",
      "LSM-Trees only work for in-memory databases."
    ],
    "correct_answer": "LSM-Trees provide massive write throughput by appending data sequentially, but reads can be slower and require background compaction.",
    "explanation": "LSM-Trees (used in Cassandra, RocksDB) buffer writes in memory and flush them sequentially to disk, making writes blazingly fast. Reads are slower because they might have to check multiple disk segments, which the database mitigates via Bloom Filters and Compaction."
  },
  {
    "test_id": sd_id,
    "question_text": "If you are designing a system to handle infinite scroll pagination on a dataset with billions of rows, why is 'Cursor-Based Pagination' preferred over 'Offset-Based Pagination' (LIMIT/OFFSET)?",
    "options": [
      "Offset pagination is not supported by SQL.",
      "Offset pagination forces the database to scan and discard all rows prior to the offset, causing performance to degrade as the page number increases.",
      "Cursor pagination automatically encrypts the payload.",
      "Cursor pagination allows users to easily jump to specific page numbers (e.g., Page 452)."
    ],
    "correct_answer": "Offset pagination forces the database to scan and discard all rows prior to the offset, causing performance to degrade as the page number increases.",
    "explanation": "Querying `OFFSET 1000000 LIMIT 10` requires the database to scan 1,000,010 rows and throw away the first million. Cursor pagination uses a specific marker (like `WHERE id > last_id LIMIT 10`), utilizing indexes for O(1) jump lookups."
  },
  {
    "test_id": sd_id,
    "question_text": "What is 'Gossip Protocol' commonly used for in distributed systems?",
    "options": [
      "For securely encrypting user passwords before database storage.",
      "For nodes in a decentralized cluster to quickly share state and detect failures by randomly pairing and exchanging information.",
      "For routing API requests based on geographic location.",
      "For compressing HTTP responses."
    ],
    "correct_answer": "For nodes in a decentralized cluster to quickly share state and detect failures by randomly pairing and exchanging information.",
    "explanation": "In systems without a central master (like Cassandra), nodes use gossip protocols to randomly share cluster metadata with a few peers every second. This information spreads exponentially, keeping the cluster in sync regarding which nodes are alive or dead."
  },
  {
    "test_id": sd_id,
    "question_text": "When building a distributed locking mechanism (to ensure only one instance of a cron job runs across 5 servers), which tool and pattern are most appropriate?",
    "options": [
      "Using a standard local OS Mutex.",
      "Using Redis with the 'Redlock' algorithm, or a consensus store like Zookeeper/etcd.",
      "Using an in-memory Hash Map on each server.",
      "Using Apache Kafka topics."
    ],
    "correct_answer": "Using Redis with the 'Redlock' algorithm, or a consensus store like Zookeeper/etcd.",
    "explanation": "Local locks only work on a single machine. Distributed locks require an external, highly available system. Zookeeper provides strong consistency for locking, while Redis provides faster but slightly less strictly consistent locking via Redlock."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary purpose of a CDN (Content Delivery Network)?",
    "options": [
      "To execute heavy machine learning algorithms on the edge.",
      "To store relational database tables closer to the user.",
      "To cache static assets (images, CSS, JS) at edge servers globally, reducing latency and offloading traffic from the origin server.",
      "To act as a primary DNS registrar."
    ],
    "correct_answer": "To cache static assets (images, CSS, JS) at edge servers globally, reducing latency and offloading traffic from the origin server.",
    "explanation": "CDNs place edge servers close to users. When a user in Tokyo requests an image, they download it from the Tokyo edge server rather than the origin server in New York, vastly reducing load times."
  },
  {
    "test_id": sd_id,
    "question_text": "In database sharding, what is a major vulnerability of 'Range-Based Sharding' (e.g., Shard A: Users A-F, Shard B: Users G-M)?",
    "options": [
      "It makes range queries impossible.",
      "It requires a massive amount of RAM on the proxy server.",
      "It often leads to 'Data Hotspots' if the traffic is not uniformly distributed across the ranges.",
      "It limits the database to a maximum of 4 shards."
    ],
    "correct_answer": "It often leads to 'Data Hotspots' if the traffic is not uniformly distributed across the ranges.",
    "explanation": "If you shard by timestamp, the shard containing 'Today's' data will receive 99% of the read/write traffic (a hotspot), while older shards sit idle. Hash-based sharding mitigates this by distributing data pseudo-randomly."
  },
  {
    "test_id": sd_id,
    "question_text": "Which design pattern is best suited for an application where clients need a continuous, unidirectional stream of updates from the server (e.g., live stock tickers), without needing bidirectional communication?",
    "options": [
      "GraphQL Mutations",
      "Server-Sent Events (SSE)",
      "SOAP",
      "REST POST requests"
    ],
    "correct_answer": "Server-Sent Events (SSE)",
    "explanation": "While WebSockets are bidirectional, SSE is specifically designed for unidirectional server-to-client streaming over standard HTTP. It is simpler to implement than WebSockets and natively supports auto-reconnection."
  },
  {
    "test_id": sd_id,
    "question_text": "What is 'Event Sourcing'?",
    "options": [
      "Sourcing hardware components for bare-metal servers.",
      "An architecture where state is stored as a sequence of state-changing events, rather than just storing the current state.",
      "Using a message broker exclusively to log error messages.",
      "A method of generating unique user IDs."
    ],
    "correct_answer": "An architecture where state is stored as a sequence of state-changing events, rather than just storing the current state.",
    "explanation": "Instead of storing the current account balance as $100, Event Sourcing stores the events: [Deposit $50, Deposit $70, Withdraw $20]. The current state is derived by replaying the events. It provides a perfect audit trail."
  },
  {
    "test_id": sd_id,
    "question_text": "In a distributed system, what does the 'Split-Brain' problem refer to?",
    "options": [
      "When a single developer writes conflicting microservices.",
      "When a network partition causes a cluster to divide into two disconnected halves, and both halves elect a leader and accept writes, causing data divergence.",
      "When a database query utilizes too much CPU, splitting processing power.",
      "When an API Gateway fails to route traffic."
    ],
    "correct_answer": "When a network partition causes a cluster to divide into two disconnected halves, and both halves elect a leader and accept writes, causing data divergence.",
    "explanation": "Split-brain is catastrophic for consistency. It is mitigated by requiring a strict Quorum (majority vote) for leader election. Since a partitioned network can only have one majority half, only one leader is elected."
  },
  {
    "test_id": sd_id,
    "question_text": "Why are standard Relational Databases (SQL) generally more difficult to horizontally scale compared to NoSQL databases?",
    "options": [
      "SQL databases do not support clustering.",
      "SQL databases are designed with strict ACID guarantees and complex JOIN operations, which are mathematically and computationally difficult to execute across distributed nodes.",
      "NoSQL databases are written in faster programming languages.",
      "SQL databases limit table size to 4GB."
    ],
    "correct_answer": "SQL databases are designed with strict ACID guarantees and complex JOIN operations, which are mathematically and computationally difficult to execute across distributed nodes.",
    "explanation": "To perform a JOIN on a horizontally sharded SQL database, the system must pull data across the network from multiple machines, completely killing performance. NoSQL avoids this by denormalizing data and avoiding joins."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary function of a 'Service Mesh' (like Istio) in a Kubernetes environment?",
    "options": [
      "To compile code into Docker containers.",
      "To replace the primary database.",
      "To abstract network communication between microservices, handling service discovery, load balancing, mutual TLS encryption, and observability.",
      "To provide a graphical UI for end-users."
    ],
    "correct_answer": "To abstract network communication between microservices, handling service discovery, load balancing, mutual TLS encryption, and observability.",
    "explanation": "A service mesh injects a 'sidecar' proxy next to every microservice. Instead of developers writing code to handle retries, timeouts, and encryption between services, the sidecar proxies handle all network complexities transparently."
  },
  {
    "test_id": sd_id,
    "question_text": "In a rate-limiting system, how does the 'Leaky Bucket' algorithm process traffic differently than the 'Token Bucket' algorithm?",
    "options": [
      "Leaky Bucket enforces a completely constant, smoothed outflow of requests regardless of bursty incoming traffic.",
      "Leaky Bucket allows sudden massive bursts of traffic.",
      "Leaky Bucket only tracks IP addresses, while Token Bucket tracks User IDs.",
      "There is no difference."
    ],
    "correct_answer": "Leaky Bucket enforces a completely constant, smoothed outflow of requests regardless of bursty incoming traffic.",
    "explanation": "Token bucket allows a burst of traffic up to the bucket's capacity. Leaky bucket acts like a queue with a fixed processing rate (a hole in the bottom). Incoming bursts fill the bucket, but requests only 'leak' out to the server at a strict, steady pace."
  },
  {
    "test_id": sd_id,
    "question_text": "When designing an image storage system like Instagram, what is the best practice for storing the actual image files?",
    "options": [
      "Store the raw binary image data directly inside a PostgreSQL database column.",
      "Store the images in an Object Storage service (like Amazon S3) and store the URL metadata in the database.",
      "Store the images inside the API Gateway's cache.",
      "Convert the images to JSON and store them in MongoDB."
    ],
    "correct_answer": "Store the images in an Object Storage service (like Amazon S3) and store the URL metadata in the database.",
    "explanation": "Relational databases are terrible at serving large binary files (BLOBs). The industry standard is to upload files to Object Storage, which is built for massive unstructured data, and save the resulting CDN URL in the database."
  },
  {
    "test_id": sd_id,
    "question_text": "What is the primary difference between Synchronous and Asynchronous database replication?",
    "options": [
      "Asynchronous replication prevents all data loss.",
      "Synchronous replication blocks the client's write until the replica acknowledges receipt, ensuring zero data loss but increasing latency.",
      "Synchronous replication only replicates primary keys.",
      "Asynchronous replication requires a Service Mesh."
    ],
    "correct_answer": "Synchronous replication blocks the client's write until the replica acknowledges receipt, ensuring zero data loss but increasing latency.",
    "explanation": "In sync replication, the master waits for the slave. If the master dies, the slave has the data. In async replication, the master replies 'success' to the client immediately and updates the slave in the background, risking data loss if the master dies before syncing."
  },
  {
    "test_id": sd_id,
    "question_text": "In MapReduce, what is the core responsibility of the 'Reduce' phase?",
    "options": [
      "To filter out NULL values from the database.",
      "To compress the physical file size of the data blocks.",
      "To take the grouped key-value pairs generated by the Map phase and aggregate them into a smaller set of values (e.g., summing totals).",
      "To map the IP addresses of the worker nodes."
    ],
    "correct_answer": "To take the grouped key-value pairs generated by the Map phase and aggregate them into a smaller set of values (e.g., summing totals).",
    "explanation": "The 'Map' function processes blocks of data to emit key-value pairs (e.g., word counts for a chunk of text). The framework shuffles these so all identical keys go to the same node. The 'Reduce' function then aggregates all values for a specific key into a final result."
  },
  {
    "test_id": oops_id,
    "question_text": "Which SOLID principle is violated if a subclass throws an 'UnsupportedOperationException' for a method it inherited from its superclass?",
    "options": [
      "Single Responsibility Principle",
      "Open-Closed Principle",
      "Liskov Substitution Principle",
      "Interface Segregation Principle"
    ],
    "correct_answer": "Liskov Substitution Principle",
    "explanation": "The Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program. Throwing an unexpected exception violates the superclass's contract."
  },
  {
    "test_id": oops_id,
    "question_text": "In languages like C++, what is 'Object Slicing'?",
    "options": [
      "When an object is divided into multiple smaller objects to save memory.",
      "When a derived class object is assigned to a base class variable by value, causing the derived-specific attributes to be lost.",
      "When a garbage collector reclaims only a portion of an object's memory.",
      "When multiple threads access different attributes of the same object simultaneously."
    ],
    "correct_answer": "When a derived class object is assigned to a base class variable by value, causing the derived-specific attributes to be lost.",
    "explanation": "Object slicing occurs when a subclass instance is passed or assigned by value to a base class variable. The compiler allocates only enough memory for the base class, 'slicing off' the subclass's extended state."
  },
  {
    "test_id": oops_id,
    "question_text": "How is 'Late Binding' (Dynamic Polymorphism) typically implemented under the hood by compilers?",
    "options": [
      "By using function overloading.",
      "By utilizing a Virtual Method Table (vtable) and a hidden pointer (vptr) in the object instance.",
      "By performing macro expansion during the preprocessing phase.",
      "By enforcing strict type checking at compile-time."
    ],
    "correct_answer": "By utilizing a Virtual Method Table (vtable) and a hidden pointer (vptr) in the object instance.",
    "explanation": "To resolve method calls at runtime, the compiler creates a vtable for the class containing function pointers. Each object gets a vptr pointing to this table, allowing the correct overridden method to be called."
  },
  {
    "test_id": oops_id,
    "question_text": "What is the primary difference between the State pattern and the Strategy pattern?",
    "options": [
      "Strategy is for object creation; State is for structural composition.",
      "State encapsulates context-dependent behavior and transitions itself, while Strategy encapsulates interchangeable algorithms chosen by the client.",
      "State uses inheritance; Strategy uses interfaces.",
      "There is no difference; they are different names for the exact same pattern."
    ],
    "correct_answer": "State encapsulates context-dependent behavior and transitions itself, while Strategy encapsulates interchangeable algorithms chosen by the client.",
    "explanation": "While structurally similar, their intents differ. Strategy allows a client to swap algorithms (like sorting methods). State allows an object to change its behavior when its internal state changes (like a vending machine), often handling its own transitions."
  },
  {
    "test_id": oops_id,
    "question_text": "What does the 'Law of Demeter' (Principle of Least Knowledge) strongly discourage?",
    "options": [
      "Using global variables in object-oriented systems.",
      "Chaining method calls through multiple objects, e.g., obj.getA().getB().doSomething().",
      "Implementing more than one interface per class.",
      "Using inheritance deeper than three levels."
    ],
    "correct_answer": "Chaining method calls through multiple objects, e.g., obj.getA().getB().doSomething().",
    "explanation": "The Law of Demeter states a module should not know about the inner workings of the objects it manipulates. Method chaining exposes the internal structure of dependencies, creating tight coupling."
  },
  {
    "test_id": oops_id,
    "question_text": "In the context of the Observer pattern, what is the difference between the 'Push' and 'Pull' models?",
    "options": [
      "Push forces updates synchronously; Pull allows asynchronous updates.",
      "Push sends the changed data with the notification; Pull sends only a notification, requiring the observer to fetch the data.",
      "Push is used in Java; Pull is used in C++.",
      "Push notifies all observers; Pull only notifies one specific observer."
    ],
    "correct_answer": "Push sends the changed data with the notification; Pull sends only a notification, requiring the observer to fetch the data.",
    "explanation": "In the Push model, the Subject sends the exact data that changed. In the Pull model, the Subject just says 'I changed', and the Observer must call getter methods on the Subject to retrieve what it needs."
  },
  {
    "test_id": oops_id,
    "question_text": "Which design pattern is most appropriate for implementing a multi-level Undo/Redo functionality?",
    "options": [
      "Observer Pattern",
      "Command Pattern",
      "Adapter Pattern",
      "Facade Pattern"
    ],
    "correct_answer": "Command Pattern",
    "explanation": "The Command pattern encapsulates a request as an object. By storing these command objects in a stack, you can easily implement Undo/Redo by popping the command and calling its specific 'undo()' method."
  },
  {
    "test_id": oops_id,
    "question_text": "What is 'Double Dispatch' and which design pattern heavily relies on it?",
    "options": [
      "Executing a method twice for redundancy; Strategy Pattern.",
      "Resolving a method call based on the runtime types of two objects; Visitor Pattern.",
      "Sending an event to two different listeners; Observer Pattern.",
      "Instantiating an object using two factory methods; Abstract Factory Pattern."
    ],
    "correct_answer": "Resolving a method call based on the runtime types of two objects; Visitor Pattern.",
    "explanation": "Most OOP languages support single dispatch (method resolution based on the receiver's type). The Visitor pattern simulates double dispatch, resolving the method based on both the Visitor's type and the Element's type."
  },
  {
    "test_id": oops_id,
    "question_text": "How does the 'Decorator' pattern dynamically alter an object's behavior without violating the Open-Closed Principle?",
    "options": [
      "By modifying the class's source code at runtime using reflection.",
      "By wrapping the original object inside a new object of a matching interface and adding behavior before/after delegating calls.",
      "By utilizing multiple inheritance to mix in new methods.",
      "By casting the object to a child class."
    ],
    "correct_answer": "By wrapping the original object inside a new object of a matching interface and adding behavior before/after delegating calls.",
    "explanation": "Decorators implement the same interface as the object they decorate. They hold a reference to the original object, add their own logic, and delegate the rest of the work, allowing behavior to be stacked infinitely at runtime."
  },
  {
    "test_id": oops_id,
    "question_text": "What is the primary architectural difference between a Factory Method and an Abstract Factory?",
    "options": [
      "Factory Method creates one type of object via inheritance; Abstract Factory creates families of related objects via composition.",
      "Factory Method uses static methods; Abstract Factory uses instance methods.",
      "Abstract Factory can only return interfaces; Factory Method returns concrete classes.",
      "There is no architectural difference."
    ],
    "correct_answer": "Factory Method creates one type of object via inheritance; Abstract Factory creates families of related objects via composition.",
    "explanation": "The Factory Method pattern relies on subclasses to instantiate a single product. The Abstract Factory pattern provides an interface to create entire families of related or dependent objects without specifying their concrete classes."
  },
  {
    "test_id": oops_id,
    "question_text": "What does 'Covariance' mean in the context of method overriding?",
    "options": [
      "An overridden method must throw broader exceptions than the base method.",
      "An overridden method can return a more derived (specific) type than the base method declared.",
      "An overridden method can accept parameters of a more generic type.",
      "An overridden method must have the exact same return type and parameters."
    ],
    "correct_answer": "An overridden method can return a more derived (specific) type than the base method declared.",
    "explanation": "Covariant return types allow a subclass overriding a method to return a narrower, more specific type. For example, if Animal.clone() returns an Animal, Dog.clone() can legally return a Dog."
  },
  {
    "test_id": oops_id,
    "question_text": "Which technique solves the 'Diamond Problem' in languages that support multiple inheritance, such as C++?",
    "options": [
      "Garbage Collection",
      "Virtual Inheritance",
      "Method Overloading",
      "Pointer Arithmetic"
    ],
    "correct_answer": "Virtual Inheritance",
    "explanation": "When Class B and C inherit from A, and D inherits from B and C, D gets two copies of A. Virtual inheritance ensures that only one shared instance of the base class A is inherited by D."
  },
  {
    "test_id": oops_id,
    "question_text": "What is 'Duck Typing' in dynamic object-oriented languages (like Python)?",
    "options": [
      "A security mechanism to prevent unauthorized method calls.",
      "A type system where an object's suitability is determined by the presence of certain methods and properties, rather than its actual inheritance type.",
      "A design pattern used for simulating multiple inheritance.",
      "A strict compile-time type checking system."
    ],
    "correct_answer": "A type system where an object's suitability is determined by the presence of certain methods and properties, rather than its actual inheritance type.",
    "explanation": "In duck typing, 'if it walks like a duck and quacks like a duck, it is a duck.' The code checks for the existence of methods/attributes at runtime rather than relying on strict class hierarchies."
  },
  {
    "test_id": oops_id,
    "question_text": "Why is the Singleton pattern often considered an anti-pattern in modern software engineering?",
    "options": [
      "It consumes too much heap memory.",
      "It introduces global state, hides dependencies, and makes unit testing incredibly difficult.",
      "It cannot be implemented in multithreaded environments.",
      "It forces the use of multiple inheritance."
    ],
    "correct_answer": "It introduces global state, hides dependencies, and makes unit testing incredibly difficult.",
    "explanation": "Singletons act like global variables. Because they control their own creation, you cannot easily mock them or inject them during testing, leading to tight coupling across the application."
  },
  {
    "test_id": oops_id,
    "question_text": "What is the primary intent of the 'Flyweight' design pattern?",
    "options": [
      "To provide a surrogate or placeholder for another object.",
      "To minimize memory usage by sharing as much data as possible with similar objects.",
      "To convert the interface of a class into another interface clients expect.",
      "To allow an object to alter its behavior when its internal state changes."
    ],
    "correct_answer": "To minimize memory usage by sharing as much data as possible with similar objects.",
    "explanation": "The Flyweight pattern splits object state into intrinsic (shared, immutable) and extrinsic (context-specific, mutable) state. Millions of objects can reference a single flyweight for their intrinsic data, saving massive amounts of RAM."
  },
  {
    "test_id": oops_id,
    "question_text": "Which principle does the 'Dependency Injection' (DI) pattern directly facilitate?",
    "options": [
      "Interface Segregation Principle",
      "Dependency Inversion Principle",
      "Liskov Substitution Principle",
      "Single Responsibility Principle"
    ],
    "correct_answer": "Dependency Inversion Principle",
    "explanation": "The Dependency Inversion Principle states high-level modules shouldn't depend on low-level modules; both should depend on abstractions. DI provides the mechanism to inject those abstract dependencies at runtime."
  },
  {
    "test_id": oops_id,
    "question_text": "What distinguishes an 'Abstract Class' from an 'Interface' in traditional OOP?",
    "options": [
      "Interfaces can have constructors; abstract classes cannot.",
      "Abstract classes can hold state (member variables) and provide default implementations; traditional interfaces define a strict contract with no state.",
      "Abstract classes can be instantiated directly; interfaces cannot.",
      "Interfaces support private methods; abstract classes do not."
    ],
    "correct_answer": "Abstract classes can hold state (member variables) and provide default implementations; traditional interfaces define a strict contract with no state.",
    "explanation": "While modern languages have blurred this line (e.g., default methods in Java interfaces), historically and conceptually, abstract classes allow you to share state and code, whereas interfaces only share method signatures."
  },
  {
    "test_id": oops_id,
    "question_text": "What does 'Method Shadowing' (or Method Hiding) mean?",
    "options": [
      "Making a method private so subclasses cannot see it.",
      "When a subclass defines a static method with the same signature as a static method in the superclass, hiding the superclass's version.",
      "When a method's implementation is entirely empty.",
      "Using an interface to hide the concrete implementation."
    ],
    "correct_answer": "When a subclass defines a static method with the same signature as a static method in the superclass, hiding the superclass's version.",
    "explanation": "Static methods cannot be overridden via polymorphism. If a subclass has a static method with the same name, it 'shadows' the parent's method. The method called depends strictly on the reference type, not the runtime object type."
  },
  {
    "test_id": oops_id,
    "question_text": "In the Prototype design pattern, what is the critical difference between a Shallow Copy and a Deep Copy?",
    "options": [
      "Shallow copy is faster but uses more memory.",
      "Shallow copy duplicates only primitives and references; Deep copy duplicates the actual objects those references point to.",
      "Shallow copy is used for singletons; Deep copy is used for prototypes.",
      "Shallow copy clones methods; Deep copy clones properties."
    ],
    "correct_answer": "Shallow copy duplicates only primitives and references; Deep copy duplicates the actual objects those references point to.",
    "explanation": "A shallow copy creates a new object but inserts references to the nested objects of the original. If you modify a nested object in the clone, the original changes too. A deep copy recursively clones everything."
  },
  {
    "test_id": oops_id,
    "question_text": "What problem does the 'Facade' design pattern solve?",
    "options": [
      "It limits the instantiation of a class to one object.",
      "It provides a simplified, higher-level unified interface to a complex subsystem of classes.",
      "It allows incompatible interfaces to work together.",
      "It dynamically adds responsibilities to an object."
    ],
    "correct_answer": "It provides a simplified, higher-level unified interface to a complex subsystem of classes.",
    "explanation": "If a system requires interacting with 10 different classes in a specific order (like initializing a video encoder), a Facade wraps all that complexity behind a single method call, making the system easier for clients to use."
  },
  {
    "test_id": oops_id,
    "question_text": "What is a 'Mixin' or 'Trait'?",
    "options": [
      "A class that contains a mix of private and public methods.",
      "A mechanism to provide methods to a class without using traditional inheritance, allowing code reuse across unrelated class hierarchies.",
      "A design pattern used for instantiating polymorphic objects.",
      "A garbage collection algorithm."
    ],
    "correct_answer": "A mechanism to provide methods to a class without using traditional inheritance, allowing code reuse across unrelated class hierarchies.",
    "explanation": "Mixins (or Traits in PHP/Scala) allow developers to 'include' specific behaviors into a class without forcing an 'is-a' inheritance relationship, safely bypassing the limitations of single inheritance."
  },
  {
    "test_id": oops_id,
    "question_text": "Which of the following is a classic violation of the Interface Segregation Principle (ISP)?",
    "options": [
      "A class implements an interface but leaves half of the methods empty because it doesn't need them.",
      "A class implements more than one interface.",
      "An interface extends another interface.",
      "A developer uses an abstract class instead of an interface."
    ],
    "correct_answer": "A class implements an interface but leaves half of the methods empty because it doesn't need them.",
    "explanation": "ISP states that clients should not be forced to depend on interfaces they do not use. If a class is implementing dummy methods, the interface is too 'fat' and should be split into smaller, more specific interfaces."
  },
  {
    "test_id": oops_id,
    "question_text": "What is the primary difference between the 'Adapter' pattern and the 'Proxy' pattern?",
    "options": [
      "Adapter creates new objects; Proxy destroys them.",
      "Adapter changes the interface of an object to match what the client expects; Proxy provides the same interface but controls access to the object.",
      "Adapter is a behavioral pattern; Proxy is a creational pattern.",
      "There is no difference; they are interchangeable."
    ],
    "correct_answer": "Adapter changes the interface of an object to match what the client expects; Proxy provides the same interface but controls access to the object.",
    "explanation": "An Adapter translates one interface into another (like a US-to-EU plug adapter). A Proxy maintains the exact same interface as the target but adds logic like lazy loading, caching, or security checks."
  },
  {
    "test_id": oops_id,
    "question_text": "In object-oriented design, what is 'Cohesion'?",
    "options": [
      "The degree of interdependence between different modules.",
      "The degree to which the elements inside a module belong together and focus on a single, well-defined task.",
      "The ability of an object to hide its internal state.",
      "The ability of a system to recover from a crash."
    ],
    "correct_answer": "The degree to which the elements inside a module belong together and focus on a single, well-defined task.",
    "explanation": "Good OOP design aims for High Cohesion (everything in a class is closely related to its primary purpose) and Low Coupling (classes don't heavily rely on the internal details of other classes)."
  },
  {
    "test_id": oops_id,
    "question_text": "Why would a developer declare a class as 'Final' (Java) or 'Sealed' (C#)?",
    "options": [
      "To prevent the class from being instantiated.",
      "To force all methods to be abstract.",
      "To prevent the class from being subclassed, ensuring its behavior cannot be maliciously or accidentally altered.",
      "To automatically make all its member variables static."
    ],
    "correct_answer": "To prevent the class from being subclassed, ensuring its behavior cannot be maliciously or accidentally altered.",
    "explanation": "Marking a class as final/sealed stops inheritance. This is often done for security (e.g., Java's String class) to guarantee that an object passed to a method is exactly the base type, not a hacked subclass."
  },
  {
    "test_id": oops_id,
    "question_text": "What is 'Static Polymorphism'?",
    "options": [
      "Polymorphism resolved at compile-time, typically achieved through Method Overloading or Templates/Generics.",
      "Polymorphism resolved at runtime using vtables.",
      "When a static variable is shared among subclasses.",
      "When a method signature cannot be changed."
    ],
    "correct_answer": "Polymorphism resolved at compile-time, typically achieved through Method Overloading or Templates/Generics.",
    "explanation": "Static (or early-bound) polymorphism occurs at compile time. The compiler knows exactly which method to call based on the method signatures (overloading) or type parameters (generics), requiring no runtime overhead."
  },
  {
    "test_id": oops_id,
    "question_text": "How does the 'Template Method' design pattern function?",
    "options": [
      "It uses C++ templates to create generic classes.",
      "It defines the skeleton of an algorithm in a base class but lets subclasses override specific steps without changing the algorithm's structure.",
      "It creates a template file for UI rendering.",
      "It forces subclasses to rewrite the entire algorithm from scratch."
    ],
    "correct_answer": "It defines the skeleton of an algorithm in a base class but lets subclasses override specific steps without changing the algorithm's structure.",
    "explanation": "The base class provides a 'template' method that calls other abstract methods in a specific sequence. Subclasses implement those abstract methods, customizing the steps while the base class controls the overall flow."
  },
  {
    "test_id": oops_id,
    "question_text": "What is the primary distinction between 'Encapsulation' and 'Abstraction'?",
    "options": [
      "Encapsulation hides the implementation details; Abstraction bundles data and methods together.",
      "Encapsulation bundles data and methods to protect state; Abstraction exposes only the essential features of an object, hiding background complexity.",
      "They are exactly the same concept.",
      "Encapsulation applies to variables; Abstraction applies to classes."
    ],
    "correct_answer": "Encapsulation bundles data and methods to protect state; Abstraction exposes only the essential features of an object, hiding background complexity.",
    "explanation": "Encapsulation is the mechanism (using private/public modifiers) to protect an object's integrity. Abstraction is the design level concept of simplifying complex reality by modeling classes appropriate to the problem."
  },
  {
    "test_id": oops_id,
    "question_text": "When implementing the 'Builder' pattern, what is the role of the 'Director' class?",
    "options": [
      "To instantiate the final object using the 'new' keyword.",
      "To manage a thread pool for object creation.",
      "To define the precise order in which the Builder's methods must be called to construct a complex object.",
      "To act as a garbage collector for incomplete builds."
    ],
    "correct_answer": "To define the precise order in which the Builder's methods must be called to construct a complex object.",
    "explanation": "While the Builder contains the actual implementation steps (e.g., buildWalls, buildRoof), the Director class executes those steps in a specific sequence, allowing the same Director to use different Builders to create varied representations."
  },
  {
    "test_id": oops_id,
    "question_text": "In memory management, what is a memory leak in the context of OOP, and how do modern languages prevent it?",
    "options": [
      "When objects are accidentally deleted; prevented by manual memory management.",
      "When objects are no longer needed but remain referenced, preventing the Garbage Collector from freeing the memory.",
      "When variables are declared without types; prevented by static typing.",
      "When the vtable gets too large; prevented by limiting inheritance depth."
    ],
    "correct_answer": "When objects are no longer needed but remain referenced, preventing the Garbage Collector from freeing the memory.",
    "explanation": "Even with Garbage Collection (GC) in Java or C#, if an unused object is still referenced by a live object (like an array or a static list), the GC cannot reclaim its memory, leading to an eventual OutOfMemoryError."
  },
  {
    "test_id": cn_id,
    "question_text": "In the TCP congestion control algorithm, what happens during the 'Slow Start' phase?",
    "options": [
      "The congestion window size increases linearly by 1 MSS (Maximum Segment Size) for every ACK received.",
      "The congestion window size increases exponentially, doubling every Round Trip Time (RTT).",
      "The sender waits for a timeout before sending any new packets.",
      "The receiver advertises a window size of zero to throttle the sender."
    ],
    "correct_answer": "The congestion window size increases exponentially, doubling every Round Trip Time (RTT).",
    "explanation": "Despite the name 'Slow Start', the congestion window actually grows exponentially. It starts small (e.g., 1 MSS) but doubles every RTT until it hits the slow-start threshold (ssthresh), at which point it switches to linear growth (Congestion Avoidance)."
  },
  {
    "test_id": cn_id,
    "question_text": "How many usable host IP addresses are available in a /23 IPv4 subnet?",
    "options": [
      "254",
      "510",
      "512",
      "1022"
    ],
    "correct_answer": "510",
    "explanation": "A /23 subnet leaves 9 bits for the host portion (32 - 23 = 9). 2^9 equals 512 total addresses. Subtracting 2 (one for the network address and one for the broadcast address) leaves 510 usable host addresses."
  },
  {
    "test_id": cn_id,
    "question_text": "Which routing protocol uses the Dijkstra algorithm to calculate the shortest path tree?",
    "options": [
      "RIP (Routing Information Protocol)",
      "BGP (Border Gateway Protocol)",
      "OSPF (Open Shortest Path First)",
      "EIGRP (Enhanced Interior Gateway Routing Protocol)"
    ],
    "correct_answer": "OSPF (Open Shortest Path First)",
    "explanation": "OSPF is a Link-State routing protocol. Every router constructs a complete topological map of the network and uses Dijkstra's Shortest Path First algorithm to independently calculate the best path to every destination."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the fundamental mechanism behind how 'Traceroute' discovers the path to a destination?",
    "options": [
      "It sends special routing table request packets to every router on the path.",
      "It manipulates the 'Time to Live' (TTL) field in IP packets and relies on ICMP 'Time Exceeded' messages.",
      "It establishes a TCP connection with every hop along the route.",
      "It uses DNS reverse lookups to trace the physical cables."
    ],
    "correct_answer": "It manipulates the 'Time to Live' (TTL) field in IP packets and relies on ICMP 'Time Exceeded' messages.",
    "explanation": "Traceroute sends packets with a TTL of 1, causing the first router to drop it and send back an ICMP error. It then sends TTL 2, hitting the second router, and so on, recording the IP of each router that responds."
  },
  {
    "test_id": cn_id,
    "question_text": "Why does HTTP/3 use QUIC over UDP instead of relying on traditional TCP?",
    "options": [
      "UDP is a reliable protocol that guarantees packet delivery natively.",
      "To eliminate the 'Head-of-Line Blocking' problem at the transport layer and reduce connection setup latency.",
      "UDP allows for larger MTU sizes than TCP, maximizing payload throughput.",
      "UDP is the only protocol supported by modern mobile networks."
    ],
    "correct_answer": "To eliminate the 'Head-of-Line Blocking' problem at the transport layer and reduce connection setup latency.",
    "explanation": "In TCP, if one packet is lost, the entire stream halts until it is retransmitted (Head-of-Line blocking). QUIC uses UDP to manage multiple independent streams; if a packet for Stream A drops, Stream B can continue processing unimpeded."
  },
  {
    "test_id": cn_id,
    "question_text": "In the context of the Domain Name System (DNS), what is a 'Recursive Query'?",
    "options": [
      "The client asks the DNS server to return the best answer it currently has in its cache, or a referral to another server.",
      "The DNS server takes full responsibility for resolving the domain name, querying root, TLD, and authoritative servers on behalf of the client.",
      "The DNS server continuously loops through a list of IP addresses until one responds.",
      "The client queries its own local host file before asking the DNS server."
    ],
    "correct_answer": "The DNS server takes full responsibility for resolving the domain name, querying root, TLD, and authoritative servers on behalf of the client.",
    "explanation": "In a recursive query, the burden is on the resolver. If the resolver doesn't know the IP, it recursively chases down the answer through the DNS hierarchy and returns the final IP to the client. Iterative queries just return referrals."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the primary difference between CSMA/CD (used in Ethernet) and CSMA/CA (used in Wi-Fi)?",
    "options": [
      "CSMA/CD prevents collisions before they happen; CSMA/CA detects them after they happen.",
      "CSMA/CD detects collisions and aborts transmission; CSMA/CA attempts to avoid collisions entirely using a randomized backoff and RTS/CTS frames.",
      "CSMA/CD is used for wireless networks; CSMA/CA is used for wired networks.",
      "There is no difference; CA and CD are interchangeable acronyms."
    ],
    "correct_answer": "CSMA/CD detects collisions and aborts transmission; CSMA/CA attempts to avoid collisions entirely using a randomized backoff and RTS/CTS frames.",
    "explanation": "In wired Ethernet (CD - Collision Detection), devices can listen while transmitting. In Wi-Fi, a radio cannot listen and transmit simultaneously, so it uses Collision Avoidance (CA) to minimize the chance of a collision occurring in the first place."
  },
  {
    "test_id": cn_id,
    "question_text": "During the termination of a TCP connection, why does the initiator enter a 'TIME_WAIT' state for typically 2 Maximum Segment Lifetimes (2MSL)?",
    "options": [
      "To wait for the application layer to save data to the disk.",
      "To ensure that the final ACK reaches the other side, and to allow any delayed, wandering packets in the network to expire before the port is reused.",
      "To keep the connection open just in case the user clicks 'refresh'.",
      "To perform cryptographic cleanup of the TLS session."
    ],
    "correct_answer": "To ensure that the final ACK reaches the other side, and to allow any delayed, wandering packets in the network to expire before the port is reused.",
    "explanation": "If the initiator reuses the same IP/Port immediately, an old, delayed packet from the previous session might arrive and corrupt the new session. TIME_WAIT ensures all old packets die in the network."
  },
  {
    "test_id": cn_id,
    "question_text": "Which of the following is a major simplification introduced in the IPv6 header compared to IPv4?",
    "options": [
      "IPv6 headers are variable length.",
      "IPv6 removes the header checksum and prevents routers from fragmenting packets.",
      "IPv6 integrates MAC addresses directly into the header.",
      "IPv6 eliminates the 'Hop Limit' (TTL) field."
    ],
    "correct_answer": "IPv6 removes the header checksum and prevents routers from fragmenting packets.",
    "explanation": "To speed up router processing, IPv6 relies on Layer 2 (Ethernet FCS) and Layer 4 (TCP/UDP checksums) for error checking. It also forces endpoints to do Path MTU Discovery, so routers no longer waste CPU fragmenting oversized packets."
  },
  {
    "test_id": cn_id,
    "question_text": "What sequence of messages is used by DHCP to dynamically assign an IP address to a client?",
    "options": [
      "SYN, SYN-ACK, ACK",
      "Discover, Offer, Request, Acknowledge (DORA)",
      "Request, Respond, Verify, Assign",
      "Solicit, Advertise, Request, Reply"
    ],
    "correct_answer": "Discover, Offer, Request, Acknowledge (DORA)",
    "explanation": "The DORA process: Client broadcasts a DISCOVER. Server replies with an OFFER. Client broadcasts a REQUEST for that offered IP. Server finalizes with an ACKNOWLEDGE."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the primary purpose of the 'Spanning Tree Protocol' (STP) in Layer 2 switching?",
    "options": [
      "To encrypt data traversing across multiple switches.",
      "To dynamically assign IP addresses to VLANs.",
      "To prevent broadcast storms and MAC table instability by disabling redundant links to create a loop-free logical topology.",
      "To aggregate multiple physical links into a single logical link for higher bandwidth."
    ],
    "correct_answer": "To prevent broadcast storms and MAC table instability by disabling redundant links to create a loop-free logical topology.",
    "explanation": "Because Layer 2 Ethernet frames have no TTL (Time To Live), a physical loop of switches will cause broadcast frames to circulate infinitely (a broadcast storm). STP intelligently blocks certain ports to break the loop."
  },
  {
    "test_id": cn_id,
    "question_text": "In a Network Address Translation (NAT) setup, how does 'PAT' (Port Address Translation / NAT Overload) differentiate between multiple internal devices sharing a single public IP?",
    "options": [
      "By using the internal MAC addresses.",
      "By altering the source TCP/UDP port numbers of the outgoing packets and keeping a translation table.",
      "By assigning a unique IPv6 address to each device.",
      "By using HTTP cookies."
    ],
    "correct_answer": "By altering the source TCP/UDP port numbers of the outgoing packets and keeping a translation table.",
    "explanation": "When device A and device B both talk to the internet, PAT translates their internal IPs to the same public IP but assigns them different random source ports (e.g., 50001 and 50002). When replies return to those ports, PAT routes them back to the correct internal device."
  },
  {
    "test_id": cn_id,
    "question_text": "Which of the following best describes the 'Hidden Node Problem' in wireless networks?",
    "options": [
      "A wireless router hides its SSID, preventing devices from connecting.",
      "Node A and Node C can both communicate with Node B, but cannot hear each other, causing them to transmit simultaneously and collide at Node B.",
      "A device's MAC address is spoofed, hiding its true identity.",
      "Physical obstacles like concrete walls completely block RF signals."
    ],
    "correct_answer": "Node A and Node C can both communicate with Node B, but cannot hear each other, causing them to transmit simultaneously and collide at Node B.",
    "explanation": "Because A cannot hear C, standard CSMA/CA fails (they both think the channel is clear). This is solved by using RTS/CTS (Request To Send / Clear To Send) handshakes with the central access point."
  },
  {
    "test_id": cn_id,
    "question_text": "How does 802.1Q implement VLANs on a network switch?",
    "options": [
      "By physically isolating ports on different motherboards.",
      "By inserting a 4-byte tag into the Layer 2 Ethernet frame header containing the VLAN ID.",
      "By encapsulating the entire Ethernet frame inside an IPsec tunnel.",
      "By changing the destination MAC address to a VLAN-specific address."
    ],
    "correct_answer": "By inserting a 4-byte tag into the Layer 2 Ethernet frame header containing the VLAN ID.",
    "explanation": "The 802.1Q standard modifies the standard Ethernet frame by inserting a 32-bit tag between the Source MAC and the EtherType fields. This tag contains a 12-bit VLAN Identifier (VID), allowing up to 4,094 distinct VLANs."
  },
  {
    "test_id": cn_id,
    "question_text": "What triggers a 'TCP Fast Retransmit'?",
    "options": [
      "The expiration of the Retransmission Timeout (RTO) timer.",
      "The reception of 3 duplicate Acknowledgements (ACKs) for the same sequence number.",
      "The receiver sending a zero window size.",
      "An ICMP 'Destination Unreachable' message."
    ],
    "correct_answer": "The reception of 3 duplicate Acknowledgements (ACKs) for the same sequence number.",
    "explanation": "If a sender receives 3 duplicate ACKs, it strongly indicates that a specific segment was lost in transit but subsequent segments arrived successfully. Instead of waiting for a slow timeout, the sender immediately retransmits the missing segment."
  },
  {
    "test_id": cn_id,
    "question_text": "In IPsec, what is the fundamental difference between 'Transport Mode' and 'Tunnel Mode'?",
    "options": [
      "Transport mode encrypts only the payload; Tunnel mode encrypts the entire original IP packet and adds a new IP header.",
      "Transport mode is used for UDP; Tunnel mode is used for TCP.",
      "Transport mode does not use encryption; Tunnel mode uses AES-256.",
      "Transport mode is only supported in IPv6."
    ],
    "correct_answer": "Transport mode encrypts only the payload; Tunnel mode encrypts the entire original IP packet and adds a new IP header.",
    "explanation": "Transport mode (typically used for end-to-end communication) retains the original IP header. Tunnel mode (used for Site-to-Site VPNs) encapsulates the entire original packet inside a new IP packet, hiding the original source and destination."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the primary role of the 'TLS/SSL Handshake' at the beginning of an HTTPS connection?",
    "options": [
      "To negotiate HTTP/2 multiplexing streams.",
      "To use asymmetric cryptography (public/private keys) to securely exchange a symmetric session key for bulk data encryption.",
      "To bypass firewall rules on port 443.",
      "To download the website's HTML payload securely."
    ],
    "correct_answer": "To use asymmetric cryptography (public/private keys) to securely exchange a symmetric session key for bulk data encryption.",
    "explanation": "Asymmetric encryption (RSA/ECC) is too slow for bulk data transfer. The handshake uses asymmetric math to authenticate the server and securely agree on a fast symmetric key (like AES) that will be used for the rest of the session."
  },
  {
    "test_id": cn_id,
    "question_text": "What does 'Anycast' routing achieve on the Internet?",
    "options": [
      "It sends a single packet to all hosts on a specific subnet.",
      "It allows multiple globally distributed servers to share the exact same IP address, routing a user's request to the topologically closest server.",
      "It randomly selects a destination IP to avoid DDoS attacks.",
      "It forces a packet to traverse every autonomous system on its way to the destination."
    ],
    "correct_answer": "It allows multiple globally distributed servers to share the exact same IP address, routing a user's request to the topologically closest server.",
    "explanation": "Anycast is heavily used by CDNs and Root DNS servers. Because multiple routers advertise the same IP via BGP, the internet's routing tables naturally direct the client's packet to the nearest geographic/network location announcing that IP."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the purpose of the 'Window Size' field in a TCP header?",
    "options": [
      "To specify the MTU size of the physical link.",
      "To indicate how many bytes the receiver is currently willing to accept, enabling Flow Control.",
      "To determine how long a packet can remain in the network before being dropped.",
      "To declare the cryptographic key size for the session."
    ],
    "correct_answer": "To indicate how many bytes the receiver is currently willing to accept, enabling Flow Control.",
    "explanation": "Flow control prevents a fast sender from overwhelming a slow receiver. The receiver advertises its available buffer space in the Window Size field. If the buffer is full, it advertises a 'Zero Window', forcing the sender to pause."
  },
  {
    "test_id": cn_id,
    "question_text": "In BGP (Border Gateway Protocol), what is the 'Split Horizon' rule used for within an AS (IBGP)?",
    "options": [
      "To prevent a router from advertising a route back to the peer it learned it from.",
      "To split traffic evenly across multiple ISPs.",
      "To ensure that a route learned from one IBGP peer is not advertised to another IBGP peer, preventing routing loops within the AS.",
      "To divide a massive routing table into smaller, manageable chunks."
    ],
    "correct_answer": "To ensure that a route learned from one IBGP peer is not advertised to another IBGP peer, preventing routing loops within the AS.",
    "explanation": "Because IBGP does not prepend AS numbers (the standard BGP loop prevention mechanism), the split horizon rule dictates that IBGP peers must be fully meshed, or they must use 'Route Reflectors' to safely propagate routes."
  },
  {
    "test_id": cn_id,
    "question_text": "What constitutes a MAC (Media Access Control) address?",
    "options": [
      "A 32-bit address logically assigned by DHCP.",
      "A 48-bit physical address where the first 24 bits are an OUI (Organizationally Unique Identifier) assigned to the manufacturer.",
      "A 128-bit address designed to replace IPv4.",
      "A dynamic address that changes every time a device connects to a new Wi-Fi network."
    ],
    "correct_answer": "A 48-bit physical address where the first 24 bits are an OUI (Organizationally Unique Identifier) assigned to the manufacturer.",
    "explanation": "MAC addresses are burnt into the hardware (NIC). They are 48 bits long (expressed as 6 hex pairs). The IEEE assigns the first half (OUI) to vendors like Apple or Intel, and the vendor assigns the second half to ensure global uniqueness."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the purpose of an 'Ephemeral Port'?",
    "options": [
      "It is a well-known port reserved for root processes (e.g., Port 80).",
      "It is a temporary, short-lived port automatically assigned by the client's OS to be used as the source port for an outbound connection.",
      "It is a port used exclusively for ICMP traffic.",
      "It is a port used by firewalls to drop malicious packets."
    ],
    "correct_answer": "It is a temporary, short-lived port automatically assigned by the client's OS to be used as the source port for an outbound connection.",
    "explanation": "When your browser connects to a server on port 443, it needs a source port to receive the reply. The OS dynamically assigns an ephemeral (temporary) high-numbered port (e.g., 52041) for this specific connection."
  },
  {
    "test_id": cn_id,
    "question_text": "Which of the following best describes 'Statistical Time Division Multiplexing' (STDM)?",
    "options": [
      "It assigns fixed time slots to all users, even if they have no data to send.",
      "It dynamically allocates time slots only to active users who actually have data to transmit, improving bandwidth efficiency.",
      "It transmits different signals simultaneously using different frequencies of light.",
      "It compresses data using statistical algorithms before transmission."
    ],
    "correct_answer": "It dynamically allocates time slots only to active users who actually have data to transmit, improving bandwidth efficiency.",
    "explanation": "Unlike standard TDM which wastes bandwidth on idle channels by rigidly assigning time slots, STDM allocates slots on demand. This allows more devices to share the medium since it is statistically unlikely all devices will transmit simultaneously."
  },
  {
    "test_id": cn_id,
    "question_text": "How does 'Path MTU Discovery' avoid IP fragmentation?",
    "options": [
      "By setting the 'Don't Fragment' (DF) bit in the IP header and adjusting the packet size if it receives an ICMP 'Fragmentation Needed' response.",
      "By sending a tiny 1-byte packet first to test the line.",
      "By querying the BGP routing table for the maximum frame size.",
      "By encapsulating the packet in an IPv6 tunnel."
    ],
    "correct_answer": "By setting the 'Don't Fragment' (DF) bit in the IP header and adjusting the packet size if it receives an ICMP 'Fragmentation Needed' response.",
    "explanation": "Fragmentation at routers is CPU-intensive. PMTUD sets the DF bit. If a packet hits a router with a smaller MTU link, the router drops it and sends back an ICMP error containing the acceptable MTU size, allowing the sender to adjust."
  },
  {
    "test_id": cn_id,
    "question_text": "Why does the UDP protocol include a 'Pseudo-Header' when calculating its checksum?",
    "options": [
      "To encrypt the payload data.",
      "To verify that the packet reached the correct destination IP and Protocol, ensuring the packet wasn't misrouted by a lower layer.",
      "To pad the packet out to a minimum 64-byte frame size.",
      "To track the sequence number of the datagram."
    ],
    "correct_answer": "To verify that the packet reached the correct destination IP and Protocol, ensuring the packet wasn't misrouted by a lower layer.",
    "explanation": "UDP itself only tracks ports. The pseudo-header temporarily pulls the Source IP, Destination IP, and Protocol number from the IPv4 header to calculate the checksum, guaranteeing the packet arrived at the correct host, not just the correct port."
  },
  {
    "test_id": cn_id,
    "question_text": "What is 'Promiscuous Mode' on a Network Interface Card (NIC)?",
    "options": [
      "A mode that allows the NIC to connect to any open Wi-Fi network automatically.",
      "A state where the NIC passes all received traffic to the CPU, regardless of whether the destination MAC address matches its own.",
      "A configuration that allows the NIC to bypass the firewall.",
      "A mode used to dynamically change the MAC address to avoid tracking."
    ],
    "correct_answer": "A state where the NIC passes all received traffic to the CPU, regardless of whether the destination MAC address matches its own.",
    "explanation": "Normally, a NIC drops Ethernet frames not addressed to its specific MAC address or the broadcast address. In promiscuous mode (used by packet sniffers like Wireshark), it captures and reads everything on the wire."
  },
  {
    "test_id": cn_id,
    "question_text": "In Software-Defined Networking (SDN), what is the primary architectural shift?",
    "options": [
      "Replacing all copper cables with fiber optics.",
      "Decoupling the Control Plane (routing logic) from the Data Plane (forwarding packets), centralizing the control plane in an SDN Controller.",
      "Moving all local switches into the cloud.",
      "Replacing IPv4 with IPv6 globally."
    ],
    "correct_answer": "Decoupling the Control Plane (routing logic) from the Data Plane (forwarding packets), centralizing the control plane in an SDN Controller.",
    "explanation": "Traditional routers are autonomous; they calculate routes (control) and forward packets (data). SDN extracts the 'brain' (control plane) to a centralized server, leaving the physical switches to simply follow instructions (data plane)."
  },
  {
    "test_id": cn_id,
    "question_text": "Which BGP attribute is evaluated FIRST when a router is determining the best path to a destination?",
    "options": [
      "MED (Multi-Exit Discriminator)",
      "AS-Path Length",
      "Local Preference",
      "Weight (Cisco Proprietary)"
    ],
    "correct_answer": "Weight (Cisco Proprietary)",
    "explanation": "The BGP best-path selection algorithm evaluates attributes in a strict order. Assuming a Cisco environment, 'Weight' is evaluated first (locally significant). If weights are equal, 'Local Preference' is evaluated second, followed by 'Locally originated', then 'AS-Path length'."
  },
  {
    "test_id": cn_id,
    "question_text": "What is the primary function of the ARP protocol?",
    "options": [
      "To resolve a fully qualified domain name (FQDN) into an IPv4 address.",
      "To map a known logical Layer 3 IP address to an unknown physical Layer 2 MAC address on the local subnet.",
      "To assign dynamic IP addresses to hosts.",
      "To route packets between different autonomous systems."
    ],
    "correct_answer": "To map a known logical Layer 3 IP address to an unknown physical Layer 2 MAC address on the local subnet.",
    "explanation": "When a computer wants to send an IP packet to a local device, it must encapsulate it in an Ethernet frame. ARP broadcasts a 'Who has this IP?' message to the local subnet to discover the target's MAC address."
  },
  {
    "test_id": cn_id,
    "question_text": "What happens if a TCP sender receives a 'Zero Window' advertisement from the receiver, and how does the sender recover?",
    "options": [
      "The sender terminates the connection immediately using a RST packet.",
      "The sender pauses data transmission and periodically sends 'Zero Window Probes' to check if the receiver's buffer has cleared.",
      "The sender switches to UDP to bypass the full buffer.",
      "The sender halves its congestion window and retransmits everything."
    ],
    "correct_answer": "The sender pauses data transmission and periodically sends 'Zero Window Probes' to check if the receiver's buffer has cleared.",
    "explanation": "A zero window means the receiver's application is processing data too slowly and its buffer is full. The sender stops sending payload data but sends tiny 1-byte probe packets to force the receiver to reply with an updated window size."
  },
  {
    "test_id": os_id,
    "question_text": "What does the term 'Thrashing' refer to in the context of operating systems?",
    "options": [
      "When a CPU is stuck in an infinite loop.",
      "When the OS spends more time paging data in and out of memory than executing actual processes.",
      "When multiple threads compete for the same database row.",
      "When a hard drive's read/write head gets physically damaged."
    ],
    "correct_answer": "When the OS spends more time paging data in and out of memory than executing actual processes.",
    "explanation": "Thrashing occurs when virtual memory is overused. The system constantly swaps pages between RAM and the disk, causing CPU utilization to plummet because it is constantly waiting on disk I/O."
  },
  {
    "test_id": os_id,
    "question_text": "What is the key difference between a Mutex and a Binary Semaphore?",
    "options": [
      "A Mutex can be unlocked by any thread, while a Semaphore can only be unlocked by the thread that locked it.",
      "A Mutex implies ownership and can only be unlocked by the thread that acquired it, whereas a Semaphore is a signaling mechanism.",
      "A Semaphore can hold a string value, while a Mutex is strictly boolean.",
      "There is no difference; they are synonymous."
    ],
    "correct_answer": "A Mutex implies ownership and can only be unlocked by the thread that acquired it, whereas a Semaphore is a signaling mechanism.",
    "explanation": "Mutexes are used for locking resources (ownership). Semaphores are used for signaling across threads (e.g., Thread A finishes a task and signals Thread B to start). A thread can 'release' a semaphore it didn't acquire, but it cannot unlock a mutex it doesn't own."
  },
  {
    "test_id": os_id,
    "question_text": "What is a 'Zombie Process' in a Unix/Linux system?",
    "options": [
      "A process that has finished execution but still has an entry in the process table because its parent hasn't read its exit status.",
      "A malicious background process installed by a virus.",
      "A process whose parent has terminated, so it is adopted by the 'init' process.",
      "A process that consumes 100% of the CPU and refuses to die."
    ],
    "correct_answer": "A process that has finished execution but still has an entry in the process table because its parent hasn't read its exit status.",
    "explanation": "When a child process ends, it becomes a zombie until the parent calls wait() to read its exit status. If a parent dies without waiting, the child becomes an 'Orphan', not a zombie."
  },
  {
    "test_id": os_id,
    "question_text": "What is the purpose of a Translation Lookaside Buffer (TLB)?",
    "options": [
      "To buffer network packets before they are processed by the CPU.",
      "To act as a hardware cache for the page table, speeding up the translation of virtual addresses to physical addresses.",
      "To translate high-level code into machine code.",
      "To store graphics rendering instructions for the GPU."
    ],
    "correct_answer": "To act as a hardware cache for the page table, speeding up the translation of virtual addresses to physical addresses.",
    "explanation": "Without a TLB, every memory access would require two physical memory accesses: one to read the page table in RAM, and one to read the actual data. The TLB caches recent translations directly in the CPU, making memory access exponentially faster."
  },
  {
    "test_id": os_id,
    "question_text": "What is 'Priority Inversion' in real-time operating systems?",
    "options": [
      "When the OS automatically lowers the priority of CPU-hogging tasks.",
      "When a high-priority task is blocked waiting on a resource held by a lower-priority task, and a medium-priority task preempts the low-priority task.",
      "When a user manually changes a background task to real-time priority.",
      "When child threads execute before the main parent thread."
    ],
    "correct_answer": "When a high-priority task is blocked waiting on a resource held by a lower-priority task, and a medium-priority task preempts the low-priority task.",
    "explanation": "This dangerous scenario means the high-priority task is effectively waiting on the medium-priority task. This is solved using 'Priority Inheritance', where the low-priority task temporarily inherits the high priority until it releases the lock."
  },
  {
    "test_id": os_id,
    "question_text": "Which page replacement algorithm explicitly suffers from Belady's Anomaly?",
    "options": [
      "Least Recently Used (LRU)",
      "Optimal Page Replacement",
      "First-In, First-Out (FIFO)",
      "Clock/Second Chance"
    ],
    "correct_answer": "First-In, First-Out (FIFO)",
    "explanation": "Belady's Anomaly is a counter-intuitive phenomenon where increasing the number of physical page frames actually increases the number of page faults. FIFO suffers from this, while stack-based algorithms like LRU do not."
  },
  {
    "test_id": os_id,
    "question_text": "In the context of deadlock handling, what is the primary purpose of the Banker's Algorithm?",
    "options": [
      "Deadlock Detection",
      "Deadlock Prevention",
      "Deadlock Avoidance",
      "Deadlock Recovery"
    ],
    "correct_answer": "Deadlock Avoidance",
    "explanation": "The Banker's Algorithm simulates resource allocation before actually granting a request. It only allocates resources if it guarantees the system remains in a 'safe state', thereby avoiding deadlock entirely."
  },
  {
    "test_id": os_id,
    "question_text": "If a C program executes the fork() system call three times sequentially in the main function, how many total processes (including the original) will be running?",
    "options": [
      "3",
      "4",
      "7",
      "8"
    ],
    "correct_answer": "8",
    "explanation": "Each fork() doubles the number of processes. After the first fork, there are 2. After the second, there are 4. After the third, there are 2^3 = 8 total processes."
  },
  {
    "test_id": os_id,
    "question_text": "What typically happens to the Translation Lookaside Buffer (TLB) during a Context Switch between two different processes?",
    "options": [
      "It is backed up to the hard drive.",
      "It is flushed (cleared), unless the CPU supports Address Space IDentifiers (ASIDs).",
      "It remains unchanged and valid for the new process.",
      "It is expanded to hold both processes' page tables."
    ],
    "correct_answer": "It is flushed (cleared), unless the CPU supports Address Space IDentifiers (ASIDs).",
    "explanation": "Because different processes use the same virtual addresses to point to different physical addresses, the old TLB entries are invalid for the new process. Flushing the TLB causes a performance hit (TLB misses) immediately after a context switch."
  },
  {
    "test_id": os_id,
    "question_text": "In a Unix file system, what happens when you create a 'Hard Link' to a file?",
    "options": [
      "A new inode is created pointing to the same data blocks.",
      "A new directory entry is created that points to the exact same inode as the original file.",
      "A shortcut file is created containing the textual path to the original file.",
      "The file is copied to a new sector on the disk."
    ],
    "correct_answer": "A new directory entry is created that points to the exact same inode as the original file.",
    "explanation": "A hard link is simply an additional name for an existing inode. The inode's reference count increments. The file data is only deleted from disk when all hard links (names) are removed and the count reaches zero."
  },
  {
    "test_id": os_id,
    "question_text": "What is the primary trade-off of increasing the Page Size in a virtual memory system?",
    "options": [
      "It decreases internal fragmentation but increases page table size.",
      "It increases internal fragmentation but decreases the page table size.",
      "It eliminates page faults entirely but requires more CPU cache.",
      "It speeds up CPU clock cycles but slows down RAM."
    ],
    "correct_answer": "It increases internal fragmentation but decreases the page table size.",
    "explanation": "A larger page size means fewer pages are needed to cover the address space, dramatically shrinking the page table. However, if a process only needs 1KB of memory but the page size is 4MB, the remaining 3.99MB is wasted (internal fragmentation)."
  },
  {
    "test_id": os_id,
    "question_text": "What underlying data structure is utilized by the Linux Completely Fair Scheduler (CFS) to track and schedule tasks?",
    "options": [
      "A standard FIFO Queue",
      "A Hash Map",
      "A Red-Black Tree",
      "A Max-Heap"
    ],
    "correct_answer": "A Red-Black Tree",
    "explanation": "CFS models scheduling around 'virtual runtime'. It uses a Red-Black Tree to order tasks, where the leftmost node always contains the task with the least virtual runtime, ensuring O(1) lookup for the next task and O(log N) insertion."
  },
  {
    "test_id": os_id,
    "question_text": "In what specific scenario is a 'Spinlock' heavily preferred over a standard Mutex?",
    "options": [
      "On a single-core processor.",
      "When the critical section takes a very long time to execute.",
      "On a multi-core processor when the critical section is extremely short.",
      "When the lock needs to be shared across a network."
    ],
    "correct_answer": "On a multi-core processor when the critical section is extremely short.",
    "explanation": "A mutex puts a blocked thread to sleep (involving an expensive context switch). A spinlock keeps the thread actively looping ('spinning') on the CPU. If the lock is held for just a few microseconds, spinning is much faster than context switching."
  },
  {
    "test_id": os_id,
    "question_text": "What is the core difference between a Thread Control Block (TCB) and a Process Control Block (PCB)?",
    "options": [
      "The TCB contains the Heap and Data segments, while the PCB contains only the Registers.",
      "The PCB is shared among threads of the same process, while each thread has its own TCB containing its Program Counter, Registers, and Stack.",
      "The TCB is managed by the hardware, while the PCB is managed by the OS.",
      "There is no difference; they are interchangeable terms."
    ],
    "correct_answer": "The PCB is shared among threads of the same process, while each thread has its own TCB containing its Program Counter, Registers, and Stack.",
    "explanation": "Threads share their parent process's memory (code, data, heap) managed by the PCB. However, to execute independently, each thread must have its own registers, program counter, and stack, which are stored in the TCB."
  },
  {
    "test_id": os_id,
    "question_text": "When a page fault occurs in demand paging, what is the exact sequence of events?",
    "options": [
      "CPU Traps to OS -> OS finds a free frame -> Disk Read Scheduled -> Page Table Updated -> Instruction Restarted",
      "OS allocates RAM -> CPU fetches from disk -> Instruction is skipped -> Page Table Updated",
      "CPU aborts the program -> OS writes memory to disk -> Program restarts",
      "Disk writes to CPU Cache -> OS maps virtual address -> Execution continues"
    ],
    "correct_answer": "CPU Traps to OS -> OS finds a free frame -> Disk Read Scheduled -> Page Table Updated -> Instruction Restarted",
    "explanation": "A page fault is a synchronous trap. The OS takes control, pages the missing data in from the disk (swap space) to physical RAM, updates the MMU's page table, and then rewinds the CPU to restart the exact instruction that caused the fault."
  },
  {
    "test_id": os_id,
    "question_text": "In the Readers-Writers problem, what happens if the system is designed to heavily favor Readers?",
    "options": [
      "Deadlock is guaranteed to occur.",
      "Writers may suffer from starvation if new readers continuously arrive.",
      "Readers will eventually overwrite each other's data.",
      "The database will become corrupted."
    ],
    "correct_answer": "Writers may suffer from starvation if new readers continuously arrive.",
    "explanation": "If the rule is 'no reader should wait if a reader is currently reading', a constant stream of new readers can perpetually hold the read lock. A waiting writer will starve, never gaining the exclusive access it requires."
  },
  {
    "test_id": os_id,
    "question_text": "What is the primary advantage of Memory-Mapped Files (mmap) over standard read/write system calls?",
    "options": [
      "It encrypts the file automatically on the disk.",
      "It maps the file's blocks directly into the process's virtual address space, allowing file I/O to be performed via simple pointer manipulation while avoiding double-copying data.",
      "It prevents other processes from ever accessing the file.",
      "It compresses the file to save RAM."
    ],
    "correct_answer": "It maps the file's blocks directly into the process's virtual address space, allowing file I/O to be performed via simple pointer manipulation while avoiding double-copying data.",
    "explanation": "Standard I/O copies data from disk to kernel space, then to user space. mmap leverages the OS's virtual memory system to map disk pages directly into user space, vastly speeding up file access for large files."
  },
  {
    "test_id": os_id,
    "question_text": "What is the defining characteristic of a Microkernel architecture (like Mach or QNX) compared to a Monolithic Kernel (like Linux)?",
    "options": [
      "A microkernel runs all services in kernel space for maximum speed.",
      "A microkernel is just a smaller file size than a monolithic kernel.",
      "A microkernel strips out everything except IPC, basic scheduling, and memory management, moving drivers and file systems to user space.",
      "A microkernel cannot support multi-threading."
    ],
    "correct_answer": "A microkernel strips out everything except IPC, basic scheduling, and memory management, moving drivers and file systems to user space.",
    "explanation": "Microkernels are highly stable and secure because if a user-space file system or driver crashes, it doesn't crash the entire OS. The tradeoff is reduced performance due to the constant IPC message passing between user and kernel space."
  },
  {
    "test_id": os_id,
    "question_text": "In disk scheduling, what is the primary advantage of the C-SCAN (Circular SCAN) algorithm over the traditional SCAN (Elevator) algorithm?",
    "options": [
      "C-SCAN is significantly easier to code in C.",
      "C-SCAN provides a more uniform wait time by treating the cylinders as a circular list, returning to the beginning without servicing requests on the reverse trip.",
      "C-SCAN stops the disk from spinning to save power.",
      "C-SCAN services requests purely in First-Come, First-Served order."
    ],
    "correct_answer": "C-SCAN provides a more uniform wait time by treating the cylinders as a circular list, returning to the beginning without servicing requests on the reverse trip.",
    "explanation": "In standard SCAN, requests at the edges of the disk wait a very long time because the head sweeps back and forth. C-SCAN sweeps in one direction, then immediately jumps back to zero without reading, ensuring more consistent latency for all tracks."
  },
  {
    "test_id": os_id,
    "question_text": "What is the primary role of a Direct Memory Access (DMA) controller?",
    "options": [
      "To securely erase memory pages before reallocating them.",
      "To allow I/O devices to transfer large blocks of data directly to/from main memory without heavily involving the CPU, sending an interrupt only when the transfer is complete.",
      "To map virtual addresses to physical hardware addresses.",
      "To act as a firewall between RAM and the network card."
    ],
    "correct_answer": "To allow I/O devices to transfer large blocks of data directly to/from main memory without heavily involving the CPU, sending an interrupt only when the transfer is complete.",
    "explanation": "Without DMA (Programmed I/O), the CPU must manually read every byte from an I/O device and write it to RAM, wasting millions of clock cycles. DMA handles the transfer autonomously, freeing the CPU to execute other tasks."
  },
  {
    "test_id": os_id,
    "question_text": "Which of the following is NOT one of the four Coffman conditions necessary for a Deadlock to occur?",
    "options": [
      "Mutual Exclusion",
      "Hold and Wait",
      "No Preemption",
      "Context Switching"
    ],
    "correct_answer": "Context Switching",
    "explanation": "Deadlocks require exactly four conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Context switching is a standard OS operation, not a condition for deadlock."
  },
  {
    "test_id": os_id,
    "question_text": "In the context of the exec() family of system calls in Unix, what happens to the calling process?",
    "options": [
      "A new child process is spawned to run the new program.",
      "The calling process is moved to the background.",
      "The calling process's current memory image is completely replaced with the new program, but the PID remains the exact same.",
      "The calling process terminates and returns control to the shell."
    ],
    "correct_answer": "The calling process's current memory image is completely replaced with the new program, but the PID remains the exact same.",
    "explanation": "Unlike fork(), which clones a process, exec() overwrites the existing process with a brand new executable. It does not return (unless it fails), but it keeps the same Process ID and file descriptors."
  },
  {
    "test_id": os_id,
    "question_text": "What is the purpose of the 'Working Set Model' in memory management?",
    "options": [
      "To define the maximum amount of RAM the OS can address.",
      "To track the set of pages a process has actively referenced in a recent time window, ensuring those pages remain in RAM to prevent thrashing.",
      "To determine how many threads a process is currently working with.",
      "To flush dirty pages to the disk."
    ],
    "correct_answer": "To track the set of pages a process has actively referenced in a recent time window, ensuring those pages remain in RAM to prevent thrashing.",
    "explanation": "The working set is based on the principle of locality. If a process is allocated fewer frames than its current working set, it will constantly page fault (thrash). The OS uses this model to dynamically adjust frame allocations."
  },
  {
    "test_id": os_id,
    "question_text": "What is the fundamental difference between Preemptive and Non-Preemptive CPU scheduling?",
    "options": [
      "Preemptive scheduling allows the OS to forcefully interrupt a running process to switch to another; Non-preemptive requires the process to voluntarily yield the CPU.",
      "Preemptive scheduling is used for batch jobs; Non-preemptive is used for interactive systems.",
      "Preemptive scheduling uses FIFO; Non-preemptive uses Round Robin.",
      "Preemptive scheduling is purely hardware-based."
    ],
    "correct_answer": "Preemptive scheduling allows the OS to forcefully interrupt a running process to switch to another; Non-preemptive requires the process to voluntarily yield the CPU.",
    "explanation": "In a preemptive system (like modern Windows/Linux), a timer interrupt can forcefully pause a process to give another task a turn (time-slicing). Non-preemptive systems must wait for a process to finish or block on I/O."
  },
  {
    "test_id": os_id,
    "question_text": "In a Journaling File System (like ext4 or NTFS), what is the primary benefit of the 'Journal'?",
    "options": [
      "It compresses files automatically to save disk space.",
      "It keeps a log of intended metadata changes before they are actually written to the main disk, allowing for lightning-fast recovery in the event of a power failure.",
      "It encrypts the names of all files in the directory.",
      "It prevents users from deleting important system files."
    ],
    "correct_answer": "It keeps a log of intended metadata changes before they are actually written to the main disk, allowing for lightning-fast recovery in the event of a power failure.",
    "explanation": "Without a journal, an unexpected crash during a file write requires the OS to scan the entire disk (fsck) upon reboot to fix inconsistencies. A journaling system simply replays or ignores the unfinished transactions in the log."
  },
  {
    "test_id": os_id,
    "question_text": "When resolving a deadlock by attacking the 'Circular Wait' condition, what is the standard prevention technique?",
    "options": [
      "Allowing the OS to preemptively kill random processes.",
      "Imposing a strict global ordering on all resources, requiring processes to request resources only in an increasing numerical order.",
      "Making all resources strictly sharable.",
      "Requiring processes to request all needed resources simultaneously at startup."
    ],
    "correct_answer": "Imposing a strict global ordering on all resources, requiring processes to request resources only in an increasing numerical order.",
    "explanation": "By numbering resources (e.g., Disk=1, Printer=2) and forcing threads to acquire them in ascending order, it becomes mathematically impossible to form a cycle, completely eliminating the possibility of circular wait."
  },
  {
    "test_id": os_id,
    "question_text": "What does NUMA stand for, and why is it important in modern multi-socket server operating systems?",
    "options": [
      "Network Unified Memory Architecture; it allows RAM to be shared over Ethernet.",
      "Non-Uniform Memory Access; it means the time a CPU takes to access memory depends on the memory's physical proximity to that specific CPU socket.",
      "New Unix Memory Allocation; a modern alternative to malloc.",
      "Number Utilization Metric Algorithm; used for load balancing."
    ],
    "correct_answer": "Non-Uniform Memory Access; it means the time a CPU takes to access memory depends on the memory's physical proximity to that specific CPU socket.",
    "explanation": "In a multi-CPU server, each processor has its own local bank of RAM. A CPU can access its local RAM much faster than a remote CPU's RAM. A NUMA-aware OS attempts to schedule threads on the CPU closest to their memory to maximize performance."
  },
  {
    "test_id": os_id,
    "question_text": "What is the primary role of an 'Interrupt Vector' in an Operating System?",
    "options": [
      "It is a mathematical formula used to calculate scheduling priorities.",
      "It is an array/table of memory addresses pointing to the specific Interrupt Service Routines (ISRs) for different types of hardware and software interrupts.",
      "It is a specialized hardware bus connecting the CPU to the GPU.",
      "It measures the velocity of context switches per second."
    ],
    "correct_answer": "It is an array/table of memory addresses pointing to the specific Interrupt Service Routines (ISRs) for different types of hardware and software interrupts.",
    "explanation": "When an interrupt occurs (e.g., a key press), the hardware sends an interrupt number to the CPU. The CPU uses this number as an index into the Interrupt Vector to instantly find the memory address of the function meant to handle that specific event."
  },
  {
    "test_id": os_id,
    "question_text": "In a Linux environment, what is the distinction between the 'Top Half' and 'Bottom Half' of an interrupt handler?",
    "options": [
      "The top half handles hardware errors; the bottom half handles software errors.",
      "The top half is executed immediately and masks further interrupts to perform critical, time-sensitive work; the bottom half defers non-critical work to be executed later.",
      "The top half runs in user space; the bottom half runs in kernel space.",
      "The top half allocates memory; the bottom half frees memory."
    ],
    "correct_answer": "The top half is executed immediately and masks further interrupts to perform critical, time-sensitive work; the bottom half defers non-critical work to be executed later.",
    "explanation": "Because interrupts disable other interrupts, handlers must be blazing fast. The top half acknowledges the hardware and copies data, then quickly schedules a 'bottom half' (like a tasklet or workqueue) to do the heavy processing later when interrupts are re-enabled."
  },
  {
    "test_id": os_id,
    "question_text": "What is 'Copy-on-Write' (CoW) in the context of the fork() system call?",
    "options": [
      "It immediately copies the entire memory space of the parent to the child.",
      "It prevents the child process from writing to any files.",
      "It allows the parent and child to share the same physical memory pages initially; a private copy of a page is only created if one of them attempts to modify it.",
      "It is a security feature that logs every write operation to a temporary file."
    ],
    "correct_answer": "It allows the parent and child to share the same physical memory pages initially; a private copy of a page is only created if one of them attempts to modify it.",
    "explanation": "Historically, fork() copied everything, which was incredibly slow. Modern OSes map both processes to the same physical pages marked as read-only. If either tries to write, a page fault occurs, and the OS intercepts it to create a duplicate, private page for the writer."
  }
    ]
    q_result = questions_collection.insert_many(questions)
    print(f"✅ Success! Inserted {len(q_result.inserted_ids)} questions into the database.")
    print("You can now click 'Start Assessment' on DBMS or System Design!")

if __name__ == "__main__":
    run_seed()