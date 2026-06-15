class Ai::SocraticHintService
  HINTS = {
    "two-sum" => {
      1 => "Think about whether you've seen this before in Hash Map lookup problems. Can we do it in a single pass?",
      2 => "As you iterate, check if target - current_value is already in your Hash Map. If it is, you've found the pair! If not, record the current_value and index in the map.",
      3 => "Initialize index_map = {}. Iterate with index i: check if target - nums[i] is in index_map. If yes, return [index_map[target - nums[i]], i]. Otherwise, index_map[nums[i]] = i."
    },
    "sliding-window-maximum" => {
      1 => "To solve this in O(N) time, a standard nested loop won't work. Think about what data structure can keep track of indices in decreasing order of value.",
      2 => "Use a Double-ended Queue (Deque) to store indices of elements. Maintain the deque such that elements are in strictly decreasing order. Remove elements from the back if they are smaller than the current element.",
      3 => "For each element nums[i]: (1) Remove indices out of current window boundaries (i.e., < i - k + 1) from deque front. (2) While deque is not empty and nums[deque.last] < nums[i], remove from deque back. (3) Append i. (4) If i >= k - 1, nums[deque.first] is the current max."
    },
    "course-schedule" => {
      1 => "This is a classical graph cycle detection problem. How do we model prerequisites as directed edges?",
      2 => "Represent courses as nodes and prerequisites as directed edges. Build an adjacency list. Use Depth-First Search (DFS) with a state array (0 = unvisited, 1 = visiting, 2 = visited) to detect cycles.",
      3 => "For each node i: run dfs(i). In dfs(u): if state[u] == 1 (visiting), cycle detected! return false. If state[u] == 2 (visited), return true. Set state[u] = 1, recurse dfs on all neighbors, then set state[u] = 2. Return true if all nodes return true."
    },
    "alien-dictionary" => {
      1 => "This problem asks for alphabetical ordering based on a sorted list of words. Think about Topological Sort.",
      2 => "Compare adjacent words to find first differing characters: e.g. 'wrt' and 'wrf' implies 't' -> 'f' directed edge. Build an adjacency list and compute in-degrees of nodes. Run Kahn's algorithm (BFS with in-degree queue) to find ordering.",
      3 => "Build graph: compare words[i] and words[i+1], add edge u -> v, increment indegree[v]. Put all nodes with indegree == 0 into a Queue. While queue is not empty: pop u, append u to output, decrement indegree of all neighbors. If neighbor indegree reaches 0, push to queue. If output length < unique characters, cycle exists, return empty string."
    },
    "design-parking-lot" => {
      1 => "Seniors must justify composition over inheritance here. Start by defining clean class boundaries for ParkingLot, Level, Spot, and Vehicle.",
      2 => "A ParkingLot contains multiple Levels. Each Level contains multiple Spots (grouped by spot type: Large, Compact, Motorcycle). A Vehicle has a size and is parked in a Spot compatible with its size.",
      3 => "Implement a Spot class with methods: park(vehicle), unpark(). Level class handles search: find_available_spot(vehicle_type). ParkingLot coordinates levels and issues tickets containing check-in time."
    },
    "thread-safe-lru-cache" => {
      1 => "For O(1) operations, you need a Doubly Linked List and a Hash Map. For thread-safety, think about locking granularity.",
      2 => "Combine a standard LRU (Hash Map pointing to Doubly Linked List nodes) with a Mutex lock around all mutable operations (get and put). To support TTL, store a timestamp on each node and check expiration on get.",
      3 => "In Ruby, use `Thread::Mutex.new` inside initialize. In `get(key)`: lock mutex, check map. If key exists: check if expired (current_time > created_at + ttl). If expired, delete node, unlock, return nil. If not, move node to head, return value. Unlock at end of every execution."
    }
  }.freeze

  def self.hint_for(slug, level)
    slug_hints = HINTS[slug]
    return "Think about the problem constraints, time complexity limits, and possible edge cases." if slug_hints.nil?
    slug_hints[level] || "Read the problem description carefully and write down your approach before coding."
  end
end
