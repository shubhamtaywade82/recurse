import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  CheckSquare,
  Code,
  Award,
  TrendingUp,
  Settings,
  Play,
  Send,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Sparkles,
  Zap,
  Share2,
  Trash2,
  Plus,
  Star
} from "lucide-react";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null") || { name: "", email: "", plan: "free", admin: false });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState({ years_experience: 5, target_companies: [], current_track: "SWE" });

  // Shared view state
  const [sharedToken, setSharedToken] = useState("");
  const [sharedData, setSharedData] = useState(null);

  // Auth screen state
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });

  // Loading & Notification states
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Dashboard / Study logs state
  const [studyLogs, setStudyLogs] = useState([]);
  const [logForm, setLogForm] = useState({ dsa: 0, sd: 0, lld: 0, ai: 0 });

  // Checklist / Roadmap state
  const [checklistItems, setChecklistItems] = useState([]);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // AI Study Coach state
  const [coachSessions, setCoachSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  // Mock Interviews state
  const [mockInterviews, setMockInterviews] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  const [answerInput, setAnswerInput] = useState("");
  const [interviewType, setInterviewType] = useState("dsa");

  // DSA Practice state
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [codeEditor, setCodeEditor] = useState("");
  const [notesEditor, setNotesEditor] = useState("");
  const [hintsRequested, setHintsRequested] = useState({});
  const [problemTimer, setProblemTimer] = useState(0);
  const timerRef = useRef(null);

  // Gap Analytics state
  const [gapData, setGapData] = useState({ ratings: {}, scores_trajectory: [], recommendation_critique: "", last_analyzed_at: "" });
  const [analyzing, setAnalyzing] = useState(false);

  // Practice Plan state
  const [customPlan, setCustomPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ track: "SWE", experience: 5, companies: "Google, Meta", hours: 20 });

  // ADMIN STATE
  const [adminTab, setAdminTab] = useState("metrics");
  const [systemMetrics, setSystemMetrics] = useState({ total_users: 0, pro_users: 0, team_users: 0, total_study_hours: 0, total_interviews: 0, average_interview_score: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminProblems, setAdminProblems] = useState([]);
  const [adminChunks, setAdminChunks] = useState([]);
  const [adminProblemForm, setAdminProblemForm] = useState({ slug: "", title: "", difficulty: "Medium", topic: "Arrays & Hashing", source: "Custom", platform: "PrepEdge", description: "", starter_code: "" });
  const [adminChunkForm, setAdminChunkForm] = useState({ source_type: "system_design", title: "", content: "" });

  // Check URL for public share token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    if (shared) {
      setSharedToken(shared);
      fetchSharedInterview(shared);
    }
  }, []);

  // Fetch data if user authenticated
  useEffect(() => {
    if (token && !sharedToken) {
      fetchProfile();
      fetchStudyLogs();
      fetchChecklist();
      fetchCoachSessions();
      fetchMockInterviews();
      fetchProblems();
      fetchGapAnalytics();
      fetchPracticePlan();
    }
  }, [token, sharedToken]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessionMessages]);

  useEffect(() => {
    if (selectedProblem) {
      setProblemTimer(0);
      timerRef.current = setInterval(() => {
        setProblemTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [selectedProblem]);

  // Authenticated fetch helper
  const fetchAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // Clear expired auth session
      handleLogout();
      throw new Error("Session expired. Please log in again.");
    }
    return res;
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = authTab === "login" ? "/api/v1/auth/login" : "/api/v1/auth/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showNotification(`Welcome back, ${data.user.name}!`);
        setAuthForm({ email: "", password: "", name: "" });
      } else {
        showNotification(data.error || "Authentication failed", "error");
      }
    } catch (err) {
      showNotification("Network error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser({ name: "", email: "", plan: "free", admin: false });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showNotification("Logged out successfully");
  };

  // Shared interview retrieval
  const fetchSharedInterview = async (shareToken) => {
    try {
      const res = await fetch(`/api/v1/shared/mock_interviews/${shareToken}`);
      const data = await res.json();
      if (data.mock_interview) {
        setSharedData(data);
      } else {
        showNotification(data.error || "Failed to load shared report", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Standard Profile / API Queries
  const fetchProfile = async () => {
    try {
      const res = await fetchAuth("/api/v1/profile");
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.user) setUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudyLogs = async () => {
    try {
      const res = await fetchAuth("/api/v1/study_logs");
      const data = await res.json();
      if (data.study_logs) setStudyLogs(data.study_logs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChecklist = async () => {
    try {
      const res = await fetchAuth("/api/v1/checklist_items");
      const data = await res.json();
      if (data.checklist_items) setChecklistItems(data.checklist_items);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCoachSessions = async () => {
    try {
      const res = await fetchAuth("/api/v1/coach_sessions");
      const data = await res.json();
      if (data.coach_sessions) {
        setCoachSessions(data.coach_sessions);
        if (data.coach_sessions.length > 0 && !activeSession) {
          selectCoachSession(data.coach_sessions[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMockInterviews = async () => {
    try {
      const res = await fetchAuth("/api/v1/mock_interviews");
      const data = await res.json();
      if (data.mock_interviews) setMockInterviews(data.mock_interviews);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetchAuth("/api/v1/problems");
      const data = await res.json();
      if (data.problems) setProblems(data.problems);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGapAnalytics = async () => {
    try {
      const res = await fetchAuth("/api/v1/gap_analytics");
      const data = await res.json();
      if (data) setGapData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPracticePlan = async () => {
    try {
      const res = await fetchAuth("/api/v1/practice_plan");
      const data = await res.json();
      if (data.plan) setCustomPlan(data.plan);
    } catch (e) {
      console.error(e);
    }
  };

  // Actions
  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/subscriptions/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        showNotification(`Simulated payment approved! Upgraded to ${plan} tier.`);
      }
    } catch (e) {
      showNotification("Payment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const logStudyTime = async (e) => {
    e.preventDefault();
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const res = await fetchAuth("/api/v1/study_logs", {
        method: "POST",
        body: JSON.stringify({
          date: today,
          dsa_minutes: logForm.dsa,
          sd_minutes: logForm.sd,
          lld_minutes: logForm.lld,
          ai_minutes: logForm.ai
        })
      });
      const data = await res.json();
      if (data.study_log) {
        showNotification("Study hours logged successfully!");
        fetchStudyLogs();
        fetchGapAnalytics();
        setLogForm({ dsa: 0, sd: 0, lld: 0, ai: 0 });
      }
    } catch (e) {
      showNotification("Failed to log study hours", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklist = async (id) => {
    try {
      const res = await fetchAuth(`/api/v1/checklist_items/${id}/toggle`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.checklist_item) {
        setChecklistItems(items =>
          items.map(it => it.id === id ? data.checklist_item : it)
        );
        fetchGapAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectCoachSession = async (id) => {
    try {
      const res = await fetchAuth(`/api/v1/coach_sessions/${id}`);
      const data = await res.json();
      if (data.coach_session) {
        setActiveSession(data.coach_session);
        setSessionMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createCoachSession = async (type = "general") => {
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/coach_sessions", {
        method: "POST",
        body: JSON.stringify({ session_type: type })
      });
      const data = await res.json();
      if (data.coach_session) {
        showNotification("New coaching chat started.");
        fetchCoachSessions();
        selectCoachSession(data.coach_session.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendCoachMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;

    const userMsg = chatInput;
    setChatInput("");
    setSessionMessages(m => [...m, { sender: "user", content: userMsg }]);
    setSessionMessages(m => [...m, { sender: "ai", content: "Thinking..." }]);

    try {
      const res = await fetchAuth(`/api/v1/coach_sessions/${activeSession.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: userMsg })
      });
      const data = await res.json();
      if (data.ai_message) {
        setSessionMessages(m =>
          m.filter(msg => msg.content !== "Thinking...").concat(data.ai_message)
        );
      }
    } catch (e) {
      console.error(e);
      setSessionMessages(m => m.filter(msg => msg.content !== "Thinking..."));
    }
  };

  const startMockInterview = async () => {
    if (user.plan === "free" && mockInterviews.length >= 1) {
      showNotification("Upgrade to PRO or TEAM to access unlimited mock interviews.", "error");
      setActiveTab("settings");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/mock_interviews", {
        method: "POST",
        body: JSON.stringify({ interview_type: interviewType })
      });
      const data = await res.json();
      if (data.mock_interview) {
        setActiveInterview(data.mock_interview);
        setAnswerInput("");
        showNotification("Mock interview started! Speak or type your answer.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitInterviewAnswer = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || !activeInterview) return;

    setLoading(true);
    const ans = answerInput;
    setAnswerInput("");

    try {
      const res = await fetchAuth(`/api/v1/mock_interviews/${activeInterview.id}`, {
        method: "PATCH",
        body: JSON.stringify({ answer: ans })
      });
      const data = await res.json();
      if (data.mock_interview) {
        setActiveInterview(data.mock_interview);
        if (data.finished) {
          showNotification("Interview completed! Rubric feedback generated.");
          fetchMockInterviews();
          fetchGapAnalytics();
        } else {
          showNotification("Answer recorded. Next follow-up presented.");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectProblem = async (slug) => {
    try {
      const res = await fetchAuth(`/api/v1/problems/${slug}`);
      const data = await res.json();
      if (data.problem) {
        setSelectedProblem(data.problem);
        setCodeEditor(data.problem.code);
        setNotesEditor(data.problem.notes);
        setHintsRequested({});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const requestSocraticHint = async (level) => {
    if (!selectedProblem) return;
    try {
      const res = await fetchAuth(`/api/v1/problems/${selectedProblem.id}/user_problems/1/hint_requests`, {
        method: "POST",
        body: JSON.stringify({ hint_level: level })
      });
      const data = await res.json();
      if (data.hint_request) {
        setHintsRequested(h => ({ ...h, [level]: data.hint_request.hint_text }));
        showNotification(`Socratic Hint Level ${level} unlocked.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitProblemCode = async () => {
    if (!selectedProblem) return;
    setLoading(true);
    try {
      const res = await fetchAuth(`/api/v1/problems/${selectedProblem.id}/user_problems/1/submit_code`, {
        method: "POST",
        body: JSON.stringify({
          code: codeEditor,
          notes: notesEditor,
          time_taken_secs: problemTimer
        })
      });
      const data = await res.json();
      if (data.user_problem) {
        showNotification(data.message, data.success ? "success" : "error");
        setSelectedProblem(p => ({ ...p, status: data.user_problem.status }));
        fetchProblems();
        fetchGapAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerGapAnalysis = async () => {
    setAnalyzing(true);
    try {
      await fetchAuth("/api/v1/gap_analytics/trigger", { method: "POST" });
      await fetchGapAnalytics();
      showNotification("Observability metrics synced. Gap analytics updated.");
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const generatePracticePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/practice_plan/generate", {
        method: "POST",
        body: JSON.stringify({
          track: planForm.track,
          years_experience: planForm.experience,
          target_companies: planForm.companies.split(",").map(c => c.trim()),
          weekly_hours: planForm.hours
        })
      });
      const data = await res.json();
      if (data.plan) {
        setCustomPlan(data.plan);
        setProfile(data.profile);
        showNotification("Dynamic practice plan successfully compiled.");
        fetchChecklist();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ADMIN OPERATIONS
  useEffect(() => {
    if (activeTab === "admin" && user.admin) {
      fetchAdminMetrics();
      fetchAdminUsers();
      fetchAdminProblems();
      fetchAdminChunks();
    }
  }, [activeTab]);

  const fetchAdminMetrics = async () => {
    const res = await fetchAuth("/api/v1/admin/users/system_metrics");
    const data = await res.json();
    setSystemMetrics(data);
  };

  const fetchAdminUsers = async () => {
    const res = await fetchAuth("/api/v1/admin/users");
    const data = await res.json();
    if (data.users) setAdminUsers(data.users);
  };

  const fetchAdminProblems = async () => {
    const res = await fetchAuth("/api/v1/admin/problems");
    const data = await res.json();
    if (data.problems) setAdminProblems(data.problems);
  };

  const fetchAdminChunks = async () => {
    const res = await fetchAuth("/api/v1/admin/content_chunks");
    const data = await res.json();
    if (data.content_chunks) setAdminChunks(data.content_chunks);
  };

  const updateAdminUserPlan = async (userId, plan) => {
    try {
      const res = await fetchAuth(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ user: { plan } })
      });
      if (res.ok) {
        showNotification("User subscription updated successfully.");
        fetchAdminUsers();
        fetchAdminMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAdminUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetchAuth(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("User account deleted successfully.");
        fetchAdminUsers();
        fetchAdminMetrics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createAdminProblem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/admin/problems", {
        method: "POST",
        body: JSON.stringify({ problem: adminProblemForm })
      });
      if (res.ok) {
        showNotification("DSA practice problem added successfully.");
        fetchAdminProblems();
        setAdminProblemForm({ slug: "", title: "", difficulty: "Medium", topic: "Arrays & Hashing", source: "Custom", platform: "PrepEdge", description: "", starter_code: "" });
      } else {
        const data = await res.json();
        showNotification(data.errors.join(", "), "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdminProblem = async (id) => {
    if (!confirm("Delete this problem?")) return;
    try {
      const res = await fetchAuth(`/api/v1/admin/problems/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Problem deleted successfully.");
        fetchAdminProblems();
        fetchProblems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createAdminChunk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchAuth("/api/v1/admin/content_chunks", {
        method: "POST",
        body: JSON.stringify({ content_chunk: adminChunkForm })
      });
      if (res.ok) {
        showNotification("RAG Document context chunk created.");
        fetchAdminChunks();
        setAdminChunkForm({ source_type: "system_design", title: "", content: "" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdminChunk = async (id) => {
    if (!confirm("Delete this document chunk?")) return;
    try {
      const res = await fetchAuth(`/api/v1/admin/content_chunks/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Document chunk deleted.");
        fetchAdminChunks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper getters
  const getProgressPercentage = () => {
    if (checklistItems.length === 0) return 0;
    const completed = checklistItems.filter(item => item.completed).length;
    return Math.round((completed / checklistItems.length) * 100);
  };

  const getLogSummaryMinutes = () => {
    return studyLogs.reduce((acc, log) => acc + log.dsa_minutes + log.sd_minutes + log.lld_minutes + log.ai_minutes, 0);
  };

  // ========================================================
  // RENDER VIEW: PUBLIC SHARED INTERVIEW
  // ========================================================
  if (sharedToken) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "60px 20px", fontFamily: "var(--font-sans)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {sharedData ? (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ borderBottom: "1px solid var(--border-glass)", paddingBottom: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-indigo)" }}>
                  <Sparkles size={20} />
                  <span style={{ fontWeight: 800, fontSize: 18 }}>PrepEdge Shared Report</span>
                </div>
                <h2 style={{ fontSize: 24, marginTop: 10 }}>
                  Shared {sharedData.mock_interview.interview_type.toUpperCase()} Mock Interview
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                  Conducted on {new Date(sharedData.mock_interview.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Score Display */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 15, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Overall Score</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-amber)", marginTop: 4 }}>
                    {sharedData.mock_interview.score}%
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 15, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Groundedness</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-emerald)", marginTop: 4 }}>
                    {sharedData.eval_result?.groundedness || "N/A"}
                  </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: 15, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Context Relevance</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-sky)", marginTop: 4 }}>
                    {sharedData.eval_result?.relevance || "N/A"}
                  </div>
                </div>
              </div>

              {/* Rubric Breakdown */}
              {sharedData.eval_result?.rubric_scores && (
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 12 }}>Rubric Dimension Scores</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(sharedData.eval_result.rubric_scores).map(([rubric, val]) => (
                      <div key={rubric}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ textTransform: "capitalize" }}>{rubric.replace(/_/g, " ")}</span>
                          <span style={{ fontWeight: 700 }}>{val}/10</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.03)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${val * 10}%`, height: "100%", background: "var(--color-indigo)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              {sharedData.mock_interview.feedback && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "rgba(16,185,129,0.02)", border: "1px solid rgba(16,185,129,0.1)", padding: 15, borderRadius: 8 }}>
                    <h4 style={{ color: "var(--color-emerald)", fontSize: 14, marginBottom: 8 }}>Key Strengths</h4>
                    <ul style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {sharedData.mock_interview.feedback.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.02)", border: "1px solid rgba(239,68,68,0.1)", padding: 15, borderRadius: 8 }}>
                    <h4 style={{ color: "var(--color-rose)", fontSize: 14, marginBottom: 8 }}>Weaknesses / Improvements</h4>
                    <ul style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {sharedData.mock_interview.feedback.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Interview Transcript</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#090911", padding: 16, borderRadius: 8, height: 260, overflowY: "auto" }}>
                  {sharedData.mock_interview.transcript?.map((turn, index) => (
                    <div key={index} style={{ fontSize: 13 }}>
                      <strong style={{ color: turn.role === "interviewer" ? "var(--color-indigo)" : "var(--color-emerald)" }}>
                        {turn.role === "interviewer" ? "Interviewer: " : "You: "}
                      </strong>
                      <span style={{ color: "white" }}>{turn.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  window.location.search = "";
                }}
                className="btn-primary"
                style={{ alignSelf: "center", marginTop: 10 }}
              >
                Go to PrepEdge Platform
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: "center", padding: 40 }}>
              <RefreshCw className="glow-text" size={32} style={{ animation: "pulseGlow 1.5s infinite", margin: "0 auto" }} />
              <p style={{ marginTop: 15 }}>Loading shared interview analysis report...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER VIEW: AUTHENTICATION GATE SCREEN
  // ========================================================
  if (!token) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 20, fontFamily: "var(--font-sans)"
      }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: 30, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-indigo)" }}>
              <Sparkles size={28} className="glow-text" />
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>PrepEdge</h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
              Senior Software Engineer Interview Platform
            </p>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid var(--border-glass)" }}>
            <button
              onClick={() => setAuthTab("login")}
              style={{
                flex: 1, padding: "10px 0", background: "none", border: "none", color: authTab === "login" ? "white" : "var(--text-muted)",
                fontWeight: 700, borderBottom: authTab === "login" ? "2px solid var(--color-indigo)" : "none", cursor: "pointer"
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthTab("register")}
              style={{
                flex: 1, padding: "10px 0", background: "none", border: "none", color: authTab === "register" ? "white" : "var(--text-muted)",
                fontWeight: 700, borderBottom: authTab === "register" ? "2px solid var(--color-indigo)" : "none", cursor: "pointer"
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {authTab === "register" && (
              <div>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="input-field"
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
              {authTab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, padding: 12, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            <strong>Default Seeded Credentials:</strong><br />
            Regular User: <code>user@example.com</code> / <code>password123</code><br />
            Admin User: <code>admin@example.com</code> / <code>password123</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: notification.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 8, padding: "12px 20px",
          color: "white", fontWeight: 600, display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)", animation: "slideIn 0.3s ease-out"
        }}>
          {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside style={{
        width: 260, borderRight: "1px solid var(--border-glass)",
        background: "rgba(10, 10, 20, 0.8)", padding: 24, display: "flex", flexDirection: "column", gap: 24,
        position: "sticky", top: 0, height: "100vh"
      }}>
        {/* Brand Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-indigo)" }}>
            <Sparkles size={24} className="glow-text" />
            <h1 style={{ fontSize: 22, tracking: "tight" }}>PrepEdge</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4, textTransform: "uppercase", letterSpacing: 2 }}>
            Senior AI Platform
          </p>
        </div>

        {/* User Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-glass)",
          borderRadius: 8, padding: 12, display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "var(--color-indigo)",
            display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", color: "white"
          }}>
            <User size={16} />
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <span className={`badge badge-${user.plan}`} style={{ marginTop: 2 }}>{user.plan}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { id: "roadmap", label: "Syllabus Roadmap", icon: <CheckSquare size={18} /> },
            { id: "coach", label: "AI Study Coach", icon: <MessageSquare size={18} /> },
            { id: "interviews", label: "Mock Interviews", icon: <Award size={18} /> },
            { id: "dsa", label: "DSA Practice", icon: <Code size={18} /> },
            { id: "gap", label: "Gap Analytics", icon: <TrendingUp size={18} /> },
            { id: "plan", label: "Practice Scheduler", icon: <BookOpen size={18} /> },
            { id: "settings", label: "Subscriptions", icon: <Settings size={18} /> }
          ].map(link => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setSelectedProblem(null);
              }}
              className={`sidebar-link ${activeTab === link.id ? "active" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}

          {/* ADMIN LINK (Conditional) */}
          {user.admin && (
            <button
              onClick={() => {
                setActiveTab("admin");
                setSelectedProblem(null);
              }}
              className={`sidebar-link ${activeTab === "admin" ? "active" : ""}`}
              style={{ border: "1px solid rgba(245,158,11,0.2)", color: "#fcd34d" }}
            >
              <Star size={18} style={{ color: "#fbbf24" }} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ width: "100%", justifyContent: "center", color: "var(--color-rose)" }}
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: 40, overflowY: "auto", position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", top: 40, right: 40, display: "flex", alignItems: "center", gap: 8,
            color: "var(--text-secondary)", fontSize: 12
          }}>
            <RefreshCw className="glow-text" size={14} style={{ animation: "pulseGlow 1.5s infinite" }} />
            Syncing...
          </div>
        )}

        {/* ========================================================
            TAB: DASHBOARD
            ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Dashboard Overview</h2>
              <p style={{ color: "var(--text-secondary)" }}>Track your senior prep metrics and study logs in real-time.</p>
            </div>

            {/* Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              <div className="glass-card">
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Roadmap Progress</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-indigo)", marginTop: 6 }}>{getProgressPercentage()}%</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  {checklistItems.filter(i => i.completed).length} of {checklistItems.length} tasks completed
                </div>
              </div>
              <div className="glass-card">
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Time Solved</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-emerald)", marginTop: 6 }}>
                  {Math.round(getLogSummaryMinutes() / 60)} hrs
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  Logged {getLogSummaryMinutes()} minutes total
                </div>
              </div>
              <div className="glass-card">
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>DSA Problems Solved</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-sky)", marginTop: 6 }}>
                  {problems.filter(p => p.status === "solved").length}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  Of {problems.length} pre-seeded problems
                </div>
              </div>
              <div className="glass-card">
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Mock Interview average</div>
                <div style={{
                  fontSize: 32, fontWeight: 800,
                  color: mockInterviews.length > 0 ? "var(--color-amber)" : "var(--text-muted)",
                  marginTop: 6
                }}>
                  {mockInterviews.length > 0 ? `${Math.round(mockInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / mockInterviews.length)}%` : "N/A"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  Across {mockInterviews.length} completed interviews
                </div>
              </div>
            </div>

            {/* In-Depth Row */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 25 }}>
              {/* Daily Logger */}
              <div className="glass-card">
                <h3 style={{ fontSize: 18, marginBottom: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={18} style={{ color: "var(--color-indigo)" }} /> Log Today's Study Hours
                </h3>
                <form onSubmit={logStudyTime} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
                    {[
                      { field: "dsa", label: "DSA (min)", color: "var(--color-indigo)" },
                      { field: "sd", label: "Sys Design (min)", color: "var(--color-sky)" },
                      { field: "lld", label: "LLD (min)", color: "var(--color-emerald)" },
                      { field: "ai", label: "AI Eng (min)", color: "var(--color-amber)" }
                    ].map(col => (
                      <div key={col.field}>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>{col.label}</label>
                        <input
                          type="number"
                          value={logForm[col.field]}
                          onChange={(e) => setLogForm({ ...logForm, [col.field]: parseInt(e.target.value) || 0 })}
                          className="input-field"
                          min="0"
                          max="480"
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end" }}>
                    Log Study Session
                  </button>
                </form>

                {/* Recent logs */}
                <h4 style={{ fontSize: 13, marginTop: 25, color: "var(--text-secondary)", textTransform: "uppercase" }}>Recent Logs</h4>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {studyLogs.slice(0, 4).map(log => (
                    <div key={log.id} style={{
                      display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 8, fontSize: 13
                    }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{log.date}</span>
                      <div style={{ display: "flex", gap: 12, color: "var(--text-secondary)" }}>
                        {log.dsa_minutes > 0 && <span>DSA: {log.dsa_minutes}m</span>}
                        {log.sd_minutes > 0 && <span>System: {log.sd_minutes}m</span>}
                        {log.lld_minutes > 0 && <span>LLD: {log.lld_minutes}m</span>}
                        {log.ai_minutes > 0 && <span>AI: {log.ai_minutes}m</span>}
                      </div>
                    </div>
                  ))}
                  {studyLogs.length === 0 && (
                    <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>No study hours logged yet. Add your first log above!</p>
                  )}
                </div>
              </div>

              {/* Active Profile Info */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <h3 style={{ fontSize: 18 }}>Prepping Status</h3>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Selected Track</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-indigo)", marginTop: 2 }}>
                    {profile.current_track === "SWE" ? "6-Month SWE Roadmap" : profile.current_track === "AI" ? "3-Month AI Engineer Roadmap" : "6-Month Hybrid Track"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Years of Experience</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{profile.years_experience} Years (Senior Level)</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Target Companies</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {profile.target_companies.map((c, idx) => (
                      <span key={idx} style={{
                        background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                        color: "var(--text-primary)", fontSize: 11, padding: "3px 8px", borderRadius: 4, fontWeight: 600
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{
                  borderTop: "1px solid var(--border-glass)", paddingTop: 15, marginTop: "auto",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <Zap size={18} style={{ color: "var(--color-amber)" }} />
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Upgrading unlocks auto-generated plans and infinite AI coach support. Check out Subscriptions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: ROADMAP CHECKLIST
            ======================================================== */}
        {activeTab === "roadmap" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800 }}>Roadmap Syllabus</h2>
                <p style={{ color: "var(--text-secondary)" }}>Review targets week-by-week and check off your completed milestones.</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["SWE", "AI", "HYBRID"].map(t => (
                  <button
                    key={t}
                    onClick={async () => {
                      setLoading(true);
                      await fetchAuth(`/api/v1/checklist_items/bulk_create?track=${t}`, { method: "POST" });
                      await fetchProfile();
                      await fetchChecklist();
                      setLoading(false);
                    }}
                    className={`btn-secondary ${profile.current_track === t ? "active" : ""}`}
                    style={{
                      background: profile.current_track === t ? "var(--color-indigo)" : "",
                      borderColor: profile.current_track === t ? "var(--color-indigo)" : ""
                    }}
                  >
                    {t} Track
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist items by Month */}
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {Object.entries(checklistItems.reduce((acc, item) => {
                acc[item.month] = acc[item.month] || [];
                acc[item.month].push(item);
                return acc;
              }, {})).map(([month, items]) => {
                const monthTitle = profile.current_track === "SWE"
                  ? ["Month 1: Foundation & Assessment", "Month 2: DSA Patterns & Advanced Structures", "Month 3: System Design & LLD", "Month 4: Deep System Design & Concurrency", "Month 5: Integration & Mock Interviews", "Month 6: Company Specifics & Behavioral"][month - 1]
                  : profile.current_track === "AI"
                  ? ["Phase 1: Context Mechanics & Probabilistic Infrastructure", "Phase 2: Standardizing Tool Integration via MCP", "Phase 3: Automated Evals, Observability & Design"][month - 1]
                  : `Month ${month} Milestone Track`;

                const monthColor = ["#6366f1", "#8b5cf6", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444"][month - 1] || "#6366f1";
                const isExpanded = expandedWeeks[month] !== false;

                return (
                  <div key={month} style={{ border: `1px solid ${monthColor}22`, borderRadius: 12, overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedWeeks({ ...expandedWeeks, [month]: !isExpanded })}
                      style={{
                        width: "100%", background: `${monthColor}0c`, border: "none", cursor: "pointer",
                        padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        color: "white"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 6, background: monthColor,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: 800, fontSize: 13
                        }}>
                          M{month}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{monthTitle}</span>
                      </div>
                      <span style={{ color: monthColor }}>{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: 20, background: "rgba(10,10,20,0.4)", display: "flex", flexDirection: "column", gap: 10 }}>
                        {items.map(item => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklist(item.id)}
                            style={{
                              display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px",
                              background: item.completed ? "rgba(16, 185, 129, 0.03)" : "rgba(255,255,255,0.01)",
                              border: `1px solid ${item.completed ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.03)"}`,
                              borderRadius: 8, cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.completed ? "var(--color-emerald)" : "#3a3a5c"}`,
                              background: item.completed ? "var(--color-emerald)" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, marginTop: 2
                            }}>
                              {item.completed ? "✓" : ""}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{
                                color: monthColor, fontSize: 11, fontWeight: 700, letterSpacing: 1,
                                display: "inline-block", background: `${monthColor}15`, padding: "2px 6px", borderRadius: 4, marginRight: 8
                              }}>
                                {item.week_label}
                              </span>
                              <span style={{
                                fontSize: 14, color: item.completed ? "var(--text-secondary)" : "var(--text-primary)",
                                textDecoration: item.completed ? "line-through" : "none"
                              }}>
                                {item.item_text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: AI STUDY COACH
            ======================================================== */}
        {activeTab === "coach" && (
          <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 25, height: "calc(100vh - 120px)" }}>
            {/* Session Sidebar */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15, padding: 15, overflowY: "auto" }}>
              <button onClick={() => createCoachSession()} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <Sparkles size={16} /> New Coaching Session
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <h4 style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Previous Sessions</h4>
                {coachSessions.map(sess => (
                  <button
                    key={sess.id}
                    onClick={() => selectCoachSession(sess.id)}
                    style={{
                      width: "100%", background: activeSession?.id === sess.id ? "rgba(99,102,241,0.1)" : "transparent",
                      border: `1px solid ${activeSession?.id === sess.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.03)"}`,
                      borderRadius: 6, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13,
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sess.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{new Date(sess.created_at).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>
              {activeSession ? (
                <>
                  {/* Chat Header */}
                  <div style={{
                    padding: "15px 20px", borderBottom: "1px solid var(--border-glass)",
                    background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <h3 style={{ fontSize: 16 }}>{activeSession.title}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: 11 }}>Connected to Socratic Coach (RAG Activated)</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                    {sessionMessages.map((msg, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex", flexDirection: "column",
                          alignItems: msg.sender === "user" ? "flex-end" : "flex-start"
                        }}
                      >
                        <div style={{
                          maxWidth: "80%", padding: "14px 18px", borderRadius: 12, fontSize: 14,
                          background: msg.sender === "user" ? "var(--color-indigo)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${msg.sender === "user" ? "rgba(255,255,255,0.1)" : "var(--border-glass)"}`,
                          color: "white", whiteSpace: "pre-wrap"
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, padding: "0 4px" }}>
                          {msg.sender === "user" ? "You" : "Coach"}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={sendCoachMessage} style={{
                    padding: 20, borderTop: "1px solid var(--border-glass)",
                    background: "rgba(255,255,255,0.01)", display: "flex", gap: 10
                  }}>
                    <input
                      type="text"
                      placeholder={user.plan === "free" ? "Upgrade to PRO or TEAM for unlimited AI Coach messages..." : "Ask your coach about CAP theorem, consistent hashing, SOLID, or MCP..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="input-field"
                      disabled={user.plan === "free"}
                    />
                    <button type="submit" className="btn-primary" disabled={user.plan === "free"}>
                      <Send size={16} /> Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 15 }}>
                  <MessageSquare size={48} style={{ color: "var(--text-muted)" }} />
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Create or select a session to start talking with the Coach.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: MOCK INTERVIEWS
            ======================================================== */}
        {activeTab === "interviews" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Mock Interview Simulator</h2>
              <p style={{ color: "var(--text-secondary)" }}>Conduct interactive practice sessions graded against professional rubrics.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
              {/* Simulator Card */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {activeInterview ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-pro" style={{ background: "rgba(139,92,246,0.15)", color: "#c084fc" }}>
                        Active: {activeInterview.interview_type.toUpperCase()} Round
                      </span>
                      <button
                        onClick={() => setActiveInterview(null)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                      >
                        Quit
                      </button>
                    </div>

                    {/* Chat log within interview */}
                    <div style={{
                      background: "#090911", border: "1px solid #1b1b32", borderRadius: 8, padding: 16,
                      height: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14
                    }}>
                      {activeInterview.transcript.map((turn, index) => (
                        <div key={index} style={{ fontSize: 13 }}>
                          <strong style={{ color: turn.role === "interviewer" ? "var(--color-indigo)" : "var(--color-emerald)" }}>
                            {turn.role === "interviewer" ? "Interviewer: " : "You: "}
                          </strong>
                          <span style={{ color: "white" }}>{turn.content}</span>
                        </div>
                      ))}
                    </div>

                    {activeInterview.status === "in_progress" ? (
                      <form onSubmit={submitInterviewAnswer} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <textarea
                          placeholder="Type your response here..."
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          className="input-field"
                          style={{ height: 100, resize: "none" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> Complete all follow-up turns to trigger rubric grading
                          </span>
                          <button type="submit" className="btn-primary">
                            Submit Answer
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <h4 style={{ color: "var(--color-emerald)", fontSize: 18 }}>Interview Completed!</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 6 }}>
                          Rubric feedback and overall score of <strong>{activeInterview.score}%</strong> has been recorded.
                        </p>

                        {/* SHARE BUTTON */}
                        <div style={{ marginTop: 15, display: "flex", gap: 10, justifyContent: "center" }}>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/?shared=${activeInterview.share_token}`;
                              navigator.clipboard.writeText(shareUrl);
                              showNotification("Public share link copied to clipboard!");
                            }}
                            className="btn-primary"
                            style={{ background: "var(--color-sky)", boxShadow: "none" }}
                          >
                            <Share2 size={14} /> Copy Public Share Link
                          </button>
                          <button
                            onClick={() => {
                              setActiveInterview(null);
                              fetchMockInterviews();
                            }}
                            className="btn-secondary"
                          >
                            Close Simulator
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: 18 }}>Start a New Session</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Select Round Type</label>
                        <select
                          value={interviewType}
                          onChange={(e) => setInterviewType(e.target.value)}
                          className="input-field"
                        >
                          <option value="dsa">DSA (Data Structures & Algorithms)</option>
                          <option value="system_design">System Design (High-Level Design)</option>
                          <option value="behavioral">Behavioral (STAR & Leadership)</option>
                        </select>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)", borderRadius: 6, padding: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                        <strong>Evaluation Rubrics:</strong>
                        <ul style={{ paddingLeft: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                          <li>DSA: Correctness, time-space complexity, optimization logic.</li>
                          <li>System Design: Scale bounds, consistency trade-offs, observability patterns.</li>
                          <li>Behavioral: Core STAR structure, resolution metrics, engineering ownership.</li>
                        </ul>
                      </div>

                      <button onClick={startMockInterview} className="btn-primary" style={{ justifyContent: "center" }}>
                        <Play size={16} /> Enter Interview Simulator
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* History & Evaluation Cards */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15, overflowY: "auto", maxHeight: 440 }}>
                <h3 style={{ fontSize: 18 }}>Previous Interview Evaluations</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {mockInterviews.map(i => (
                    <div key={i.id} style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-glass)",
                      padding: 15, borderRadius: 8, display: "flex", flexDirection: "column", gap: 10
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                          {i.interview_type.toUpperCase()} Interview
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(i.created_at).toLocaleDateString()}</span>
                          <span style={{
                            fontWeight: 800, fontSize: 15,
                            color: i.score >= 80 ? "var(--color-emerald)" : i.score >= 60 ? "var(--color-amber)" : "var(--color-rose)"
                          }}>
                            {i.score}%
                          </span>
                        </div>
                      </div>

                      {i.eval_result && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 4, fontSize: 11 }}>
                          <div style={{ display: "flex", gap: 10 }}>
                            <span style={{ color: "var(--text-secondary)" }}>Groundedness: <strong>{i.eval_result.groundedness}</strong></span>
                            <span style={{ color: "var(--text-secondary)" }}>Relevance: <strong>{i.eval_result.relevance}</strong></span>
                          </div>

                          {/* PUBLIC SHARE ACTIONS */}
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/?shared=${i.share_token}`;
                              navigator.clipboard.writeText(shareUrl);
                              showNotification("Link copied! Anyone can view this report.");
                            }}
                            style={{ background: "none", border: "none", color: "var(--color-sky)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}
                          >
                            <Share2 size={12} /> Share Report
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {mockInterviews.length === 0 && (
                    <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                      No mock interviews completed yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: DSA PRACTICE
            ======================================================== */}
        {activeTab === "dsa" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            {!selectedProblem ? (
              <>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800 }}>DSA Practice Hub</h2>
                  <p style={{ color: "var(--text-secondary)" }}>Solve curated senior-level problems and request incremental Socratic hints.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                  {problems.map(prob => (
                    <div key={prob.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 6px", borderRadius: 4,
                          background: prob.difficulty === "Easy" ? "rgba(16,185,129,0.1)" : prob.difficulty === "Medium" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                          color: prob.difficulty === "Easy" ? "var(--color-emerald)" : prob.difficulty === "Medium" ? "var(--color-amber)" : "var(--color-rose)"
                        }}>
                          {prob.difficulty}
                        </span>
                        <span className={`badge badge-${prob.status === 'solved' ? 'pro' : 'free'}`} style={{
                          background: prob.status === 'solved' ? 'rgba(16,185,129,0.15)' : '',
                          color: prob.status === 'solved' ? '#34d399' : ''
                        }}>
                          {prob.status}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16 }}>{prob.title}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>Topic: {prob.topic} · {prob.source}</p>
                      <button
                        onClick={() => selectProblem(prob.slug)}
                        className="btn-secondary"
                        style={{ marginTop: 10, justifyContent: "center" }}
                      >
                        Open Editor
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Back Link */}
                <button
                  onClick={() => setSelectedProblem(null)}
                  className="btn-secondary"
                  style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: 12 }}
                >
                  ← Back to problem list
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 25 }}>
                  {/* Left Column: Description & Code Editor */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="glass-card">
                      <h2 style={{ fontSize: 22 }}>{selectedProblem.title}</h2>
                      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                        {selectedProblem.topic} · {selectedProblem.source}
                      </p>
                      <p style={{ color: "white", fontSize: 14, marginTop: 12 }}>{selectedProblem.description}</p>
                    </div>

                    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={14} /> Timer: {Math.floor(problemTimer / 60)}m {problemTimer % 60}s
                        </span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={submitProblemCode} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
                            Run Compiler
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={codeEditor}
                        onChange={(e) => setCodeEditor(e.target.value)}
                        className="mock-editor"
                      />
                      <label style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 5 }}>Complexity Analysis Notes</label>
                      <textarea
                        placeholder="Write down your time and space complexity analysis (e.g. O(N) time, O(1) space)..."
                        value={notesEditor}
                        onChange={(e) => setNotesEditor(e.target.value)}
                        className="input-field"
                        style={{ height: 60, resize: "none", fontSize: 12 }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Socratic Hints */}
                  <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    <h3 style={{ fontSize: 18, color: "var(--color-amber)" }}>Socratic Helper</h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      Don't spoil the answer! Click below to request gradual nudges.
                    </p>

                    {[
                      { level: 1, label: "Level 1: Pattern Nudge" },
                      { level: 2, label: "Level 2: Approach Hint" },
                      { level: 3, label: "Level 3: Code Walkthrough" }
                    ].map(h => (
                      <div key={h.level} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: 15 }}>
                        <button
                          onClick={() => requestSocraticHint(h.level)}
                          className="btn-secondary"
                          style={{ width: "100%", justifyContent: "space-between", fontSize: 12 }}
                        >
                          <span>{h.label}</span>
                          <span style={{ color: "var(--color-amber)" }}>Unlock</span>
                        </button>
                        {hintsRequested[h.level] && (
                          <div className="hint-box" style={{ fontSize: 13, color: "white", marginTop: 8 }}>
                            {hintsRequested[h.level]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: GAP ANALYTICS
            ======================================================== */}
        {activeTab === "gap" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800 }}>Gap Analysis</h2>
                <p style={{ color: "var(--text-secondary)" }}>Identify architectural weaknesses and track system-wide competencies.</p>
              </div>
              <button onClick={triggerGapAnalysis} className="btn-primary" disabled={analyzing}>
                {analyzing ? "Analyzing logs..." : "Sync & Run Analysis"}
              </button>
            </div>

            {/* Ratings Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 25 }}>
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <h3 style={{ fontSize: 18 }}>Topic Competency Ratings</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {Object.entries(gapData.ratings).map(([topic, val]) => (
                    <div key={topic}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ fontWeight: 600 }}>{topic}</span>
                        <span style={{ color: "var(--color-indigo)" }}>{val}%</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${val}%`, height: "100%", borderRadius: 4,
                          background: val >= 80 ? "var(--color-emerald)" : val >= 60 ? "var(--color-amber)" : "var(--color-rose)"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Narrative */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <h3 style={{ fontSize: 18, color: "var(--color-indigo)" }}>Coaching Critique Narrative</h3>
                <div style={{
                  background: "rgba(99,102,241,0.04)", borderLeft: "4px solid var(--color-indigo)",
                  padding: 15, borderRadius: "0 8px 8px 0", fontSize: 13, lineHeight: 1.6
                }}>
                  {gapData.recommendation_critique}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "auto" }}>
                  Last Analyzed At: {gapData.last_analyzed_at || "Never"}
                </div>
              </div>
            </div>

            {/* Trajectory table */}
            <div className="glass-card">
              <h3 style={{ fontSize: 18, marginBottom: 15 }}>Mock Interview Trajectory Logs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {gapData.scores_trajectory.map((t, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 8, fontSize: 13
                  }}>
                    <div>
                      <strong style={{ color: "white" }}>{t.type.toUpperCase()} Interview</strong>
                      <span style={{ color: "var(--text-muted)", marginLeft: 10 }}>{t.date}</span>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      color: t.score >= 80 ? "var(--color-emerald)" : t.score >= 60 ? "var(--color-amber)" : "var(--color-rose)"
                    }}>
                      {t.score}%
                    </span>
                  </div>
                ))}
                {gapData.scores_trajectory.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                    No mock interview trajectory history found. Complete a mock interview round to update this timeline.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: PRACTICE SCHEDULER
            ======================================================== */}
        {activeTab === "plan" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Adaptive Practice Scheduler</h2>
              <p style={{ color: "var(--text-secondary)" }}>Input your criteria to compile a customized week-by-week practice schedule.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 25 }}>
              {/* Form Input */}
              <div className="glass-card" style={{ alignSelf: "flex-start" }}>
                <h3 style={{ fontSize: 18, marginBottom: 15 }}>Tuning Parameters</h3>
                <form onSubmit={generatePracticePlan} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Select Track</label>
                    <select
                      value={planForm.track}
                      onChange={(e) => setPlanForm({ ...planForm, track: e.target.value })}
                      className="input-field"
                    >
                      <option value="SWE">6-Month SWE</option>
                      <option value="AI">3-Month AI Engineer</option>
                      <option value="HYBRID">6-Month Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Years of Experience</label>
                    <input
                      type="number"
                      value={planForm.experience}
                      onChange={(e) => setPlanForm({ ...planForm, experience: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                      max="30"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Target Companies (comma separated)</label>
                    <input
                      type="text"
                      value={planForm.companies}
                      onChange={(e) => setPlanForm({ ...planForm, companies: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Commitment (hours/week)</label>
                    <input
                      type="number"
                      value={planForm.hours}
                      onChange={(e) => setPlanForm({ ...planForm, hours: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="5"
                      max="80"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ justifyContent: "center" }}>
                    Compile Custom Plan
                  </button>
                </form>
              </div>

              {/* Render Plan */}
              {customPlan ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="glass-card">
                    <h3 style={{ fontSize: 18 }}>Schedule Summary</h3>
                    <p style={{ color: "var(--color-indigo)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>{customPlan.company_notes}</p>
                    <div style={{ display: "flex", gap: 15, marginTop: 15 }}>
                      {[
                        { label: "DSA Ratio", val: customPlan.dsa_ratio, color: "var(--color-indigo)" },
                        { label: "System Design Ratio", val: customPlan.system_design_ratio, color: "var(--color-sky)" },
                        { label: "LLD Ratio", val: customPlan.lld_ratio, color: "var(--color-emerald)" }
                      ].map(bar => (
                        <div key={bar.label} style={{ flex: 1 }}>
                          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{bar.label}: {bar.val}%</span>
                          <div style={{ background: "rgba(255,255,255,0.03)", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                            <div style={{ width: `${bar.val}%`, height: "100%", background: bar.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {customPlan.weeks.map(w => (
                      <div key={w.week} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "white" }}>
                            {w.duration} — {w.topic}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Week {w.week}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{w.details}</p>

                        <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                          {Object.entries(w.hours).map(([cat, val]) => (
                            <span key={cat} style={{ fontSize: 10, color: "var(--text-muted)" }}>
                              {cat.toUpperCase()}: {val}%
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic" }}>
                    Configure the tuning parameters to compile your custom weekly milestones schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: SUBSCRIPTIONS / SETTINGS
            ======================================================== */}
        {activeTab === "settings" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Subscription Plans</h2>
              <p style={{ color: "var(--text-secondary)" }}>Manage your account subscription status and upgrade capabilities.</p>
            </div>

            {/* Tiers Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {/* Free Tier */}
              <div className="glass-card" style={{
                display: "flex", flexDirection: "column", gap: 20,
                border: user.plan === "free" ? "2px solid var(--color-indigo)" : "1px solid var(--border-glass)"
              }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>Free Tier</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>$0<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/mo</span></div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>Standard template roadmaps.</p>
                </div>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8, paddingLeft: 16 }}>
                  <li>Roadmap tracks template access</li>
                  <li>10 AI coach messages/mo</li>
                  <li>1 Mock interview limit</li>
                  <li>Socratic hints access</li>
                </ul>
                <button
                  onClick={() => handleUpgrade("free")}
                  disabled={user.plan === "free"}
                  className="btn-secondary"
                  style={{ marginTop: "auto", justifyContent: "center" }}
                >
                  {user.plan === "free" ? "Current Plan" : "Downgrade"}
                </button>
              </div>

              {/* Pro Tier */}
              <div className="glass-card" style={{
                display: "flex", flexDirection: "column", gap: 20,
                border: user.plan === "pro" ? "2px solid var(--color-indigo)" : "1px solid var(--border-glass)",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute", top: -10, right: 15, background: "var(--color-indigo)",
                  color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4
                }}>
                  RECOMMENDED
                </div>
                <div>
                  <h3 style={{ fontSize: 20 }}>Pro Plan</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>$19<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/mo</span></div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>Unlimited AI coach and detailed evals.</p>
                </div>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8, paddingLeft: 16 }}>
                  <li>All syllabus roadmap tracks</li>
                  <li><strong>Unlimited</strong> AI coach support</li>
                  <li><strong>10</strong> mock interviews/mo</li>
                  <li>Socratic hints access</li>
                  <li>Gap Analytics + narratives</li>
                </ul>
                <button
                  onClick={() => handleUpgrade("pro")}
                  className="btn-primary"
                  style={{ marginTop: "auto", justifyContent: "center" }}
                >
                  {user.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
                </button>
              </div>

              {/* Team Tier */}
              <div className="glass-card" style={{
                display: "flex", flexDirection: "column", gap: 20,
                border: user.plan === "team" ? "2px solid var(--color-indigo)" : "1px solid var(--border-glass)"
              }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>Team License</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>$49<span style={{ fontSize: 14, color: "var(--text-muted)" }}>/mo</span></div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>Custom dashboards & corporate knowledge.</p>
                </div>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8, paddingLeft: 16 }}>
                  <li>All Pro features included</li>
                  <li><strong>Unlimited</strong> mock interviews</li>
                  <li>Org knowledge base embedding</li>
                  <li>Team progress aggregates</li>
                </ul>
                <button
                  onClick={() => handleUpgrade("team")}
                  className="btn-primary"
                  style={{ marginTop: "auto", justifyContent: "center", background: "var(--color-emerald)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
                >
                  {user.plan === "team" ? "Current Plan" : "Upgrade to Team"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: ADMIN PANEL
            ======================================================== */}
        {activeTab === "admin" && user.admin && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 25 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fcd34d" }}>Admin Dashboard</h2>
              <p style={{ color: "var(--text-secondary)" }}>Manage users, maintain coding problems, update RAG corpus, and track system health.</p>
            </div>

            {/* Admin sub tabs */}
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border-glass)", paddingBottom: 10 }}>
              {[
                { id: "metrics", label: "System Metrics" },
                { id: "users", label: "Manage Users" },
                { id: "problems", label: "DSA Problems" },
                { id: "chunks", label: "RAG Context" }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setAdminTab(sub.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: adminTab === sub.id ? "var(--color-indigo)" : "transparent",
                    color: adminTab === sub.id ? "white" : "var(--text-secondary)",
                    transition: "all 0.15s"
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* SUBTAB: SYSTEM METRICS */}
            {adminTab === "metrics" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                <div className="glass-card">
                  <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Total Registered Users</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-indigo)", marginTop: 6 }}>{systemMetrics.total_users}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    {systemMetrics.pro_users} Pro · {systemMetrics.team_users} Team accounts
                  </div>
                </div>
                <div className="glass-card">
                  <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>System Logged Hours</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-emerald)", marginTop: 6 }}>{systemMetrics.total_study_hours} hrs</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    Aggregated logged time across all user profiles
                  </div>
                </div>
                <div className="glass-card">
                  <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Completed Mock Rounds</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "var(--color-amber)", marginTop: 6 }}>{systemMetrics.total_interviews}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                    Average performance rating: {systemMetrics.average_interview_score}%
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: MANAGE USERS */}
            {adminTab === "users" && (
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-glass)", color: "var(--text-secondary)" }}>
                      <th style={{ padding: "12px 20px" }}>Name / Email</th>
                      <th style={{ padding: "12px 20px" }}>Admin</th>
                      <th style={{ padding: "12px 20px" }}>Experience</th>
                      <th style={{ padding: "12px 20px" }}>Subscription Tier</th>
                      <th style={{ padding: "12px 20px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ color: u.admin ? "var(--color-amber)" : "var(--text-muted)" }}>
                            {u.admin ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px" }}>{u.profile?.years_experience || 0} yrs</td>
                        <td style={{ padding: "12px 20px" }}>
                          <select
                            value={u.plan}
                            onChange={(e) => updateAdminUserPlan(u.id, e.target.value)}
                            className="input-field"
                            style={{ width: 100, padding: 4 }}
                          >
                            <option value="free">free</option>
                            <option value="pro">pro</option>
                            <option value="team">team</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <button
                            onClick={() => deleteAdminUser(u.id)}
                            style={{ background: "none", border: "none", color: "var(--color-rose)", cursor: "pointer" }}
                            title="Delete User Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUBTAB: DSA PROBLEMS */}
            {adminTab === "problems" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 25 }}>
                {/* Form */}
                <div className="glass-card">
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Create Practice Question</h3>
                  <form onSubmit={createAdminProblem} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Title</label>
                        <input
                          type="text" required placeholder="e.g. LFU Cache"
                          value={adminProblemForm.title}
                          onChange={(e) => setAdminProblemForm({ ...adminProblemForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Slug</label>
                        <input
                          type="text" required placeholder="lfu-cache"
                          value={adminProblemForm.slug}
                          onChange={(e) => setAdminProblemForm({ ...adminProblemForm, slug: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Difficulty</label>
                        <select
                          value={adminProblemForm.difficulty}
                          onChange={(e) => setAdminProblemForm({ ...adminProblemForm, difficulty: e.target.value })}
                          className="input-field"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Topic</label>
                        <input
                          type="text" required placeholder="e.g. Heaps"
                          value={adminProblemForm.topic}
                          onChange={(e) => setAdminProblemForm({ ...adminProblemForm, topic: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Problem Description</label>
                      <textarea
                        required placeholder="Write detailed instructions..."
                        value={adminProblemForm.description}
                        onChange={(e) => setAdminProblemForm({ ...adminProblemForm, description: e.target.value })}
                        className="input-field"
                        style={{ height: 80, resize: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Starter Code Template</label>
                      <textarea
                        required placeholder="def solution(args)\n  \nend"
                        value={adminProblemForm.starter_code}
                        onChange={(e) => setAdminProblemForm({ ...adminProblemForm, starter_code: e.target.value })}
                        className="input-field"
                        style={{ height: 80, fontFamily: "var(--font-mono)", fontSize: 12 }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: 5 }}>
                      <Plus size={16} /> Add Problem to Database
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="glass-card" style={{ overflowY: "auto", maxHeight: 480 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Seeded DSA Challenges</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {adminProblems.map(p => (
                      <div key={p.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-glass)",
                        padding: "10px 14px", borderRadius: 8, fontSize: 13
                      }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.title}</div>
                          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.topic} · {p.difficulty}</span>
                        </div>
                        <button
                          onClick={() => deleteAdminProblem(p.id)}
                          style={{ background: "none", border: "none", color: "var(--color-rose)", cursor: "pointer" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: RAG CONTEXT */}
            {adminTab === "chunks" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 25 }}>
                {/* Form */}
                <div className="glass-card">
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Create RAG Knowledge Document</h3>
                  <form onSubmit={createAdminChunk} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Category</label>
                      <select
                        value={adminChunkForm.source_type}
                        onChange={(e) => setAdminChunkForm({ ...adminChunkForm, source_type: e.target.value })}
                        className="input-field"
                      >
                        <option value="system_design">System Design</option>
                        <option value="lld">Low-Level Design</option>
                        <option value="dsa">DSA Guide</option>
                        <option value="ai">AI / LLMOps Architecture</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Title</label>
                      <input
                        type="text" required placeholder="e.g. Kafka Partition Scaling"
                        value={adminChunkForm.title}
                        onChange={(e) => setAdminChunkForm({ ...adminChunkForm, title: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)" }}>Document Text Content</label>
                      <textarea
                        required placeholder="Write detailed educational reference text..."
                        value={adminChunkForm.content}
                        onChange={(e) => setAdminChunkForm({ ...adminChunkForm, content: e.target.value })}
                        className="input-field"
                        style={{ height: 160, resize: "vertical" }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ justifyContent: "center" }}>
                      <Plus size={16} /> Save to Knowledge Corpus
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="glass-card" style={{ overflowY: "auto", maxHeight: 480 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Knowledge Corpus Chunks</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {adminChunks.map(c => (
                      <div key={c.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-glass)",
                        padding: "12px 14px", borderRadius: 8, fontSize: 13
                      }}>
                        <div style={{ flex: 1, paddingRight: 10 }}>
                          <div style={{ fontWeight: 700 }}>{c.title}</div>
                          <div style={{ fontSize: 10, color: "var(--color-indigo)", textTransform: "uppercase", marginTop: 2 }}>{c.source_type}</div>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {c.content}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAdminChunk(c.id)}
                          style={{ background: "none", border: "none", color: "var(--color-rose)", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
