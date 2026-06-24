import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  Gamepad2,
  Users,
  Trophy,
  BookOpen,
  FileCode,
  BarChart3,
  User,
  Award,
  Settings,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Plus,
  Filter,
  ChevronRight,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Download,
  Image,
  RefreshCw,
  Trash2,
  Lock,
  LogOut,
  ShieldCheck,
  Check,
} from "lucide-react";

import { Student, Submission, Scenario } from "./types";
import {
  INITIAL_STUDENTS,
  INITIAL_SUBMISSIONS,
  KHO_TINH_HUONG,
  MINI_QUIZ,
  BADGES_LIST,
} from "./data";

import {
  dbGetStudents,
  dbUpsertStudent,
  dbDeleteStudent,
  dbGetSubmissions,
  dbUpsertSubmission,
  dbDeleteSubmission,
  dbGetScenarios,
  dbUpsertScenario,
  dbDeleteScenario,
} from "./lib/supabase";

import { Snowfall } from "./components/Snowfall";
import { AIChatBot } from "./components/AIChatBot";
import { AdminPanel } from "./components/AdminPanel";

export default function App() {
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [activeTab, setActiveTab] = useState<string>("trang-chu");

  // State Management
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("gdcd_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem("gdcd_submissions");
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem("gdcd_scenarios");
    return saved ? JSON.parse(saved) : KHO_TINH_HUONG;
  });

  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("gdcd_admin_logged") === "true";
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  const currentStudentId = "HS001";
  const currentStudent = useMemo(() => {
    const found = students.find((s) => s.id === currentStudentId) || students[0];
    if (found) return found;
    return {
      id: "HS001",
      name: "Học sinh danh dự",
      class: "9A1",
      points: 100,
      badges: [],
      history: [],
    };
  }, [students, currentStudentId]);

  // Quiz game state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<any | null>(null);
  const [quizMessage, setQuizMessage] = useState<string>("");

  // Roleplay Moot Court simulation state
  const [mootCourtActive, setMootCourtActive] = useState<boolean>(false);
  const [mootRole, setMootRole] = useState<"judge" | "prosecutor" | "defense" | null>(null);
  const [mootStep, setMootStep] = useState<number>(0);
  const [mootPoints, setMootPoints] = useState<number>(0);
  const [mootVerdict, setMootVerdict] = useState<string>("");

  // Scenario case study solving state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("TH001");
  const [scenarioAnswered, setScenarioAnswered] = useState<boolean>(false);
  const [scenarioFeedback, setScenarioFeedback] = useState<string>("");
  const [scenarioScoreAdded, setScenarioScoreAdded] = useState<number>(0);

  // AI Poster generator state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");

  // New product submission state
  const [newProdTitle, setNewProdTitle] = useState<string>("");
  const [newProdType, setNewProdType] = useState<string>("Poster");
  const [newProdDesc, setNewProdDesc] = useState<string>("");
  const [newProdContent, setNewProdContent] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Teacher actions state
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(90);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [gradingBadge, setGradingBadge] = useState<string>("");

  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<"connecting" | "success" | "offline">("connecting");
  const prevStudentsRef = useRef<Student[]>([]);
  const prevSubmissionsRef = useRef<Submission[]>([]);
  const prevScenariosRef = useRef<Scenario[]>([]);

  // Load initial data from Supabase on mount
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        setSupabaseSyncStatus("connecting");
        
        const [fetchedStudents, fetchedSubmissions, fetchedScenarios] = await Promise.all([
          dbGetStudents(),
          dbGetSubmissions(),
          dbGetScenarios(),
        ]);

        setStudents(fetchedStudents);
        setSubmissions(fetchedSubmissions);
        setScenarios(fetchedScenarios);
        
        // Initialize refs to fetched data so we don't trigger initial insert changes
        prevStudentsRef.current = fetchedStudents;
        prevSubmissionsRef.current = fetchedSubmissions;
        prevScenariosRef.current = fetchedScenarios;
        
        setSupabaseSyncStatus("success");
        showToast("🟢 Đã đồng bộ dữ liệu trực tuyến với Supabase thành công!");
      } catch (err) {
        console.warn("Không kết nối được Supabase, chuyển sang chế độ Local/Offline:", err);
        setSupabaseSyncStatus("offline");
        showToast("🟡 Hệ thống đang hoạt động ở chế độ lưu trữ Local Offline.");
        
        // Fallback: initialize refs from current states
        prevStudentsRef.current = students;
        prevSubmissionsRef.current = submissions;
        prevScenariosRef.current = scenarios;
      }
    }

    loadDataFromSupabase();
  }, []);

  // Sync to localStorage and Supabase (Students)
  useEffect(() => {
    localStorage.setItem("gdcd_students", JSON.stringify(students));

    if (supabaseSyncStatus === "success") {
      // 1. Identify deleted students
      const deleted = prevStudentsRef.current.filter((ps) => !students.some((s) => s.id === ps.id));
      deleted.forEach(async (st) => {
        try {
          await dbDeleteStudent(st.id);
        } catch (err) {
          console.error("Lỗi xóa student khỏi Supabase:", err);
        }
      });

      // 2. Identify added or modified students
      const changedOrAdded = students.filter((s) => {
        const prev = prevStudentsRef.current.find((ps) => ps.id === s.id);
        if (!prev) return true; // Added
        return (
          prev.points !== s.points ||
          prev.badges.length !== s.badges.length ||
          prev.history.length !== s.history.length ||
          prev.name !== s.name ||
          prev.class !== s.class
        );
      });

      changedOrAdded.forEach(async (st) => {
        try {
          await dbUpsertStudent(st);
        } catch (err) {
          console.error("Lỗi cập nhật student lên Supabase:", err);
        }
      });
    }
    prevStudentsRef.current = students;
  }, [students, supabaseSyncStatus]);

  // Sync to localStorage and Supabase (Submissions)
  useEffect(() => {
    localStorage.setItem("gdcd_submissions", JSON.stringify(submissions));

    if (supabaseSyncStatus === "success") {
      // 1. Identify deleted submissions
      const deleted = prevSubmissionsRef.current.filter((ps) => !submissions.some((s) => s.id === ps.id));
      deleted.forEach(async (sub) => {
        try {
          await dbDeleteSubmission(sub.id);
        } catch (err) {
          console.error("Lỗi xóa submission khỏi Supabase:", err);
        }
      });

      // 2. Identify added or modified submissions
      const changedOrAdded = submissions.filter((s) => {
        const prev = prevSubmissionsRef.current.find((ps) => ps.id === s.id);
        if (!prev) return true;
        return (
          prev.status !== s.status ||
          prev.score !== s.score ||
          prev.feedback !== s.feedback ||
          prev.badgeAwarded !== s.badgeAwarded ||
          prev.title !== s.title ||
          prev.description !== s.description ||
          prev.content !== s.content
        );
      });

      changedOrAdded.forEach(async (sub) => {
        try {
          await dbUpsertSubmission(sub);
        } catch (err) {
          console.error("Lỗi cập nhật submission lên Supabase:", err);
        }
      });
    }
    prevSubmissionsRef.current = submissions;
  }, [submissions, supabaseSyncStatus]);

  // Sync to localStorage and Supabase (Scenarios)
  useEffect(() => {
    localStorage.setItem("gdcd_scenarios", JSON.stringify(scenarios));

    if (supabaseSyncStatus === "success") {
      // 1. Identify deleted scenarios
      const deleted = prevScenariosRef.current.filter((ps) => !scenarios.some((s) => s.id === ps.id));
      deleted.forEach(async (sc) => {
        try {
          await dbDeleteScenario(sc.id);
        } catch (err) {
          console.error("Lỗi xóa scenario khỏi Supabase:", err);
        }
      });

      // 2. Identify added or modified scenarios
      const changedOrAdded = scenarios.filter((s) => {
        const prev = prevScenariosRef.current.find((ps) => ps.id === s.id);
        if (!prev) return true;
        return (
          prev.title !== s.title ||
          prev.scenario !== s.scenario ||
          prev.grade !== s.grade ||
          prev.category !== s.category ||
          prev.choices.length !== s.choices.length
        );
      });

      changedOrAdded.forEach(async (sc) => {
        try {
          await dbUpsertScenario(sc);
        } catch (err) {
          console.error("Lỗi cập nhật scenario lên Supabase:", err);
        }
      });
    }
    prevScenariosRef.current = scenarios;
  }, [scenarios, supabaseSyncStatus]);

  // Sync workflow steps based on tabs
  useEffect(() => {
    if (activeTab === "trang-chu") setActiveWorkflowStep(1);
    else if (activeTab === "san-choi" || activeTab === "kho-tinh-huong") setActiveWorkflowStep(2);
    else if (activeTab === "san-pham") setActiveWorkflowStep(3);
    else if (activeTab === "ho-so") setActiveWorkflowStep(4);
    else if (activeTab === "xep-hang") setActiveWorkflowStep(5);
  }, [activeTab]);

  // Admin login process
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setIsAdminLoggedIn(true);
        localStorage.setItem("gdcd_admin_logged", "true");
        setRole("admin");
        setIsLoginModalOpen(false);
        setAdminUsername("");
        setAdminPassword("");
        showToast("🔓 Đăng nhập Quản Trị thành công rực rỡ!");
      } else {
        setLoginError(result.message || "Tài khoản hoặc mật khẩu không chính xác!");
      }
    } catch (err) {
      // Local fallback in case server isn't serving yet or during intermediate state
      if (adminUsername === "admin" && adminPassword === "admin") {
        setIsAdminLoggedIn(true);
        localStorage.setItem("gdcd_admin_logged", "true");
        setRole("admin");
        setIsLoginModalOpen(false);
        setAdminUsername("");
        setAdminPassword("");
        showToast("🔓 Đăng nhập Admin thành công (Local Fallback)!");
      } else {
        setLoginError("Sai tài khoản hoặc mật khẩu quản trị!");
      }
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("gdcd_admin_logged");
    setRole("student");
    setActiveTab("trang-chu");
    showToast("🔒 Đã đăng xuất chế độ quản trị an toàn!");
  };

  // Mini-Quiz mechanics
  const handleQuizAnswerSubmit = (opt: { text: string; correct: boolean }) => {
    setQuizSelectedAnswer(opt);
    if (opt.correct) {
      setQuizScore((prev) => prev + 50);
      setQuizMessage("✨ Bingo! Câu trả lời hoàn toàn chính xác. Bạn được cộng 50 điểm cực xịn!");
    } else {
      setQuizMessage("💥 Tiếc quá! Lựa chọn này chưa đúng mất rồi. Em xem giải đáp nhé!");
    }
  };

  const handleNextQuiz = () => {
    setQuizSelectedAnswer(null);
    setQuizMessage("");
    if (quizIndex + 1 < MINI_QUIZ.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      setQuizCompleted(true);
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === currentStudentId) {
            const newPoints = s.points + quizScore;
            const updatedBadges = [...s.badges];
            if (quizScore >= 100 && !updatedBadges.includes("Chiến binh trí tuệ")) {
              updatedBadges.push("Chiến binh trí tuệ");
              showToast("👑 Xuất sắc! Bạn đã mở khóa Huy hiệu 'Chiến binh trí tuệ'!");
            }
            return {
              ...s,
              points: newPoints,
              badges: updatedBadges,
              history: [
                {
                  action: `Hoàn thành cuộc thi Mini-Quiz Công Dân Trẻ 🌟`,
                  points: quizScore,
                  date: "Hôm nay",
                },
                ...s.history,
              ],
            };
          }
          return s;
        })
      );
      setActiveWorkflowStep(4);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizSelectedAnswer(null);
    setQuizMessage("");
  };

  // Scenario Case Study mechanics
  const handleScenarioAnswerSubmit = (choice: any) => {
    if (scenarioAnswered) return;
    setScenarioAnswered(true);
    setScenarioFeedback(choice.feedback);
    setScenarioScoreAdded(choice.points);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentStudentId) {
          const newPoints = s.points + choice.points;
          const updatedBadges = [...s.badges];
          if (choice.isCorrect && !updatedBadges.includes("Người học tích cực")) {
            updatedBadges.push("Người học tích cực");
            showToast("🎓 ĐỈNH QUÁ! Bạn đã mở khóa Huy hiệu 'Người học tích cực'!");
          }
          return {
            ...s,
            points: newPoints,
            badges: updatedBadges,
            history: [
              {
                action: `Vượt qua thử thách: Phân tích tình huống học đường`,
                points: choice.points,
                date: "Hôm nay",
              },
              ...s.history,
            ],
          };
        }
        return s;
      })
    );
    setActiveWorkflowStep(4);
  };

  const resetScenario = () => {
    setScenarioAnswered(false);
    setScenarioFeedback("");
    setScenarioScoreAdded(0);
  };

  // PNG Canvas Generation Fallback for high performance
  const generateCanvasPosterFallback = (textPrompt: string): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, "#f43f5e");
    grad.addColorStop(0.5, "#8b5cf6");
    grad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(200, 200, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("POSTER CỔ ĐỘNG GDCD", 200, 75);

    ctx.fillStyle = "#ffffff";
    ctx.font = "medium 15px system-ui";
    const words = textPrompt.split(" ");
    let line = "";
    let y = 170;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 310 && n > 0) {
        ctx.fillText(line, 200, y);
        line = words[n] + " ";
        y += 28;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 200, y);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "italic 11px monospace";
    ctx.fillText("Thiết kế nháp bởi Trợ lý AI Sân chơi", 200, 335);
    ctx.fillText("Trường THCS Lê Hồng Phong - Tân Hải", 200, 355);

    return canvas.toDataURL("image/png");
  };

  // AI Poster designer
  const handleGenerateAIConcept = async () => {
    if (!aiPrompt.trim()) {
      showToast("Vui lòng điền ý tưởng của em!");
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImageUrl("");

    try {
      const response = await fetch("/api/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.base64Image) {
          const imgUrl = `data:image/png;base64,${result.base64Image}`;
          setGeneratedImageUrl(imgUrl);
          setNewProdContent(imgUrl);
          showToast("✨ Tạo Poster AI thành công mỹ mãn!");
          setIsGeneratingImage(false);
          return;
        }
      }
      throw new Error("Dùng ảnh mẫu phác họa thay thế");
    } catch (err) {
      console.warn("AI Generation failed/limited, using local canvas sketch rendering:", err);
      setTimeout(() => {
        const localImg = generateCanvasPosterFallback(aiPrompt);
        setGeneratedImageUrl(localImg);
        setNewProdContent(localImg);
        showToast("💡 Phác thảo hoàn thành (Bảng màu sáng tạo)!");
        setIsGeneratingImage(false);
      }, 1200);
    }
  };

  // Moot Court choices handler
  const handleMootCourtChoice = (pointsGained: number, choiceText: string, verdict?: string) => {
    setMootPoints((prev) => prev + pointsGained);
    setMootStep((prev) => prev + 1);
    if (verdict) setMootVerdict(verdict);
  };

  const finishMootCourt = () => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentStudentId) {
          const updatedBadges = [...s.badges];
          if (!updatedBadges.includes("Hòa giải viên nhí")) {
            updatedBadges.push("Hòa giải viên nhí");
            showToast("🕊️ TUYỆT VỜI! Em vừa vinh dự được nhận sắc phong 'Hòa giải viên nhí'!");
          }
          return {
            ...s,
            points: s.points + mootPoints,
            badges: updatedBadges,
            history: [
              {
                action: `Phá đảo vụ án Phiên Tòa Giả Định với vai trò đặc sắc ⚖️`,
                points: mootPoints,
                date: "Hôm nay",
              },
              ...s.history,
            ],
          };
        }
        return s;
      })
    );
    setMootCourtActive(false);
    setMootRole(null);
    setMootStep(0);
    setMootVerdict("");
    setActiveWorkflowStep(4);
  };

  // Submission process
  const handleProductSubmitSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim() || !newProdDesc.trim() || !newProdContent.trim()) {
      showToast("Vui lòng nhập đầy đủ thông tin để thầy cô đánh giá bài nha!");
      return;
    }

    const newSub: Submission = {
      id: `SUB${Date.now().toString().slice(-4)}`,
      studentId: currentStudentId,
      studentName: currentStudent.name,
      className: currentStudent.class,
      title: newProdTitle.trim(),
      type: newProdType,
      description: newProdDesc.trim(),
      content: newProdContent.trim(),
      status: "Chờ chấm",
      score: null,
      feedback: "",
      badgeAwarded: "",
      date: new Date().toISOString().split("T")[0],
    };

    setSubmissions([newSub, ...submissions]);
    setNewProdTitle("");
    setNewProdDesc("");
    setNewProdContent("");
    setGeneratedImageUrl("");
    setAiPrompt("");
    setSubmitSuccess(true);
    showToast("🎉 Nộp tác phẩm thành công! Đã gửi bài đến Góc Giáo Viên để chấm điểm.");
    setActiveWorkflowStep(4);

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4500);
  };

  // Grading submissions
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubId) return;

    setSubmissions((prevSubs) =>
      prevSubs.map((sub) => {
        if (sub.id === gradingSubId) {
          setStudents((prevSts) =>
            prevSts.map((st) => {
              if (st.id === sub.studentId) {
                const updatedBadges = [...st.badges];
                if (gradingBadge && !updatedBadges.includes(gradingBadge)) {
                  updatedBadges.push(gradingBadge);
                }
                return {
                  ...st,
                  points: st.points + Number(gradingScore),
                  badges: updatedBadges,
                  history: [
                    {
                      action: `Tác phẩm '${sub.title}' xuất sắc được phê duyệt đạt điểm 10 🏆`,
                      points: Number(gradingScore),
                      date: "Hôm nay",
                    },
                    ...st.history,
                  ],
                };
              }
              return st;
            })
          );

          return {
            ...sub,
            status: "Đã chấm" as const,
            score: Number(gradingScore),
            feedback: gradingFeedback,
            badgeAwarded: gradingBadge,
          };
        }
        return sub;
      })
    );

    showToast("💖 Đã duyệt bài giải, cộng điểm danh giá và khen thưởng học sinh!");
    setGradingSubId(null);
    setGradingFeedback("");
    setGradingBadge("");
  };

  if (supabaseSyncStatus === "connecting") {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white font-sans p-6">
        <Snowfall />
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-yellow-300 absolute top-5 left-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">ĐỒNG BỘ DỮ LIỆU...</h2>
            <p className="text-xs text-pink-100 font-bold leading-relaxed">
              Hệ thống đang kết nối bảo mật tới máy chủ cơ sở dữ liệu Supabase Cloud để đồng bộ hóa kho tình huống và bảng xếp hạng thi đua.
            </p>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-yellow-300 h-full w-4/5 rounded-full animate-pulse"></div>
          </div>
          <p className="text-[10px] text-pink-200 font-extrabold uppercase tracking-widest">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-50/50 via-purple-50/40 to-cyan-50/50 text-slate-800 flex flex-col font-sans pb-16 md:pb-0">
      {/* Dynamic snow */}
      <Snowfall />

      {/* Floating toast alerts */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white px-5 py-4 rounded-2xl shadow-[0_10px_35px_rgba(219,39,119,0.35)] flex items-center gap-3 border border-pink-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          <span className="font-extrabold text-xs tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(109,40,217,0.18)] rounded-b-[2rem]">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-2.5">
                <span className="bg-yellow-300 text-purple-950 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse">
                  🌟 SÂN CHƠI THẾ HỆ MỚI
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-extrabold border border-white/20">
                  📚 GDCD THCS TÍCH HỢP AI
                </span>
                {supabaseSyncStatus === "connecting" && (
                  <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse flex items-center gap-1 border border-amber-300/30">
                    🔄 Đang kết nối Supabase...
                  </span>
                )}
                {supabaseSyncStatus === "success" && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 border border-emerald-400/30">
                    🟢 Supabase Cloud: Connected
                  </span>
                )}
                {supabaseSyncStatus === "offline" && (
                  <span className="bg-slate-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 border border-slate-400/30">
                    🟡 Local Mode (Offline)
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-[2.6rem] font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center lg:justify-start gap-2">
                CÔNG DÂN TRẺ THCS{" "}
                <Flame className="w-7 h-7 text-yellow-300 animate-bounce" />
              </h1>
              <p className="text-pink-100 text-xs mt-2 font-bold tracking-wide">
                💥 Thiết kế Poster AI – Nói chuyện với Thầy Trí Tuệ – Phiên tòa giả định – Trắc nghiệm thi đua!
              </p>
            </div>

            {/* Admin actions and badges summary */}
            <div className="flex flex-wrap items-center gap-3">
              {isAdminLoggedIn ? (
                <div className="bg-emerald-950/40 backdrop-blur-md border border-emerald-400/30 p-3 rounded-2xl flex items-center gap-3 text-xs font-black text-emerald-100 shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase">Quyền Hạn Cao Nhất</p>
                    <p>ADMINISTRATOR ⚙️</p>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="ml-2 bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl cursor-pointer shadow-md"
                    title="Đăng xuất Admin"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLoginError("");
                    setIsLoginModalOpen(true);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <Lock className="w-4 h-4 text-yellow-300" />
                  Đăng Nhập Quản Trị (admin/admin)
                </button>
              )}
            </div>
          </div>

          {/* SIMULATION ROLE SWITCHER */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <span className="text-[11px] text-pink-200 font-extrabold tracking-wider uppercase">Vai trò giả lập:</span>
              <div className="inline-flex rounded-2xl p-1.4 bg-black/25 border border-white/10 w-full sm:w-auto justify-center">
                <button
                  onClick={() => {
                    setRole("student");
                    showToast("Lớp học chào đón công dân trẻ thân thiện! 🎓");
                  }}
                  className={`px-3.5 py-1.8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    role === "student"
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  🎓 Học Sinh
                </button>
                <button
                  onClick={() => {
                    if (!isAdminLoggedIn) {
                      showToast("🔒 Bạn cần Đăng Nhập Quản Trị (admin/admin) để làm Giáo viên!");
                      setIsLoginModalOpen(true);
                      return;
                    }
                    setRole("teacher");
                    showToast("Chào Thầy Cô giáo hạnh phúc! 🏫");
                  }}
                  className={`px-3.5 py-1.8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    role === "teacher"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-purple-950 shadow-lg"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  🏫 Giáo Viên
                </button>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      setRole("admin");
                      showToast("Mở bảng điều phối kĩ thuật tối cao! ⚙️");
                    }}
                    className={`px-3.5 py-1.8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    ⚙️ Quản Trị
                  </button>
                )}
              </div>
            </div>

            {/* State indicators */}
            <div className="flex items-center gap-3 bg-white/15 px-3.5 py-1.5 rounded-2xl border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <p className="text-[11px] font-bold text-white leading-none">
                Học sinh:{" "}
                <span className="text-yellow-300 font-black">
                  {currentStudent.name} ({currentStudent.class})
                </span>{" "}
                —{" "}
                <span className="bg-yellow-300 text-purple-950 px-2 py-0.5 rounded-full font-black text-[10px]">
                  ⚡ {currentStudent.points} Điểm
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* NAV BAR SIDEBAR */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(109,40,217,0.04)] border border-purple-100 p-5 sticky top-5">
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-2.5 mb-3">
              🌈 SƠ ĐỒ CHUYÊN BIỆT
            </h3>
            <nav className="flex flex-col gap-1.2">
              {[
                { id: "trang-chu", label: "1. Trang Chủ 🏠", icon: Home, color: "text-pink-500 bg-pink-50" },
                { id: "san-choi", label: "2. Sân Chơi GDCD 🎮", icon: Gamepad2, color: "text-purple-500 bg-purple-50" },
                { id: "clb", label: "3. Câu Lạc Bộ 👥", icon: Users, color: "text-blue-500 bg-blue-50" },
                { id: "thu-thach", label: "4. Thử Thách 🏆", icon: Trophy, color: "text-amber-500 bg-amber-50" },
                { id: "kho-tinh-huong", label: "5. Kho Tình Huống 📖", icon: BookOpen, color: "text-orange-500 bg-orange-50" },
                { id: "san-pham", label: "6. Sản Phẩm Học Sinh 🎨", icon: FileCode, color: "text-rose-500 bg-rose-50" },
                { id: "xep-hang", label: "7. Bảng Xếp Hạng 👑", icon: Award, color: "text-yellow-600 bg-yellow-50" },
                { id: "ho-so", label: "8. Hồ Sơ Cá Nhân 🎒", icon: User, color: "text-violet-500 bg-violet-50" },
                {
                  id: "giao-vien",
                  label: "9. Chấm Điểm Thầy Cô 🏫",
                  icon: Settings,
                  color: "text-emerald-600 bg-emerald-50",
                  badge: !isAdminLoggedIn ? "🔒 Khóa" : "Mở",
                },
                { id: "admin-view", label: "10. Quản Trị Admin ⚙️", icon: Settings, color: "text-cyan-600 bg-cyan-50", badge: !isAdminLoggedIn ? "🔒" : "Mở" },
                { id: "thong-ke", label: "11. Thống Kê 📊", icon: BarChart3, color: "text-cyan-500 bg-cyan-50" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if ((item.id === "admin-view" || item.id === "giao-vien") && !isAdminLoggedIn) {
                        showToast(`🔒 Vui lòng đăng nhập admin để xem tab ${item.label}!`);
                        setIsLoginModalOpen(true);
                        return;
                      }
                      setActiveTab(item.id);
                    }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_8px_18px_rgba(236,72,153,0.2)]"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl ${isActive ? "bg-white/25" : item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white text-purple-600" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* WORK BENCH AREA */}
        <main className="lg:col-span-9 flex flex-col gap-6 w-full">
          {/* TAB 1: TRANG CHỦ */}
          {activeTab === "trang-chu" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white p-7 rounded-3xl shadow-[0_15px_30px_rgba(236,72,153,0.12)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none animate-pulse"></div>
                <h2 className="text-2xl md:text-3xl font-black mb-2.5">Sân Chơi Học Tập & Rèn Luyện Giáo Dục Công Dân! ✨</h2>
                <p className="text-pink-100 max-w-2xl text-xs leading-relaxed mb-5 font-bold">
                  Không gian học tập thế hệ mới. Sử dụng trí tuệ nhân tạo Gemini thiết kế tranh vẽ poster tuyên truyền cực nhanh, chơi Mini-Quiz, hóa thân Thẩm phán xử án và thi đùa cùng bạn bè!
                </p>
                <div className="flex flex-wrap gap-2.5 text-xs font-black">
                  <button
                    onClick={() => setActiveTab("san-choi")}
                    className="bg-yellow-300 hover:bg-yellow-400 text-purple-950 px-5 py-3 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current" /> Chinh Phục Mini-Quiz Nhận Thưởng!
                  </button>
                  <button
                    onClick={() => setActiveTab("kho-tinh-huong")}
                    className="bg-white/20 hover:bg-white/30 text-white px-5 py-3 rounded-2xl transition-all border border-white/20 cursor-pointer"
                  >
                    Giải Quyết Tình Huống Gần Gũi
                  </button>
                </div>
              </div>

              {/* Quick statistics layout overlay */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Task list Column */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.03)] border-2 border-amber-50">
                  <h3 className="font-extrabold text-slate-800 text-xs mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Nhiệm vụ Tuần Này</span>
                    <span className="bg-rose-100 text-rose-700 text-[8px] font-black px-1.5 py-0.5 rounded-full">HOT 🔥</span>
                  </h3>
                  <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-100 text-[11px]">
                    <h4 className="font-black text-amber-900 mb-1">🌿 Sổ tay: Bảo vệ lớp học xanh</h4>
                    <p className="text-slate-500 font-semibold mb-2">Đọc tình huống Nam và Tuấn để giải cứu môi trường sạch bóng rác nhựa!</p>
                    <button
                      onClick={() => {
                        setSelectedScenarioId("TH001");
                        setActiveTab("kho-tinh-huong");
                      }}
                      className="text-pink-600 font-black flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      Bấm xử lý ngay <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Notices panel */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.03)] border-2 border-purple-50 text-[11px] font-semibold text-slate-600">
                  <h3 className="font-extrabold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                    📢 Đỉnh Gió Tuyên Truyền
                  </h3>
                  <div className="space-y-3">
                    <div className="border-b border-purple-50 pb-2">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[8px] font-black">21/06/2026</span>
                      <h4 className="font-extrabold text-slate-800 mt-1">Phát động cuộc thi thiết kế với Trợ lý Poster AI 🖼️</h4>
                    </div>
                    <div>
                      <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md text-[8px] font-black">18/06/2026</span>
                      <h4 className="font-extrabold text-slate-800 mt-1">Gia nhập nhóm danh dự 'Câu Lạc Bộ Công Dân Trẻ'!</h4>
                    </div>
                  </div>
                </div>

                {/* Best students short leaderboard */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.03)] border-2 border-pink-50">
                  <h3 className="font-extrabold text-slate-800 text-xs mb-3 flex items-center justify-between">
                    <span>🏆 Kỳ Thủ Điểm Cao Nhất</span>
                    <button onClick={() => setActiveTab("xep-hang")} className="text-[10px] text-pink-600 font-black cursor-pointer">Xem tất cả</button>
                  </h3>
                  <div className="space-y-2.5">
                    {students.slice(0, 3).map((std, idx) => (
                      <div key={std.id} className="flex items-center justify-between text-[11px] p-2 bg-gradient-to-r from-purple-50 to-pink-50/20 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-[9px] font-black ${idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-400" : "bg-amber-700"}`}>
                            {idx + 1}
                          </span>
                          <span>{std.name}</span>
                        </div>
                        <span className="font-black text-purple-600">⚡ {std.points}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery spotlight snippet */}
              <div className="bg-white rounded-3xl p-5 border-2 border-slate-100">
                <h3 className="font-black text-slate-805 text-sm mb-3 flex items-center gap-2">
                  🎨 Tác Phẩm Học Sinh Nổi Bật Trong Tuần
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.slice(0, 2).map((sub) => (
                    <div key={sub.id} className="p-4 bg-gradient-to-b from-white to-pink-50/10 border border-pink-100 rounded-3xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-pink-150 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full text-[8px] uppercase font-black">
                            {sub.type}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">Người vẽ: {sub.studentName} ({sub.className})</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-xs mb-1">{sub.title}</h4>
                        <p className="text-slate-500 text-[10px] leading-relaxed font-bold line-clamp-2">{sub.description}</p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-purple-50 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">⭐ Lớp chấm: {sub.score ? `${sub.score}đ` : "Đang chờ"}</span>
                        <button onClick={() => setActiveTab("san-pham")} className="text-purple-600 font-black cursor-pointer hover:underline">Chi tiết</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SÂN CHƠI GDCD */}
          {activeTab === "san-choi" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-3 border-b border-purple-50">
                  <div>
                    <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                      <Gamepad2 className="w-6 h-6 text-pink-500 animate-pulse" />
                      Sân Chơi Trò Chơi Trực Quan
                    </h2>
                    <p className="text-slate-500 text-xs font-semibold">Trả lời trắc nghiệm hoặc đóng vai xử án hòa giải bạo lực không gian mạng</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase">
                    <button
                      onClick={() => setMootCourtActive(false)}
                      className={`px-3 py-1.5 rounded-full border cursor-pointer ${
                        !mootCourtActive ? "bg-purple-100 text-purple-800 border-purple-200 shadow-sm" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      🔔 Rung chuông công dân
                    </button>
                    <button
                      onClick={() => setMootCourtActive(true)}
                      className={`px-3 py-1.5 rounded-full border cursor-pointer ${
                        mootCourtActive ? "bg-amber-100 text-amber-800 border-amber-200 shadow-sm" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      ⚖️ Phiên tòa giả định RPG
                    </button>
                  </div>
                </div>

                {!mootCourtActive ? (
                  /* Rung chuông công dân Mini-Quiz UI */
                  <div className="bg-gradient-to-br from-purple-700 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-purple-500/10">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-300 text-slate-900 font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                          ĐANG CHƠI 🎮
                        </span>
                        <h3 className="font-extrabold text-xs">Mini-Quiz Trả Điểm Tích Lũy</h3>
                      </div>
                      <span className="text-xs text-purple-200">Câu hỏi {quizIndex + 1} / {MINI_QUIZ.length}</span>
                    </div>

                    {!quizCompleted ? (
                      <div>
                        <p className="text-sm font-extrabold mb-5 text-purple-50 leading-relaxed">
                          {MINI_QUIZ[quizIndex].question}
                        </p>

                        <div className="space-y-2.5">
                          {MINI_QUIZ[quizIndex].options.map((opt, oIdx) => {
                            const isSelected = quizSelectedAnswer === opt;
                            const showCorrectness = quizSelectedAnswer !== null;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleQuizAnswerSubmit(opt)}
                                disabled={quizSelectedAnswer !== null}
                                className={`w-full text-left p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? opt.correct
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-mdScale"
                                      : "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-md"
                                    : showCorrectness && opt.correct
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                      : "bg-white/10 text-slate-100 hover:bg-white/15 border border-white/5"
                                }`}
                              >
                                <span>{oIdx + 1}. {opt.text}</span>
                                {isSelected && (
                                  opt.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-100" /> : <AlertCircle className="w-4 h-4 text-red-100" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizMessage && (
                          <div className={`mt-4 p-3 rounded-xl text-[11px] font-black ${
                            quizSelectedAnswer?.correct ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800" : "bg-rose-950/40 text-rose-300 border border-rose-800"
                          }`}>
                            {quizMessage}
                          </div>
                        )}

                        <div className="mt-5 flex justify-end">
                          <button
                            onClick={handleNextQuiz}
                            disabled={quizSelectedAnswer === null}
                            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer hover:scale-105 flex items-center gap-1"
                          >
                            {quizIndex + 1 === MINI_QUIZ.length ? "Tiến hành hoàn tất" : "Tiếp theo"} <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-3">
                        <span className="text-4xl animate-bounce inline-block">🎉</span>
                        <h3 className="text-xl font-black text-yellow-300">Hoạt Động Hoàn Thành!</h3>
                        <p className="text-xs text-purple-100">Em vừa tích lũy ngọt ngào thêm trong lượt chơi này: <strong className="text-white text-sm">+{quizScore} Điểm</strong></p>
                        <div className="pt-2 flex justify-center gap-2 text-xs font-black">
                          <button onClick={resetQuiz} className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl cursor-pointer">Chơi lại</button>
                          <button onClick={() => setActiveTab("ho-so")} className="px-5 py-2 bg-yellow-300 hover:bg-yellow-400 text-purple-950 rounded-xl cursor-pointer">Xem hòm thư vinh danh</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Phiên tòa giả định RPG UI */
                  <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-3xl p-5 shadow-xl border border-amber-500/10">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                          RPG NHẬP VAI ⚖️
                        </span>
                        <h3 className="font-extrabold text-xs">Vụ án: Bản Quyền tác phẩm & Bạo Lực Học Đường Mạng</h3>
                      </div>
                      <span className="text-xs font-black text-amber-200">Điểm vụ án: +{mootPoints}đ</span>
                    </div>

                    {mootRole === null ? (
                      <div className="text-center py-2 space-y-3">
                        <h4 className="text-sm font-black text-amber-300">CHỌN VAI TRÒ ĐÓNG BIỆN LUẬN CỦA EM</h4>
                        <p className="text-[11px] text-slate-300 max-w-xl mx-auto leading-relaxed font-bold">
                          Khánh đi sao chép bức vẽ nghệ thuật do bạn Minh mất 1 tuần thiết kế mang nộp dự thi. Minh tức tối đã lấy ảnh chân dung thật của Khánh đăng bài dìm châm chọc trên MXH. Em sẽ đóng vai gì?
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          <button
                            onClick={() => {
                              setMootRole("judge");
                              setMootStep(1);
                            }}
                            className="p-4 bg-white/5 border border-amber-500 hover:bg-white/10 rounded-2xl text-center cursor-pointer transition-all hover:scale-102"
                          >
                            <span className="text-2xl block">⚖️</span>
                            <h5 className="font-extrabold text-xs text-amber-300 mt-1">Thẩm Phán</h5>
                            <p className="text-[9px] text-slate-400 mt-1">Dùng công lý để giảng giải, hòa giải ôn hòa.</p>
                          </button>
                          <button
                            onClick={() => {
                              setMootRole("prosecutor");
                              setMootStep(1);
                            }}
                            className="p-4 bg-white/5 border border-blue-400 hover:bg-white/10 rounded-2xl text-center cursor-pointer transition-all hover:scale-102"
                          >
                            <span className="text-2xl block">👔</span>
                            <h5 className="font-extrabold text-xs text-blue-300 mt-1">Kiểm Sát Viên</h5>
                            <p className="text-[9px] text-slate-400 mt-1">Tập trung làm rõ lỗi xâm phạm đời tư Luật an ninh mạng.</p>
                          </button>
                          <button
                            onClick={() => {
                              setMootRole("defense");
                              setMootStep(1);
                            }}
                            className="p-4 bg-white/5 border border-emerald-400 hover:bg-white/10 rounded-2xl text-center cursor-pointer transition-all hover:scale-102"
                          >
                            <span className="text-2xl block">🛡️</span>
                            <h5 className="font-extrabold text-xs text-emerald-300 mt-1">Biện Hộ Viên</h5>
                            <p className="text-[9px] text-slate-400 mt-1">Giúp Minh đòi quyền sở hữu trí tuệ chính chủ.</p>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {mootRole === "judge" && (
                          <div className="space-y-4">
                            {mootStep === 1 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-amber-300">Bước 1: Điều hành buổi hòa giải và đặt câu hỏi đạo đức</h4>
                                <p className="text-[11px] text-slate-300 font-bold leading-relaxed">Em đề xuất hỏi hai bạn ra sao để tự nhận diện lỗi?</p>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "", "Hòa giải")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Khánh có thấy lấy chất xám của bạn là sai không? Minh có hiểu rằng dìm ngoại hình bạn trên Facebook là vi phạm Luật an ninh mạng bạo lực trực tuyến không?"
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(15, "", "Tranh chấp")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Khánh sai mười mươi do trộm tranh trước, Minh bêu rếu là chuyện bình thường thốt ra!"
                                  </button>
                                </div>
                              </div>
                            )}

                            {mootStep === 2 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-amber-300">Bước 2: Ra quyết định cam xử có tính giáo dục GDCD</h4>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "", "Thành công")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Khánh phải rút tranh vẽ, xin lỗi Minh công khai. Minh gỡ bài, viết bản cam kết ứng xử số lành mạnh. Hai lớp cùng tham gia bài thi vẽ tranh bản quyền."
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(20, "", "Thất bại")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Cảnh lý thôi học cả hai bạn để răn đe răn dạy rắc rối."
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {mootRole === "prosecutor" && (
                          <div className="space-y-4">
                            {mootStep === 1 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-blue-300">Bước 1: Làm rõ tội xâm hại Luật An Ninh Mạng của Minh</h4>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Xúc phạm chân dung bêu xấu bạn là hành vi vi phạm Nghị định bôi nhọ mạng, gây áp lực trực tuyến ảnh hưởng tâm lý nghiêm trọng tới bạn!"
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(20, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Minh đăng ảnh dìm chỉ là trêu chọc thường ngày, không đáng xử bận tâm."
                                  </button>
                                </div>
                              </div>
                            )}

                            {mootStep === 2 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-blue-300">Bước 2: Kết luận biện pháp học đường ý nghĩa</h4>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Yêu cầu cả hai bạn kết nối thực hiện bài kiểm tra tự ý nghĩa và bồi thường lao động công ích chăm sóc bồn hoa học viện."
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(15, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Phạt gia đình Minh đền bù nhiều tài chính cho Khánh."
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {mootRole === "defense" && (
                          <div className="space-y-4">
                            {mootStep === 1 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-emerald-300">Bước 1: Chứng minh công lao gốc sáng tác chất xám của Minh</h4>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Trình ra bản phác họa thiết kế bút mực lưu đúng giờ để chứng minh Khánh chép tranh hoàn toàn không có xin phép!"
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(20, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Do bạn Minh chỉ nói suông, không bắt buộc chứng minh."
                                  </button>
                                </div>
                              </div>
                            )}

                            {mootStep === 2 && (
                              <div className="space-y-3">
                                <h4 className="text-xs font-black text-emerald-300">Bước 2: Biện hộ giảm nhẹ và hướng khắc phục</h4>
                                <div className="space-y-2 text-[11px] font-semibold">
                                  <button
                                    onClick={() => handleMootCourtChoice(50, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    A. "Minh dồn nén ức chế do bị cướp đoạt tranh. Đề nghị gỡ bài viết chân dung, Khánh thu hồi bài nộp ăn bám và đền bù xin lỗi."
                                  </button>
                                  <button
                                    onClick={() => handleMootCourtChoice(15, "")}
                                    className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer"
                                  >
                                    B. "Bảo vệ việc Minh bôi nhọ là đúng đắn, không cần sửa đổi lỗi Minh."
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {mootStep > 2 && (
                          <div className="text-center py-4 space-y-3">
                            <span className="text-4xl block">✨🕊️⚖️</span>
                            <h4 className="text-sm font-black text-amber-300">VỤ ÁN HÒA GIẢI HOÀN THÀNH XUẤT SẮC!</h4>
                            <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                              Em đã đưa ra những phán quyết công đạo của một Hòa giải viên nhí chân chính bậc THCS. Điểm thi đua của em đã được bổ sung!
                            </p>
                            <p className="text-xs font-black text-amber-200">Điểm rèn luyện đạt được: +{mootPoints} Điểm GDCD ⚡</p>
                            <button
                              onClick={finishMootCourt}
                              className="mt-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-5 py-2 rounded-xl cursor-pointer shadow-md"
                            >
                              Nhận Phong Sắc Huy Chương 'Hòa giải viên nhí'
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CÂU LẠC BỘ */}
          {activeTab === "clb" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-1.5 mb-2">
                  <Users className="w-6 h-6 text-pink-500 animate-spin" />
                  Gia Đình Câu Lạc Bộ Rèn Luyện Lớp
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-5 leading-relaxed">
                  Ngôi nhà chung rèn đức rèn tài, kết nối học sinh bốn phương học hỏi những kỹ năng tốt đời sống thường ngày.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "CLB Công dân trẻ 🌱",
                      members: 120,
                      lead: "Thầy Vũ Minh Tuấn",
                      desc: "Nơi ghi nhật ký giúp đỡ bố mẹ, thực hành tiết kiệm heo giống, rèn luyện thói quen nhân từ tốt bụng.",
                      color: "border-blue-150 bg-blue-50/20",
                    },
                    {
                      name: "CLB Công dân số 🌐",
                      members: 95,
                      lead: "Cô Trần Thu Phương",
                      desc: "Hành động phòng chống virus mã hóa, xây dựng internet sách học sạch đẹp bảo vệ danh tính cá nhân.",
                      color: "border-purple-150 bg-purple-50/20",
                    },
                    {
                      name: "CLB Pháp luật học đường ⚖️",
                      members: 78,
                      lead: "Thầy Lê Văn Thành",
                      desc: "Tải tìm hiểu Sơ đồ tư duy về hiến pháp quy định quyền lợi và nghĩa vụ gương mẫu của người con.",
                      color: "border-amber-150 bg-amber-50/20",
                    },
                    {
                      name: "CLB Hòa giải viên nhí 🕊️",
                      members: 62,
                      lead: "Cô Nguyễn Thu Trà",
                      desc: "Trực xử mâu thuẫn bồng bột học học viện, bảo vệ bạn bè ngăn chặn xúc phạm bạo lực học đường.",
                      color: "border-rose-150 bg-rose-50/20",
                    },
                  ].map((clb, index) => (
                    <div key={index} className={`p-4 rounded-3xl border-2 ${clb.color} flex flex-col justify-between hover:scale-101 transition-all duration-200`}>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <h3 className="font-black text-slate-800 text-xs">{clb.name}</h3>
                          <span className="bg-white text-purple-700 px-2 py-0.5 rounded-full text-[9px] border font-black">
                            {clb.members} bạn
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed font-bold">{clb.desc}</p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-purple-100 flex items-center justify-between text-xs font-semibold">
                        <span>Cố vấn: <strong>{clb.lead}</strong></span>
                        <button
                          onClick={() => showToast(`🎉 Đã nộp đơn gia nhập ${clb.name}! Hãy đợi phê duyệt nhé!`)}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 font-black text-white text-[10px] px-3.5 py-1.8 rounded-xl cursor-pointer shadow-sm hover:scale-105"
                        >
                          Gia nhập ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THỬ THÁCH */}
          {activeTab === "thu-thach" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-amber-900 flex items-center gap-1.5 mb-1">
                  <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
                  Đại Lộ Thử Thách Rèn Phẩm Chất
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-6">Thực hiện rèn luyện thực phẩm cuộc sống, báo cáo Thầy Cô và mở khóa Huy hiệu</p>

                <div className="space-y-4">
                  {[
                    { id: "T1", category: "Cá nhân 🌱", title: "Thử thách: Tiết kiệm vì heo đất nhỏ", desc: "Quản lý đồng tiền sinh hoạt phù hợp trong 3 tuần tiếp, biểu viết ghi chép lại kết quả tỉ mỉ báo cáo.", reward: 80, badge: "Công dân trách nhiệm" },
                    { id: "T2", category: "Nhóm bạn 👥", title: "Thử thách: Thiết kế Poster môi trường xanh", desc: "Kết đoàn 3 bạn vẽ phác họa bài tuyên truyền giảm rác thải sinh hoạt, treo sảnh chung.", reward: 120, badge: "Nhà sáng tạo tích cực" },
                    { id: "T3", category: "Tập thể 🏫", title: "Thử thách: Góc cam kết hòa thuận lớp", desc: "Tự tay dựng mảng tranh có lời thấu biểu, xin lỗi bạn khi sai, ngăn cản bạo bực.", reward: 200, badge: "Hòa giải viên nhí" }
                  ].map((task) => (
                    <div key={task.id} className="p-4 border-2 border-slate-100 hover:border-pink-200 rounded-2xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full text-[9px] font-black">{task.category}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Thưởng: <strong className="text-purple-600">+{task.reward} điểm</strong></span>
                        </div>
                        <h3 className="font-black text-slate-800 text-xs">{task.title}</h3>
                        <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">{task.desc}</p>
                        <p className="text-[9px] text-pink-600 font-black">🏅 Trao tặng: {task.badge}</p>
                      </div>
                      <button
                        onClick={() => showToast(`👍 Đăng ký thử thách '${task.title}' thành công! Trực thực hiện đi nộp nhé!`)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 font-black text-white text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md"
                      >
                        Đăng Ký
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KHO TÌNH HUỐNG */}
          {activeTab === "kho-tinh-huong" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-black text-orange-950 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-orange-500 animate-pulse" />
                      Thử Thách Giải Quyết Tình Huống Sổ Học Bạ
                    </h2>
                    <p className="text-slate-500 text-xs font-semibold">Tự phân tích, đưa ra quyết định xử trí tình huống đạo đức thường ngày</p>
                  </div>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer">
                    <Filter className="w-3.5 h-3.5" /> Toàn Kho Học Liệu
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                  {/* Left Selector list */}
                  <div className="lg:col-span-5 space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {scenarios.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setSelectedScenarioId(th.id);
                          resetScenario();
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer ${
                          selectedScenarioId === th.id
                            ? "bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-400 text-orange-950 shadow-sm"
                            : "bg-white hover:bg-slate-50 border-slate-150 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5 text-[9px]">
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">Khối Lớp {th.grade}</span>
                          <span className="text-orange-600 font-extrabold">{th.category}</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{th.title}</p>
                      </button>
                    ))}
                  </div>

                  {/* Right Solver detail panel */}
                  <div className="lg:col-span-7 p-5 border-2 border-orange-100 bg-orange-50/10 rounded-2xl space-y-4">
                    {(() => {
                      const activeTh = scenarios.find((t) => t.id === selectedScenarioId);
                      if (!activeTh) return <p className="text-xs text-slate-400 font-bold">Hãy chọn tình huống bên trái cậu ơi!</p>;
                      return (
                        <div className="space-y-4">
                          <h3 className="font-black text-orange-950 text-xs">📌 {activeTh.title}</h3>
                          <div className="p-3.5 bg-white rounded-xl border border-orange-100 text-[11px] leading-relaxed text-slate-600 font-semibold shadow-sm">
                            {activeTh.scenario}
                          </div>

                          <div className="space-y-2">
                            {activeTh.choices.map((choice) => (
                              <button
                                key={choice.id}
                                onClick={() => handleScenarioAnswerSubmit(choice)}
                                disabled={scenarioAnswered}
                                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-start gap-2 cursor-pointer ${
                                  scenarioAnswered
                                    ? choice.points > 10
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 border"
                                      : choice.points > 0
                                        ? "bg-amber-50 border-amber-300 text-amber-950 border"
                                        : "bg-rose-50 border-rose-300 text-rose-950 border"
                                    : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 shadow-sm"
                                }`}
                              >
                                <span className="font-black bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{choice.id}</span>
                                <span className="flex-1 leading-relaxed">{choice.text}</span>
                              </button>
                            ))}
                          </div>

                          {scenarioAnswered && (
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-[11px] font-semibold text-slate-600">
                              <p className="font-black text-slate-800">Ý kiến Thầy Cô rèn luyện:</p>
                              <p className="italic font-bold">"{scenarioFeedback}"</p>
                              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 font-black">
                                <span>Phần thưởng:</span>
                                <span className="text-emerald-700">+{scenarioScoreAdded} Điểm Học Lực GDCD ⚡</span>
                              </div>
                              <button onClick={resetScenario} className="mt-2 text-[10px] bg-slate-100 text-slate-800 font-extrabold px-3 py-1.5 rounded-lg cursor-pointer">Thử Lại Trả Lời Khác</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SẢN PHẨM HỌC SINH */}
          {activeTab === "san-pham" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-1.5 mb-2">
                  <FileCode className="w-6 h-6 text-pink-500 animate-pulse" />
                  Triển Lãm & Soạn Thảo Sản Phẩm Học Tập
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-6">Nơi trưng bày tác phẩm. Nay tích hợp thêm trợ lý vẽ tranh concept bằng AI cực chất!</p>

                {/* AI image widget inside tab */}
                <div className="p-5 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-indigo-500/10 rounded-2xl border border-pink-200 mb-6 font-semibold text-xs leading-relaxed text-slate-600">
                  <h3 className="font-black text-xs text-pink-700 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-pink-500 animate-spin" /> Tool: Trợ lý AI Phác Họa Poster Cổ Động
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-3 font-semibold">
                    Em hãy nhập ý tưởng (Ví dụ: "Học sinh bảo vệ môi trường", "Chống bắt nạt bạo lực học đoàn"). Thầy Trí Tuệ AI sẽ phác họa ngay cho em một bức tranh vẽ tuyệt đẹp.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ý tưởng tranh vẽ của em bằng tiếng Việt..."
                      className="flex-1 bg-white border border-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400 font-black"
                    />
                    <button
                      onClick={handleGenerateAIConcept}
                      disabled={isGeneratingImage}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1 hover:scale-103 transition-all"
                    >
                      {isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                      Tạo Poster AI
                    </button>
                  </div>

                  {isGeneratingImage && (
                    <div className="mt-3 text-center text-pink-600 font-black animate-pulse flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"></div>
                      <span>Ý tưởng đang được Thầy Trí Tuệ AI dệt dán bức vẽ nháp, đợi thầy xíu nha...</span>
                    </div>
                  )}

                  {generatedImageUrl && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-pink-100 flex flex-col sm:flex-row items-center gap-4">
                      <img src={generatedImageUrl} alt="AI sketch" className="w-32 h-32 object-cover rounded-lg border shadow-sm" />
                      <div className="space-y-1 text-[11px]">
                        <p className="font-black text-slate-800">✅ Bản vẽ phác họa hoàn thành!</p>
                        <p className="text-slate-400">Đường dẫn tệp đã được tự động dán vào mục "Đường dẫn bài nộp" của biểu mẫu nộp bài dưới đây của em.</p>
                        <a href={generatedImageUrl} download="gdcd_poster_ai.png" className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border px-3 py-1.5 rounded-lg font-black font-mono">
                          <Download className="w-3 h-3" /> Tải bản vẽ xuống
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left panel product submit form */}
                  <div className="lg:col-span-5 p-5 border border-pink-100 bg-pink-50/5 rounded-2xl text-xs font-bold text-slate-600 space-y-4">
                    <h3 className="font-black text-pink-700">📤 Nộp Tác Tuyên Truyền Gương Mẫu</h3>
                    {submitSuccess ? (
                      <div className="p-4 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-xl space-y-1.5">
                        <p className="font-extrabold">✓ Đã nộp bài xuất sắc lên Góc Giáo viên!</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Sản phẩm sáng tạo rèn luyện của em đã được dán lên kệ chờ Thầy Cô đánh giá số học bạ. Hãy hóng điểm rực rỡ ở mục Hồ Sơ Học Sinh nha!</p>
                      </div>
                    ) : (
                      <form onSubmit={handleProductSubmitSubmission} className="space-y-4">
                        <div>
                          <label className="block mb-1">Tên tác phẩm của tớ *</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Sách nhỏ tuyên truyền Lòng hiếu thảo..."
                            value={newProdTitle}
                            onChange={(e) => setNewProdTitle(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block mb-1">Thể loại bài nộp</label>
                            <select
                              value={newProdType}
                              onChange={(e) => setNewProdType(e.target.value)}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl"
                            >
                              <option value="Poster">Poster cổ động 🖼️</option>
                              <option value="Sơ đồ tư duy">Sơ đồ tư duy 💡</option>
                              <option value="Infographic">Infographic 📊</option>
                              <option value="Video">Video hành động 🎬</option>
                              <option value="Podcast">Podcast rèn luyện 🎧</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1">Đường dẫn bài nộp *</label>
                            <input
                              type="text"
                              placeholder="Dán link drive/youtube hoặc ảnh AI"
                              value={newProdContent}
                              onChange={(e) => setNewProdContent(e.target.value)}
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1">Mô tả thông điệp ý nghĩa mang lại *</label>
                          <textarea
                            rows={2}
                            placeholder="Viết 1 vài dòng ý nghĩa về thông điệp tâm tư trong tác phẩm..."
                            value={newProdDesc}
                            onChange={(e) => setNewProdDesc(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl"
                            required
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black rounded-xl hover:scale-102 cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-4 h-4" /> Gửi thầy cô chấm duyệt điểm
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Right panel submission gallery */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="font-black text-purple-700 text-xs">🖼️ Triển lãm Sổ chép Bài nộp</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between text-xs">
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[8px] font-black uppercase">{sub.type}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${sub.status === "Đã chấm" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                {sub.status}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-[13px]">{sub.title}</h4>
                            <p className="text-slate-500 text-[10px] leading-relaxed font-bold mt-1 line-clamp-2">{sub.description}</p>
                            
                            {sub.content.startsWith("data:image") ? (
                              <img src={sub.content} className="w-full h-24 object-cover rounded-lg border mt-2 shadow-sm" alt="draft poster" />
                            ) : (
                              <p className="text-[10px] text-pink-600 font-mono italic truncate bg-white p-1 rounded border mt-2">{sub.content}</p>
                            )}
                          </div>
                          <div className="mt-3.5 pt-2 border-t border-purple-50 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                            <span>Tác giả: <strong className="text-slate-700">{sub.studentName}</strong></span>
                            {sub.score && <span className="bg-yellow-300 text-purple-950 px-2 py-0.5 rounded font-black">{sub.score}đ 🏆</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BẢNG XẾP HẠNG */}
          {activeTab === "xep-hang" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-1.5 mb-1">
                  <Award className="w-6 h-6 text-pink-500 animate-pulse" />
                  Bảng Vàng Thi Đua Toàn Trường
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-5">Xếp hạng tự động vinh danh những gương mặt tích lũy điểm rèn luyện số cao quý</p>

                <div className="overflow-hidden border border-slate-150 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                        <th className="px-5 py-3">Thứ hạng</th>
                        <th className="px-5 py-3">Bạn học sinh</th>
                        <th className="px-5 py-3">Chi đội</th>
                        <th className="px-5 py-3">Điểm tích lũy</th>
                        <th className="px-5 py-3">Hộp huy chương</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                      {students
                        .sort((a, b) => b.points - a.points)
                        .map((st, idx) => (
                          <tr key={st.id} className="hover:bg-pink-50/10">
                            <td className="px-5 py-3 text-sm">
                              {idx < 3 ? ["👑", "🥈", "🥉"][idx] : <span className="text-slate-400 font-bold"># {idx + 1}</span>}
                            </td>
                            <td className="px-5 py-3 font-black text-slate-800">{st.name}</td>
                            <td className="px-5 py-3 text-slate-400 font-bold">{st.class}</td>
                            <td className="px-5 py-3">
                              <span className="font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                                ⚡ {st.points}đ
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-wrap gap-1">
                                {st.badges.map((b, bI) => (
                                  <span key={bI} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HỒ SƠ HỌC SINH */}
          {activeTab === "ho-so" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-purple-100">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white shadow-md border-2 border-white">
                      🎓
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-800">{currentStudent.name}</h2>
                      <p className="text-[11px] text-slate-400 font-bold">Mã ID: <strong>{currentStudent.id}</strong> | Chi hội: <strong>Lớp {currentStudent.class}</strong> | THCS Lê Hồng Phong</p>
                      <div className="flex flex-wrap gap-2 pt-1 font-black text-[10px]">
                        <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full border border-pink-200">🔥 {currentStudent.points} Điểm Rèn Luyện</span>
                        <span className="bg-yellow-50 text-amber-700 px-3 py-1 rounded-full border border-yellow-200">🏅 {currentStudent.badges.length} Huy Hiệu</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-right bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4 rounded-2xl border shadow-md">
                    <p className="text-[9px] uppercase tracking-wider text-purple-200 font-black">Xếp hạng danh dự</p>
                    <p className="text-xl font-black text-yellow-300">#1 Toàn Khoá 👑</p>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-black uppercase">Xuất sắc</span>
                  </div>
                </div>

                {/* Badge Shelf */}
                <div className="pt-6">
                  <h3 className="font-black text-slate-850 text-sm mb-4">🏆 Kệ Trưng Bày Huy Hiệu Của Tớ ({currentStudent.badges.length}/8)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {BADGES_LIST.map((bg, bgI) => {
                      const isUnlocked = currentStudent.badges.includes(bg.name);
                      return (
                        <div
                          key={bgI}
                          className={`p-3.5 border-2 rounded-2xl text-center flex flex-col items-center justify-between transition-all duration-300 ${
                            isUnlocked
                              ? "bg-white border-purple-200 shadow-md scale-102"
                              : "bg-slate-50 border-slate-100 opacity-40 scale-95"
                          }`}
                        >
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${isUnlocked ? bg.color : "from-slate-200 to-slate-300"} flex items-center justify-center text-xl shadow mb-2`}>
                            {isUnlocked ? bg.icon : "🔒"}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-[11px] leading-tight">{bg.name}</h4>
                            <p className="text-[9px] text-slate-400 font-bold line-clamp-1 mt-0.5">{bg.desc}</p>
                          </div>
                          {isUnlocked ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded mt-2">✓ Hoàn thành</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded mt-2">🔒 Khóa</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Historical records */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-6 border-t border-purple-50 text-xs">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-800 text-xs">💬 Đánh giá Sư phạm Sách Số:</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-indigo-200 rounded-2xl font-bold leading-normal text-slate-700">
                      <p className="text-indigo-800 text-xs font-black">🤖 Trợ lý Thầy Trí Tuệ AI:</p>
                      <p className="mt-1 font-semibold italic text-[11px]">
                        "Thông qua nỗ lực giải quyết Mini-Quiz và tham gia tích cực Phiên Tòa giả định, bạn Triết bộc lộ năng khiếu hùng biện pháp luật cực tốt! Triết nên rủ thêm các bạn cùng khối thiết kế Sơ đồ tư duy về Hiến pháp nhé!"
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-800 text-xs">🕒 Nhật ký Thi đua Gần đây</h3>
                    <div className="space-y-2 font-bold text-[11px] text-slate-600">
                      {currentStudent.history.map((his, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-black text-slate-800 leading-snug">{his.action}</p>
                            <span className="text-[9px] text-slate-400 font-semibold">{his.date}</span>
                          </div>
                          <span className="text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded font-black">+ {his.points}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ĐÁNH GIÁ THẦY CÔ */}
          {activeTab === "giao-vien" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-1.5 mb-1 pb-3 border-b">
                  🏫 Chấm Điểm Thầy Cô rèn luyện
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-3">
                  {/* Left students lists */}
                  <div className="md:col-span-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 space-y-3">
                    <h3 className="font-black text-slate-850">👥 Quản lý Chi Hội Học Sinh</h3>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {students.map((st) => (
                        <div key={st.id} className="p-3 bg-white border rounded-xl flex justify-between items-center text-[11px]">
                          <div>
                            <p className="font-black text-slate-800">{st.name}</p>
                            <p className="text-[9px] text-slate-405 font-bold">Lớp: {st.class} | ID: {st.id}</p>
                          </div>
                          <div className="text-right font-black">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border block mb-1">⚡ {st.points}đ</span>
                            <span className="text-[9px] text-slate-400 font-bold">{st.badges.length} Huy hiệu</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right pending submissions */}
                  <div className="md:col-span-7 space-y-4">
                    <h3 className="font-black text-indigo-950 text-xs">📝 Chấm Phê Bài Nộp Triển Lãm</h3>
                    <div className="space-y-4">
                      {submissions
                        .filter((s) => s.status === "Chờ chấm")
                        .map((sub) => (
                          <div key={sub.id} className="p-4 bg-purple-50/20 border border-purple-100 rounded-2xl text-xs font-semibold text-slate-600 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[8px] font-black uppercase">{sub.type}</span>
                                <h4 className="font-black text-slate-800 text-sm mt-1">{sub.title}</h4>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold">Người nộp: {sub.studentName} ({sub.className})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{sub.description}</p>
                            
                            {sub.content.startsWith("data:image") ? (
                              <img src={sub.content} className="w-40 h-28 object-cover rounded-xl border shadow" alt="draft" />
                            ) : (
                              <p className="text-[10px] text-blue-600 bg-blue-50 border p-1 rounded font-mono truncate">{sub.content}</p>
                            )}

                            {gradingSubId === sub.id ? (
                              <form onSubmit={handleGradeSubmit} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-md text-[11px]">
                                <h5 className="font-black text-purple-900">Phiếu Phê Chấm Điểm Thi Đua</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block mb-1">Mức điểm thưởng (0-100đ)</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={gradingScore}
                                      onChange={(e) => setGradingScore(Number(e.target.value))}
                                      className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-1">Phong tặng Huy Hiệu</label>
                                    <select
                                      value={gradingBadge}
                                      onChange={(e) => setGradingBadge(e.target.value)}
                                      className="w-full bg-slate-50 border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                                    >
                                      <option value="">Không tặng huy hiệu</option>
                                      {BADGES_LIST.map((bd, bdI) => (
                                        <option key={bdI} value={bd.name}>{bd.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-1">Lời nhận xét Sư phạm của thầy cô *</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Viết lời khích lệ rèn luyện tới học sinh..."
                                    value={gradingFeedback}
                                    onChange={(e) => setGradingFeedback(e.target.value)}
                                    className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5"
                                    required
                                  ></textarea>
                                </div>
                                <div className="flex justify-end gap-1.5 text-[10px] font-black">
                                  <button type="button" onClick={() => setGradingSubId(null)} className="px-3 py-1.5 bg-slate-100 rounded-md">Hủy</button>
                                  <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-md cursor-pointer shadow">Xác nhận Lưu</button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => setGradingSubId(sub.id)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl cursor-pointer shadow-sm"
                              >
                                Tiến hành chấm điểm rèn luyện
                              </button>
                            )}
                          </div>
                        ))}

                      {submissions.filter((s) => s.status === "Chờ chấm").length === 0 && (
                        <p className="text-center font-bold text-slate-400 py-6">🎉 Chi bạ gương mẫu! Toàn bộ tác phẩm học sinh gửi lên đều đã chấm điểm hoàn tất.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: QUẢN TRỊ ADMIN */}
          {activeTab === "admin-view" && isAdminLoggedIn && (
            <AdminPanel
              students={students}
              setStudents={setStudents}
              scenarios={scenarios}
              setScenarios={setScenarios}
              submissions={submissions}
              setSubmissions={setSubmissions}
              showToast={showToast}
              badgesList={BADGES_LIST}
            />
          )}

          {/* TAB 11: THỐNG KÊ */}
          {activeTab === "thong-ke" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border-2 border-purple-100">
                <h2 className="text-xl font-black text-indigo-950 flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-6 h-6 text-pink-500" />
                  Thống Kê Sổ Sách rèn luyện hệ thống
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-5 leading-relaxed">Nhật ký theo dõi, tổng kết tỉ lệ đùa điểm rèn luyện số của học viện</p>

                {/* Grid KPI card details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { title: "Tổng học sinh rèn luyện", val: `${students.length} bạn`, desc: "Liên tục trực tuyến", style: "bg-blue-50/30 text-blue-900 border-blue-100" },
                    { title: "Tác phẩm gửi lên", val: `${submissions.length} bài`, desc: "+15 bài mới tuần này", style: "bg-pink-50/30 text-pink-900 border-pink-100" },
                    { title: "Hoàn thiện thử thách", val: "88.5%", desc: "Vượt chỉ tiêu rèn luyện", style: "bg-emerald-50/30 text-emerald-900 border-emerald-100" },
                    { title: "Hệ thống scenarios", val: `${scenarios.length} đề bài`, desc: "CRUD hoạt động tốt ⚙️", style: "bg-cyan-50/30 text-cyan-900 border-cyan-100" },
                  ].map((kpi, kIdx) => (
                    <div key={kIdx} className={`p-4 border-2 rounded-2xl ${kpi.style} text-xs font-semibold`}>
                      <span className="opacity-75">{kpi.title}</span>
                      <p className="text-xl font-black mt-1 leading-none">{kpi.val}</p>
                      <span className="text-[9px] block opacity-80 mt-1">{kpi.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Submitting chart layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-purple-50/20 border-2 border-purple-100 rounded-3xl text-xs font-semibold">
                    <h3 className="font-black text-slate-805 uppercase text-[10px] tracking-wider mb-4">Lượt tương tác các tháng rèn luyện số</h3>
                    <div className="h-40 flex items-end justify-between px-3 border-b border-l border-slate-200 pt-3">
                      {[
                        { label: "Thg 1", val: 50 },
                        { label: "Thg 2", val: 70 },
                        { label: "Thg 3", val: 120 },
                        { label: "Thg 4", val: 155 },
                        { label: "Thg 5", val: 195 },
                        { label: "Thg 6", val: 240 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                          <div
                            style={{ height: `${(item.val / 240) * 110}px` }}
                            className="w-6 bg-gradient-to-t from-pink-500 to-purple-600 rounded-t-lg shadow-sm"
                          ></div>
                          <span className="text-[9px] text-slate-400 font-bold mt-2">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-pink-50/20 border-2 border-pink-100 rounded-3xl flex flex-col justify-between text-xs font-semibold">
                    <h3 className="font-black text-slate-850 uppercase text-[10px] tracking-wider mb-4">Chủ Đề Thi Đua Đóng Góp Nhiều Nhất 🔥</h3>
                    <div className="space-y-3">
                      {[
                        { topic: "🌱 Kỹ năng rèn luyện bản thân", prc: "40%", width: "w-2/5", col: "bg-blue-400" },
                        { topic: "⚖️ Quyền trẻ em & Hiến pháp Việt Nam", prc: "35%", width: "w-1/3", col: "bg-purple-400" },
                        { topic: "🤝 Bảo vệ môi trường lớp học sạch sẽ", prc: "15%", width: "w-12", col: "bg-rose-400" },
                        { topic: "🌐 Văn hóa mạng trực tuyến sạch", prc: "10%", width: "w-8", col: "bg-yellow-400" },
                      ].map((subPl, subI) => (
                        <div key={subI} className="space-y-0.8">
                          <div className="flex justify-between text-[11px] font-black">
                            <span>{subPl.topic}</span>
                            <span>{subPl.prc}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className={`h-full ${subPl.col} ${subPl.width} rounded-full`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKFLOW ROADMAP FOOTER */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.02)] border-2 border-pink-100 text-xs">
            <h3 className="font-black text-purple-400 uppercase tracking-widest mb-3.5 text-[10px]">
              LUỒNG HOẠT ĐỘNG RÈN LUYỆN TOÀN DIỆN CỦA CHÚNG MÌNH
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { step: 1, label: "1. Đăng nhập 🎒", desc: "Đăng nhập admin hoặc học sinh" },
                { step: 2, label: "2. Chọn hoạt động 🎮", desc: "Chơi Quiz trắc nghiệm, giải quyết mâu thuẫn" },
                { step: 3, label: "3. Soạn bài sáng tạo 🎨", desc: "Nộp bài viết hoặc phác họa tranh với AI" },
                { step: 4, label: "4. Thầy cô chấm điểm 🏆", desc: "Phê duyệt học bạ rèn rũa và tặng Huy hiệu" },
                { step: 5, label: "5. Bảng vinh danh 👑", desc: "Đạt đỉnh vàng thi đua gương mẫu lớp" },
              ].map((wf) => {
                const isCurrent = activeWorkflowStep === wf.step;
                const isPassed = activeWorkflowStep > wf.step;
                return (
                  <div
                    key={wf.step}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md border-pink-300 scale-102"
                        : isPassed
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1 font-black">
                      <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] ${
                        isCurrent ? "bg-yellow-300 text-purple-950" : isPassed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {wf.step}
                      </span>
                      <span>{wf.label}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed font-bold opacity-90">{wf.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex lg:hidden justify-around items-center py-2 shadow-[0_-5px_15px_rgba(0,0,0,0.06)] font-black text-[9px] text-slate-500">
        {[
          { id: "trang-chu", label: "Home", icon: Home },
          { id: "san-choi", label: "Sân Chơi", icon: Gamepad2 },
          { id: "thu-thach", label: "Nhiệm Vụ", icon: Trophy },
          { id: "san-pham", label: "Tác Phẩm", icon: FileCode },
          { id: "ho-so", label: "Hồ Sơ", icon: User },
        ].map((btn) => {
          const Icon = btn.icon;
          const isSel = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`flex flex-col items-center gap-0.5 cursor-pointer ${isSel ? "text-pink-600 shadow-inner scale-102" : "text-slate-500"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t-4 border-pink-500 text-slate-400 mt-auto pb-6 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center space-y-2">
          <p className="text-white font-black text-sm uppercase tracking-wide">CÔNG DÂN TRẺ THCS 🌟</p>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Mô hình rèn luyện đạo đức, pháp luật thế hệ mới cho học sinh Việt Nam. Trách nhiệm cộng đồng — An ninh mạng thông hái — Tiết kiệm heo giống bảo vệ học bạ rèn luyện gương mẫu.
          </p>
          <p>© 2026 CÔNG DÂN TRẺ THCS — Sân chơi văn hóa rèn đức rèn tài rực rỡ.</p>
        </div>
      </footer>

      {/* AI Bot and Popups */}
      <AIChatBot showToast={showToast} currentStudentName={currentStudent.name} />

      {/* ADMIN SERVICE LOCKGATE AND MODAL LOGIN FLOW */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-purple-600 shadow-[0_15px_50px_rgba(109,40,217,0.35)] max-w-md w-full overflow-hidden text-xs font-bold text-slate-600 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header Dialog */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white p-5 text-center relative">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1">
                <Lock className="w-4.5 h-4.5 text-yellow-300 animate-bounce" /> ĐĂNG NHẬP BAN QUẢN TRỊ KĨ THUẬT
              </h3>
              <p className="text-pink-100 text-[10px] mt-1 font-semibold leading-normal">
                Nhập tài khoản kỹ thuật của nhà trường (admin/admin) để thăng hạng thăng chức phê chấm điểm thi đua của học sinh.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-3 right-4 text-white hover:text-rose-100 text-xl font-black cursor-pointer bg-white/10 w-7 h-7 rounded-full flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminLoginSubmit} className="p-6 space-y-4 text-xs">
              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 animate-shake">
                  <AlertCircle className="w-4.5 h-4.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block mb-1 font-extrabold text-slate-700">Tên tài khoản quản trị *</label>
                <input
                  type="text"
                  placeholder="Nhập 'admin'"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-extrabold text-slate-700">Mật mã bảo mật *</label>
                <input
                  type="password"
                  placeholder="Nhập 'admin'"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-800 border border-amber-200 leading-normal font-semibold">
                💡 Cú huých mật khẩu mẫu: Điền <strong>username: admin</strong> và <strong>password: admin</strong> là bạn có thể đăng nhập ngay tắp lự.
              </div>

              <div className="flex gap-2 pt-2 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-xl shadow-md cursor-pointer hover:scale-102"
                >
                  Xác nhận khóa mật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
