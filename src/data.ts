import { Student, Submission, Scenario } from "./types";

export const INITIAL_STUDENTS: Student[] = [
  { 
    id: "HS001", 
    name: "Nguyễn Minh Triết", 
    class: "9A1", 
    points: 450, 
    badges: ["Công dân trung thực", "Người học tích cực", "Chiến binh trí tuệ"], 
    history: [
      { action: "Hoàn thành Mini-Quiz đạt điểm tuyệt đối", points: 100, date: "2026-06-20" }, 
      { action: "Giải quyết tình huống nhặt của rơi", points: 50, date: "2026-06-18" }
    ] 
  },
  { 
    id: "HS002", 
    name: "Lê Mai Chi", 
    class: "8A2", 
    points: 380, 
    badges: ["Đại sứ việc tốt", "Nhà sáng tạo tích cực"], 
    history: [
      { action: "Nộp dự án tuyên truyền xuất sắc", points: 120, date: "2026-06-19" }
    ] 
  },
  { 
    id: "HS003", 
    name: "Trần Hoàng Nam", 
    class: "9A3", 
    points: 410, 
    badges: ["Công dân trách nhiệm", "Hòa giải viên nhí"], 
    history: [
      { action: "Hoàn thành thử thách Lớp học hạnh phúc", points: 150, date: "2026-06-17" }
    ] 
  },
  { 
    id: "HS004", 
    name: "Phạm Bích Phương", 
    class: "7A1", 
    points: 320, 
    badges: ["Công dân số an toàn"], 
    history: [
      { action: "Giải đáp thử thách Công dân số an toàn", points: 80, date: "2026-06-15" }
    ] 
  },
  { 
    id: "HS005", 
    name: "Vũ Đức Anh", 
    class: "6A4", 
    points: 290, 
    badges: ["Người học tích cực"], 
    history: [
      { action: "Tham gia giải quyết tình huống lớp 6", points: 50, date: "2026-06-14" }
    ] 
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "SUB001",
    studentId: "HS001",
    studentName: "Nguyễn Minh Triết",
    className: "9A1",
    title: "Infographic: Phòng chống bạo lực học đường 🛡️",
    type: "Infographic",
    description: "Sản phẩm tóm tắt siêu dễ thương về các kỹ năng nhận diện và giải quyết ôn hòa xung đột học đường.",
    content: "drive.google.com/minhtriet-gdcd9",
    status: "Đã chấm",
    score: 95,
    feedback: "Trình bày xuất sắc quá em ơi! Đồ họa trực quan màu sắc bắt mắt, thông tin cực kỳ hữu ích!",
    badgeAwarded: "Nhà sáng tạo tích cực",
    date: "2026-06-18"
  },
  {
    id: "SUB002",
    studentId: "HS002",
    studentName: "Lê Mai Chi",
    className: "8A2",
    title: "Video Podcast: Lòng biết ơn và Trách nhiệm gia đình 💖",
    type: "Video",
    description: "Podcast vui nhộn phỏng vấn nhanh các bạn học sinh về cách bày tỏ tình thương yêu với cha mẹ hằng ngày.",
    content: "youtube.com/watch?v=maichi-podgdcd",
    status: "Chờ chấm",
    score: null,
    feedback: "",
    badgeAwarded: "",
    date: "2026-06-20"
  },
  {
    id: "SUB003",
    studentId: "HS003",
    studentName: "Trần Hoàng Nam",
    className: "9A3",
    title: "Sơ đồ tư duy: Hệ thống pháp luật quyền trẻ em 💡",
    type: "Sơ đồ tư duy",
    description: "Sơ đồ vẽ tay đầy màu sắc hệ thống hóa các bộ luật cơ bản liên quan mật thiết tới chúng mình.",
    content: "canva.com/design/hoangnam9a3",
    status: "Chờ chấm",
    score: null,
    feedback: "",
    badgeAwarded: "",
    date: "2026-06-21"
  }
];

