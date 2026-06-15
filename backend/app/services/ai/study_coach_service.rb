require 'ollama_client'

class Ai::StudyCoachService
  def initialize(user, session, question)
    @user = user
    @session = session
    @question = question
  end

  def call
    # 1. Lexical retrieval (RAG)
    chunks = retrieve_relevant_chunks(@question)
    
    # 2. Compile Context
    context = chunks.map { |c| "[Source: #{c.title}]\n#{c.content}" }.join("\n\n---\n\n")

    # 3. Get response from LLM using Ollama (with simulation fallback)
    response_content = generate_ollama_response(context, @question)

    # 4. Save messages
    @session.messages.create!(sender: "user", content: @question)
    ai_msg = @session.messages.create!(sender: "ai", content: response_content)

    ai_msg
  end

  private

  def generate_ollama_response(context, query)
    # Configure and initialize the contract-driven Ollama::Client
    config = Ollama::Config.new
    config.model = "qwen3.5:4b"
    config.timeout = 60
    config.retries = 2
    client = Ollama::Client.new(config: config)

    # Build prompt messages
    messages = [
      {
        role: "system",
        content: <<~SYSTEM
          You are PrepEdge Study Coach, an expert AI interviewer and senior software systems architect.
          Guide the candidate socratically. Use the retrieved context to ground your answer when relevant, but do not copy it verbatim.
          Keep your response concise (2-4 paragraphs), highly professional, technical, and formatted in clean Markdown.
          Explain core trade-offs, architecture choices, or patterns clearly.
        SYSTEM
      }
    ]

    # Fetch previous messages in session for conversation memory (limit to 6)
    previous_messages = @session.messages.order(created_at: :asc).last(6)
    previous_messages.each do |msg|
      messages << {
        role: msg.sender == "user" ? "user" : "assistant",
        content: msg.content
      }
    end

    # Build prompt for current user turn with RAG context
    prompt = ""
    if context.present?
      prompt += "Retrieved Context/Reference Documentation:\n#{context}\n\n"
    end
    prompt += "Candidate Query: #{query}"

    messages << {
      role: "user",
      content: prompt
    }

    response = client.chat(messages: messages)
    
    if response && response.respond_to?(:message) && response.message.respond_to?(:content)
      response.message.content
    else
      # Try hash-based backup mapping or raise error
      response.dig("message", "content") || response.dig(:message, :content) || raise("Invalid response format")
    end
  rescue => e
    Rails.logger.warn "Ollama::Client error: #{e.message}. Falling back to simulated response."
    generate_simulated_response(context, query)
  end


  def retrieve_relevant_chunks(query)
    terms = query.downcase.scan(/\w+/)
    return ContentChunk.all.limit(2) if terms.empty?

    # Score each content chunk by matches
    scored = ContentChunk.all.map do |chunk|
      text = "#{chunk.title} #{chunk.content}".downcase
      score = terms.count { |term| text.include?(term) }
      [chunk, score]
    end

    # Return top 2 matching chunks with score > 0, fallback to first 2 if none match
    filtered = scored.select { |_, score| score > 0 }.sort_by { |_, score| -score }.map(&:first)
    filtered.empty? ? ContentChunk.all.limit(2) : filtered.first(2)
  end

  def generate_simulated_response(context, query)
    q = query.downcase
    
    if q.include?("cap") || q.include?("consistency") || q.include?("availability")
      <<~MARKDOWN
        ### Distributed Systems Design: CAP Theorem & Consistency

        In a distributed system, network partitions (**P**) are inevitable. Under a partition, you must make a hard choice:

        1. **Consistency (CP)**: Reject updates to guarantee all nodes return the same data. Sacrifices availability.
        2. **Availability (AP)**: Accept updates on any node, returning stale data from isolated nodes. Sacrifices consistency.

        #### Senior Level Trade-offs to Articulate:
        * **Consistent read options**: In CP systems, enforce quorum reads ($R + W > N$) to ensure you read the latest write.
        * **Eventual Consistency patterns**: In AP systems, use conflict resolution like **CRDTs** (Conflict-free Replicated Data Types) or Last-Write-Wins (LWW) to merge divergent states.
        * **Real-world example**: A payment transaction gateway requires strict **CP** to prevent double spending. An active user status or feed service uses **AP** because temporary staleness is a minor trade-off for high responsiveness.

        *Context utilized from retrieved documentation:*
        ```text
        #{context}
        ```
      MARKDOWN
    elsif q.include?("consistent hashing") || q.include?("hashing") || q.include?("load balancer")
      <<~MARKDOWN
        ### Architecture Deep Dive: Consistent Hashing

        Consistent hashing maps both servers and data keys to a circular integer space (e.g. $[0, 2^{32} - 1]$).

        #### Key Mechanics:
        1. **Server Placement**: Server addresses are hashed and placed on the circle.
        2. **Key Placement**: Data keys are hashed and mapped to the same circle.
        3. **Key Assignment**: A key is assigned to the first server encountered moving clockwise.

        #### Why it is Senior-Level:
        * **Minimum Reshuffle**: Unlike modulo hashing ($hash(key) \\% N$) which invalidates nearly all cache slots when $N$ changes, consistent hashing only requires remapping $K/N$ keys on average when adding or removing a node.
        * **Hotspot Mitigation via Virtual Nodes**: In practice, servers have different capacities and hash distribution can be uneven. Mapping each physical server to multiple **Virtual Nodes (V-Nodes)** spreads server hashes evenly across the ring, preventing a single node from receiving disproportionate traffic.

        *Context utilized from retrieved documentation:*
        ```text
        #{context}
        ```
      MARKDOWN
    elsif q.include?("solid") || q.include?("design pattern") || q.include?("oop")
      <<~MARKDOWN
        ### Low-Level Design: SOLID & Object-Oriented Clean Code

        At a senior level, design patterns are not just templates to memorize; they are tools to manage software volatility.

        #### SOLID Violation & Correction:
        * **Single Responsibility (SRP)**: Keep business logic separated from presentation or database persistence. A `User` class should not handle sending emails or formatting JSON.
        * **Open/Closed (OCP)**: Use interfaces or abstract base classes. When adding a new payment gateway, don't write `if gateway == 'stripe'` inside the checker. Implement a `PaymentGateway` interface and inject specific implementation classes.

        #### Dependency Inversion in Action:
        Rather than a high-level service directly instantiating a specific logger (`logger = ConsoleLogger.new`), inject it:
        ```ruby
        class UserService
          def initialize(logger:)
            @logger = logger # depends on logger interface
          end
        end
        ```

        *Context utilized from retrieved documentation:*
        ```text
        #{context}
        ```
      MARKDOWN
    elsif q.include?("mcp") || q.include?("model context protocol")
      <<~MARKDOWN
        ### Model Context Protocol (MCP): decupled integration standard

        The **Model Context Protocol** is a stateful JSON-RPC 2.0 protocol that decouples LLM applications from external systems.

        #### Client-Server Separation:
        Instead of hardcoding a python script that connects directly to a database, you write a standalone **MCP Server**. The LLM client (like Cursor) communicates with the server over stdio or WebSockets.

        #### Senior Security Considerations:
        * **Isolated execution**: Run servers in containerized/sandbox environments.
        * **Consent management**: Always intercept tool executions that mutate states or perform dangerous operations (like writing to filesystem) and request manual user approval.

        *Context utilized from retrieved documentation:*
        ```text
        #{context}
        ```
      MARKDOWN
    elsif q.include?("structured output") || q.include?("json schema")
      <<~MARKDOWN
        ### AI Engineering: Structured Outputs & Sampler Controls

        Fuzzy prompt parsing (e.g. "return only a JSON list") is highly volatile in production. 

        #### Production Standards:
        * **JSON Schema Constraining**: Enforce output structures at the foundational model level (e.g. OpenAI's `response_format` with `strict: true`). The model sampler rejects tokens that violate the schema regex, guaranteeing 100% adherence.
        * **Deterministic Configuration**: Always set `temperature = 0.0`. Any entropy (higher temperature) allows the model to select alternative token pathways, increasing the probability of schema parsing failures.

        *Context utilized from retrieved documentation:*
        ```text
        #{context}
        ```
      MARKDOWN
    else
      <<~MARKDOWN
        ### Senior Software Engineer Architecture Guidance

        Hello! I am your AI Interview Coach. I can guide you through DSA patterns, Low-Level Design (SOLID), System Design (HLD trade-offs), and production AI engineering (MCP, Evals, Telemetry).

        #### Recommended Topics to Ask Me:
        1. **Consistent Hashing**: How to manage partition load balancing.
        2. **CAP Theorem**: Balancing consistency vs availability under network failure.
        3. **SOLID Principles**: Violations, code modularity, and OCP patterns.
        4. **Model Context Protocol (MCP)**: Decoupled tool integration architectures.
        5. **Structured Outputs**: Building deterministic pipelines with `temperature = 0.0` and JSON schemas.

        *Retrieved Context:*
        ```text
        #{context.truncate(200)}
        ```
      MARKDOWN
    end
  end
end
