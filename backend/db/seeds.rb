# Clear existing users to prevent password validation mismatches
User.destroy_all
Problem.destroy_all
ContentChunk.destroy_all

# Seed an Admin user
admin = User.create!(
  email: "admin@example.com",
  name: "System Admin",
  password: "password123",
  plan: "team",
  admin: true
)

# Seed a default regular user
user = User.create!(
  email: "user@example.com",
  name: "Senior Candidate",
  password: "password123",
  plan: "free",
  admin: false
)

# Seed an additional test user
User.create!(
  email: "test@example.com",
  name: "Test User",
  password: "password123",
  plan: "free",
  admin: false
)

# Seed Problems
problems_data = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays & Hashing",
    source: "LeetCode 1",
    platform: "LeetCode",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starter_code: "def two_sum(nums, target)\n  \nend"
  },
  {
    slug: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    topic: "Sliding Window",
    source: "LeetCode 239",
    platform: "LeetCode",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right.",
    starter_code: "def max_sliding_window(nums, k)\n  \nend"
  },
  {
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    topic: "Graphs",
    source: "LeetCode 207",
    platform: "LeetCode",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Some courses may have prerequisites.",
    starter_code: "def can_finish(num_courses, prerequisites)\n  \nend"
  },
  {
    slug: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "Hard",
    topic: "Advanced Graphs",
    source: "LeetCode 269",
    platform: "LeetCode",
    description: "There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you. Return the correct alphabetical order of the alien letters.",
    starter_code: "def alien_order(words)\n  \nend"
  },
  {
    slug: "design-parking-lot",
    title: "Design a Parking Lot",
    difficulty: "Medium",
    topic: "Low-Level Design",
    source: "System Design Primer",
    platform: "PrepEdge",
    description: "Design a parking lot. It should support different types of vehicles (compact, large, electric) and multiple levels. Implement slot allocation and payment calculation.",
    starter_code: "class ParkingLot\n  def initialize(levels)\n  end\n\n  def park_vehicle(vehicle)\n  end\nend"
  },
  {
    slug: "thread-safe-lru-cache",
    title: "Thread-safe LRU Cache with TTL",
    difficulty: "Hard",
    topic: "Low-Level Design",
    source: "Advanced LLD",
    platform: "PrepEdge",
    description: "Design and implement a thread-safe Least Recently Used (LRU) cache. Each entry should have a Time To Live (TTL) after which it expires.",
    starter_code: "class LRUCache\n  def initialize(capacity, ttl)\n  end\n\n  def get(key)\n  end\n\n  def put(key, value)\n  end\nend"
  }
]

problems_data.each do |p_data|
  Problem.find_or_create_by!(slug: p_data[:slug]) do |p|
    p.title = p_data[:title]
    p.difficulty = p_data[:difficulty]
    p.topic = p_data[:topic]
    p.source = p_data[:source]
    p.platform = p_data[:platform]
    p.description = p_data[:description]
    p.starter_code = p_data[:starter_code]
  end
end

# Seed Content Chunks (RAG database)
content_chunks_data = [
  {
    source_type: "system_design",
    title: "CAP Theorem: Choosing Consistency vs Availability",
    content: "The CAP Theorem states that in a distributed data store, you can only guarantee two out of three: Consistency, Availability, and Partition Tolerance.\nIn the presence of a network partition (P), you must choose between: \n1. Consistency (C): Reject updates to maintain data uniformity across nodes, sacrificing availability.\n2. Availability (A): Allow updates on any node, returning stale data from isolated nodes, sacrificing consistency.\nTrade-off example: Financial ledgers choose CP (Consistency) to prevent double spending. Social media feeds choose AP (Availability) to ensure user interactions continue even under partition."
  },
  {
    source_type: "system_design",
    title: "Consistent Hashing & Dynamic Rescaling",
    content: "Consistent Hashing is a key load balancing algorithm for caching systems. Instead of mapping keys directly to server slots using hash(key) % N (which requires reshuffling all keys when a server joins or leaves), consistent hashing maps both keys and servers to a circular ring (0 to 2^32-1).\nWhen a server is added or removed, only k/N keys need to be remapped on average. Virtual nodes are added to prevent hot spotting by distributing server mapping points evenly across the hash ring."
  },
  {
    source_type: "lld",
    title: "SOLID Principles: Building Maintainable Object-Oriented Code",
    content: "SOLID is an acronym for five design principles:\n1. Single Responsibility Principle (SRP): A class should have one, and only one, reason to change.\n2. Open/Closed Principle (OCP): Classes should be open for extension but closed for modification (e.g. use Strategy pattern).\n3. Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without changing correctness.\n4. Interface Segregation Principle (ISP): Clients should not be forced to depend on interfaces they do not use.\n5. Dependency Inversion Principle (DIP): High-level modules should not depend on low-level modules; both should depend on abstractions (e.g. Dependency Injection)."
  },
  {
    source_type: "ai",
    title: "Model Context Protocol (MCP) Architectural Design",
    content: "The Model Context Protocol (MCP) is an open-standard protocol for connecting language models to external data sources and tools using a decoupled client-server architecture.\nMCP runs stateful lifecycle negotiations via JSON-RPC 2.0 over standard I/O or WebSockets transport. Key abstractions include:\n1. Tools: Executable functions invoked by the model.\n2. Resources: Static or dynamic documents exposed to the model context.\n3. Prompts: Pre-packaged prompt templates.\nMCP emphasizes tool isolation, requiring user-consent gates for security."
  },
  {
    source_type: "ai",
    title: "Structured Outputs: Enforcing JSON Schemas",
    content: "To build deterministic integration layers, production applications use Structured Outputs. Rather than relying on fuzzy prompt parsing, the model output is constrained at the sampler level by a defined JSON Schema.\nSetting strict: true ensures that responses comply 100% with the specified format. The temperature parameter should be forced to 0.0 to prevent random deviations or schema validation failures."
  },
  {
    source_type: "system_design",
    title: "ByteByteGo: Advanced System Design Reference",
    content: "ByteByteGo, created by Alex Xu, is a dynamic system design learning ecosystem that skips baseline fundamentals to focus on deep-dive infrastructure case studies. It covers: \n1. High-scale architectures (Netflix video streaming, Uber geospatial coordination, Discord real-time messaging).\n2. Specializations in Machine Learning/AI infra (recommendations, visual search pipelines, vector search RAG systems) and Object-Oriented Design (OOD).\n3. Core building blocks (sharding, consistent hashing, rate limiting options, CDNs).\nKey takeaway: When using ByteByteGo, engineers should avoid passive reading and actively reverse-engineer component topologies before checking the proposed solutions."
  }
]

content_chunks_data.each do |c_data|
  ContentChunk.find_or_create_by!(title: c_data[:title]) do |c|
    c.source_type = c_data[:source_type]
    c.content = c_data[:content]
    c.embedding_json = { simulated: true }
  end
end

puts "Database seeded successfully with user: user@example.com / password123 and admin: admin@example.com / password123"
