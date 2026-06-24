import React, { useState } from "react";
import { Student, Scenario, Submission, Choice } from "../types";
import { Plus, Trash2, ShieldAlert, Sparkles, Settings, FileText, Check } from "lucide-react";

interface AdminPanelProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  scenarios: Scenario[];
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  showToast: (msg: string) => void;
  badgesList: Array<{ name: string; icon: string }>;
}

export function AdminPanel({
  students,
  setStudents,
  scenarios,
  setScenarios,
  submissions,
  setSubmissions,
  showToast,
  badgesList,
}: AdminPanelProps) {
  // New student form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("9A1");

  // New Scenario form states
  const [isAddingScenario, setIsAddingScenario] = useState(false);
  const [scenGrade, setScenGrade] = useState("9");
  const [scenCategory, setScenCategory] = useState("⚖️ Pháp luật");
  const [scenTitle, setScenTitle] = useState("");
  const [scenText, setScenText] = useState("");

  // Choices for new Scenario
  const [choiceA, setChoiceA] = useState("");
  const [choiceAFeedback, setChoiceAFeedback] = useState("");
  const [choiceAPoints, setChoiceAPoints] = useState("0");
  const [choiceBCorrect, setChoiceBCorrect] = useState(false);

  const [choiceB, setChoiceB] = useState("");
  const [choiceBFeedback, setChoiceBFeedback] = useState("");
  const [choiceBPoints, setChoiceBPoints] = useState("50");
  const [choiceCCorrect, setChoiceCCorrect] = useState(true);

  const [choiceC, setChoiceC] = useState("");
  const [choiceCFeedback, setChoiceCFeedback] = useState("");
  const [choiceCPoints, setChoiceCPoints] = useState("10");

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      showToast("Vui lòng nhập họ và tên học sinh!");
      return;
    }

    const nextIdNumber = students.length + 1;
    const padding = nextIdNumber < 10 ? "00" : nextIdNumber < 100 ? "0" : "";
    const newSt: Student = {
      id: `HS${padding}${nextIdNumber}`,
      name: newStudentName.trim(),
      class: newStudentClass,
      points: 100,
      badges: ["Người học tích cực"],
      history: [{ action: "Gia nhập Sân chơi công dân THCS Lê Hồng Phong 🎒", points: 100, date: "Hôm nay" }],
    };

    setStudents([...students, newSt]);
    setNewStudentName("");
    showToast(`🎒 Đăng ký thành công học sinh ${newSt.name} vào chi hội ${newSt.class}!`);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${name} khỏi danh sách rèn luyện không?`)) {
      setStudents(students.filter((st) => st.id !== id));
      showToast(`❌ Đã xóa học sinh ${name} khỏi sổ quản lý.`);
    }
  };

  const handleAddScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenTitle.trim() || !scenText.trim() || !choiceA.trim() || !choiceB.trim()) {
      showToast("Vui lòng điền đầy đủ tiêu đề, nội dung và các cách giải quyết!");
      return;
    }

    const choices: Choice[] = [
      {
        id: "A",
        text: choiceA.trim(),
        isCorrect: choiceBCorrect,
        feedback: choiceAFeedback.trim() || "Ý kiến phản hồi chưa được thiết lập.",
        points: Number(choiceAPoints) || 0,
      },
      {
        id: "B",
        text: choiceB.trim(),
        isCorrect: choiceCCorrect,
        feedback: choiceBFeedback.trim() || "Phản hồi xuất sắc!",
        points: Number(choiceBPoints) || 50,
      },
    ];

    if (choiceC.trim()) {
      choices.push({
        id: "C",
        text: choiceC.trim(),
        isCorrect: false,
        feedback: choiceCFeedback.trim() || "Cảm ơn lựa chọn phòng tránh của em.",
        points: Number(choiceCPoints) || 10,
      });
    }

    const newScenario: Scenario = {
      id: `TH${Date.now().toString().slice(-4)}`,
      grade: scenGrade,
      category: scenCategory,
      title: scenTitle.trim(),
      scenario: scenText.trim(),
      choices,
    };

    setScenarios([...scenarios, newScenario]);
    // Reset form
    setScenTitle("");
    setScenText("");
    setChoiceA("");
    setChoiceAFeedback("");
    setChoiceB("");
    setChoiceBFeedback("");
    setChoiceC("");
    setChoiceCFeedback("");
    setIsAddingScenario(false);
    showToast(`📖 Đã thêm tình huống thực tế mới: "${newScenario.title}"!`);
  };

  const handleDeleteScenario = (id: string) => {
    if (confirm("Xóa tình huống này ra khỏi kho học bạ số của nhà trường?")) {
      setScenarios(scenarios.filter((sc) => sc.id !== id));
      showToast("❌ Đã xóa tình huống khỏi thư viện thành công!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-cyan-900/90 via-indigo-950 to-slate-900 text-white rounded-3xl border border-cyan-500/20 shadow-xl">
        <h3 className="text-lg font-black text-cyan-300 flex items-center gap-2 mb-2">
          <Settings className="w-6 h-6 text-cyan-400 animate-spin" />
          Bảng Đầu Não Admin kĩ thuật (Tài khoản: admin/admin)
        </h3>
        <p className="text-slate-300 text-xs font-semibold leading-relaxed">
          Đất dụng võ cho Trưởng Ban Giám Hiệu & Quản trị viên hệ thống. Bạn có đầy đủ thẩm quyền thêm sửa xóa tất cả dữ liệu rèn luyện, tình huống, và học bạ của toàn bộ học sinh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: CRUD Students list */}
        <div className="lg:col-span-6 p-6 bg-white border-2 border-cyan-100 rounded-3xl shadow-sm">
          <h4 className="font-black text-slate-800 text-sm mb-4 flex items-center justify-between">
            <span>🎒 CRUD: Danh Sách Sổ Học Sinh ({students.length})</span>
            <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full uppercase">Toàn Trường</span>
          </h4>

          <form onSubmit={handleAddStudent} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-5 space-y-3 font-semibold text-xs text-slate-600">
            <p className="font-black text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Thêm nhanh học bạ học sinh mới:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Hoàng Khánh Linh..."
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
              <select
                value={newStudentClass}
                onChange={(e) => setNewStudentClass(e.target.value)}
                className="border border-slate-200 px-3 py-2 rounded-xl bg-white"
              >
                <option value="9A1">9A1</option>
                <option value="9A2">9A2</option>
                <option value="8A1">8A1</option>
                <option value="8A2">8A2</option>
                <option value="7A1">7A1</option>
                <option value="6A4">6A4</option>
              </select>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-4 py-2 rounded-xl cursor-pointer">
                Thêm học bạ
              </button>
            </div>
          </form>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {students.map((st) => (
              <div key={st.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-2xl text-xs hover:border-cyan-300 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">{st.name}</span>
                    <span className="bg-slate-200 text-slate-600 font-bold text-[9px] px-2 py-0.5 rounded-full">{st.class}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">MSHS: {st.id} — Sở hữu {st.badges.length} Huy hiệu</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-150">⚡ {st.points}đ</span>
                  <button
                    onClick={() => handleDeleteStudent(st.id, st.name)}
                    className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl cursor-pointer"
                    title="Xóa học sinh này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CRUD Scenario Questions */}
        <div className="lg:col-span-6 p-6 bg-white border-2 border-cyan-100 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <span>📖 CRUD: Quản lý Kho Tình Huống</span>
            </h4>
            <button
              onClick={() => setIsAddingScenario(!isAddingScenario)}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs rounded-xl flex items-center gap-1 z-10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingScenario ? "Hủy" : "Soạn tình huống mới"}
            </button>
          </div>

          {isAddingScenario ? (
            <form onSubmit={handleAddScenario} className="p-4 bg-cyan-50/50 border-2 border-cyan-200 rounded-2xl space-y-3 font-semibold text-xs text-slate-600">
              <h5 className="font-black text-cyan-900 flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-500 animate-spin" /> Biên Soạn Đề Bài Mới</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Dành Cho Khối Lớp</label>
                  <select value={scenGrade} onChange={(e) => setScenGrade(e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl">
                    <option value="9">Khối 9</option>
                    <option value="8">Khối 8</option>
                    <option value="7">Khối 7</option>
                    <option value="6">Khối 6</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Chủ Đề Giáo Dục</label>
                  <select value={scenCategory} onChange={(e) => setScenCategory(e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl">
                    <option value="⚖️ Pháp luật">⚖️ Pháp luật</option>
                    <option value="🌱 Kỹ năng sống">🌱 Kỹ năng sống</option>
                    <option value="🤝 Yêu thương gia đình">🤝 Yêu thương gia đình</option>
                    <option value="🛡️ Tự chủ tinh thần">🛡️ Tự chủ tinh thần</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Tiêu Đề Tình Huống *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tuyên truyền bảo vệ nguồn nước trong CLB..."
                  value={scenTitle}
                  onChange={(e) => setScenTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Nội Dung Tình Huống Chi Tiết *</label>
                <textarea
                  rows={2}
                  placeholder="Ghi ra tình huống giả lập, mâu thuẫn cần giải quyết..."
                  value={scenText}
                  onChange={(e) => setScenText(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl focus:ring-1 focus:ring-cyan-500"
                  required
                ></textarea>
              </div>

              <div className="space-y-2 pt-2 border-t border-cyan-150">
                <p className="font-extrabold text-cyan-950 text-xs">Cách giải quyết A (Điểm tiêu cực - Sai trái):</p>
                <input
                  type="text"
                  placeholder="Ý kiến cư xử sai..."
                  value={choiceA}
                  onChange={(e) => setChoiceA(e.target.value)}
                  className="w-full bg-white border px-3 py-2 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Phản hồi giáo huấn học sinh..."
                  value={choiceAFeedback}
                  onChange={(e) => setChoiceAFeedback(e.target.value)}
                  className="w-full bg-white border px-3 py-1.5 rounded-xl italic"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-cyan-150">
                <p className="font-extrabold text-cyan-950 text-xs">Cách giải quyết B (Lựa chọn chính xác nhất - Công dân mẫu mực):</p>
                <input
                  type="text"
                  placeholder="Ý kiến cư xử gương mẫu..."
                  value={choiceB}
                  onChange={(e) => setChoiceB(e.target.value)}
                  className="w-full bg-white border px-3 py-2 rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Lời phê bình khen ngợi rực rỡ..."
                  value={choiceBFeedback}
                  onChange={(e) => setChoiceBFeedback(e.target.value)}
                  className="w-full bg-white border px-3 py-1.5 rounded-xl italic"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-3 font-black">
                <button type="button" onClick={() => setIsAddingScenario(false)} className="px-4 py-2 bg-slate-200 rounded-xl cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl cursor-pointer">
                  Lưu Tình Huống
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {scenarios.map((sc) => (
                <div key={sc.id} className="p-4 border-2 border-slate-100 bg-slate-50/20 hover:bg-slate-50 rounded-2xl flex items-start gap-4 justify-between transition-all">
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="bg-cyan-100 text-cyan-800 font-black text-[9px] px-2 py-0.5 rounded-full">Lớp {sc.grade}</span>
                      <span className="text-cyan-600 font-extrabold">{sc.category}</span>
                      <span className="text-slate-400 font-bold">Mã: {sc.id}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-sm mb-1">{sc.title}</h5>
                    <p className="text-slate-500 font-semibold line-clamp-2 leading-relaxed">{sc.scenario}</p>
                    <div className="flex gap-2 mt-2 font-bold text-[9px] text-slate-400">
                      <span>✓ Cách cư xử: {sc.choices.length} phương án</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteScenario(sc.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl cursor-pointer transition-all self-center"
                    title="Xóa tình huống này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