export const KHO_TINH_HUONG: Scenario[] = [
  {
    id: "TH001",
    grade: "9",
    category: "⚖️ Pháp luật",
    title: "Tình huống: Nhặt được của rơi trên đường học về",
    scenario: "Trên đường đi học về vui vẻ, Nam và Tuấn vô tình nhặt được một chiếc ví dày cộp chứa rất nhiều tiền mặt và giấy tờ tùy thân quan trọng mang tên một người xa lạ. Tuấn hào hứng rủ Nam: 'Hay là giữ lại chia đôi rồi đi net tẹt ga đi, không ai biết đâu!'. Nếu em là Nam, em sẽ làm gì đây?",
    choices: [
      { id: "A", text: "Đồng ý với Tuấn ngay, hiếm khi gặp may mắn thế này mà lị!", isCorrect: false, feedback: "Ối nhìn kìa! Hành vi này không những vi phạm đạo đức trung thực mà còn vi phạm pháp luật về chiếm đoạt tài sản của người khác đó nha!", points: 0 },
      { id: "B", text: "Khuyên Tuấn mang nộp ngay cho đồn Công an hoặc thầy cô Ban giám hiệu trường gần nhất.", isCorrect: true, feedback: "Tuyệt đỉnh xuất sắc! Đây là hành động cực kỳ trung thực, xứng đáng nhận trọn 50 điểm công dân mẫu mực!", points: 50 },
      { id: "C", text: "Để ví lại chỗ cũ, kệ đi để tránh rắc rối không đáng có.", isCorrect: false, feedback: "Mặc dù em không lấy, nhưng hành động thờ ơ chưa thể hiện được trách nhiệm của một công dân trẻ tích cực đâu nè.", points: 10 }
    ]
  },
  {
    id: "TH002",
    grade: "8",
    category: "🌱 Kỹ năng sống",
    title: "Tình huống: Áp lực bạo lực mạng xã hội",
    scenario: "Lan phát hiện một nhóm bạn cùng khối đăng ảnh chụp dìm ngoại hình của mình kèm những lời lẽ châm chọc thô tục trên Facebook. Lan khóc rất nhiều, cảm thấy hoảng sợ và không dám đi học nữa. Em sẽ khuyên Lan ứng xử thế nào?",
    choices: [
      { id: "A", text: "Lập nick clone vào chửi bới, dìm hàng xúc phạm lại nhóm bạn kia cho bõ tức!", isCorrect: false, feedback: "Trả đũa tiêu cực chỉ khiến mâu thuẫn càng bùng nổ to hơn và tụi mình cũng vô tình vi phạm luật ứng xử văn minh mạng đấy!", points: 0 },
      { id: "B", text: "Im lặng chịu đựng, xin bố mẹ nghỉ học hẳn để trốn tránh mọi người.", isCorrect: false, feedback: "Trốn tránh không thể giải quyết triệt để vấn đề mà còn làm gián đoạn việc học hành và ảnh hưởng tâm lý của em nhiều hơn.", points: 5 },
      { id: "C", text: "Chụp ảnh màn hình làm bằng chứng, tâm sự với bố mẹ hoặc thầy cô để được bảo vệ và can thiệp kịp thời.", isCorrect: true, feedback: "Cực kỳ chuẩn xác! Khi đối mặt với bạo lực mạng, tìm kiếm sự đồng hành trợ giúp từ người lớn tin cậy là phương án an toàn nhất!", points: 50 }
    ]
  }
];

export const MINI_QUIZ = [
  {
    id: 1,
    question: "Hành động nào dưới đây thể hiện tụi mình tôn trọng tài sản của người khác thế nhỉ?",
    options: [
      { text: "Tự ý mượn xe đạp của bạn phóng đi khi bạn đang ngủ quên", correct: false },
      { text: "Nhặt được chiếc tai nghe xịn và nỗ lực đăng bài tìm chủ nhân trả lại", correct: true },
      { text: "Giữ chặt ví người khác đánh rơi vì tự nhủ 'ai bảo không giữ cẩn thận'", correct: false },
      { text: "Làm gãy thước kẻ mượn của bạn nhưng giấu nhẹm đi xem như không biết", correct: false }
    ]
  },
  {
    id: 2,
    question: "Cơ quan quyền lực cao nhất nào có thẩm quyền ban hành Hiến pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam?",
    options: [
      { text: "Chính phủ lâm thời", correct: false },
      { text: "Tòa án nhân dân tối cao", correct: false },
      { text: "Quốc hội nước Việt Nam", correct: true },
      { text: "Bộ Tư pháp", correct: false }
    ]
  }
];

export const BADGES_LIST = [
  { name: "Công dân trung thực", desc: "Luôn nói thật, làm đúng và tôn trọng sự thật trong học tập và cuộc sống.", color: "from-blue-400 via-indigo-400 to-cyan-500", icon: "🛡️", shadow: "shadow-cyan-400/30" },
  { name: "Công dân trách nhiệm", desc: "Hoàn thành mọi nghĩa vụ cá nhân, tập thể và cộng đồng xuất sắc.", color: "from-emerald-400 via-teal-400 to-green-500", icon: "🤝", shadow: "shadow-emerald-400/30" },
  { name: "Công dân số an toàn", desc: "Ứng xử văn minh, tự bảo vệ bản thân và tôn trọng luật an ninh mạng.", color: "from-cyan-400 via-sky-400 to-blue-500", icon: "🌐", shadow: "shadow-blue-400/30" },
  { name: "Hòa giải viên nhí", desc: "Biết lắng nghe, thấu hiểu và khéo léo giải quyết xung đột học đường.", color: "from-purple-400 via-fuchsia-400 to-pink-500", icon: "🕊️", shadow: "shadow-fuchsia-400/30" },
  { name: "Đại sứ việc tốt", desc: "Tích cực giúp đỡ mọi người xung quanh, lan tỏa hành động tử tế.", color: "from-rose-400 via-red-400 to-orange-500", icon: "❤️", shadow: "shadow-rose-400/30" },
  { name: "Nhà sáng tạo tích cực", desc: "Tạo ra các sản phẩm tuyên truyền GDCD sáng tạo, độc đáo.", color: "from-amber-400 via-yellow-400 to-orange-500", icon: "💡", shadow: "shadow-amber-400/30" },
  { name: "Người học tích cực", desc: "Tham gia giải quyết tình huống và làm trắc nghiệm đầy đủ.", color: "from-lime-400 via-emerald-450 to-green-500", icon: "🎓", shadow: "shadow-lime-400/30" },
  { name: "Chiến binh trí tuệ", desc: "Đạt điểm số tuyệt đối trong các kỳ thi học thuật và thách thức.", color: "from-yellow-400 via-amber-400 to-red-500", icon: "⚡", shadow: "shadow-yellow-400/30" }
];
