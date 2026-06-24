-- 1. Tạo bảng Học sinh (students)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class VARCHAR(50) NOT NULL,
    points INT DEFAULT 100,
    badges TEXT[] DEFAULT '{}',
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tạo bảng Kho Tình Huống (scenarios)
CREATE TABLE IF NOT EXISTS scenarios (
    id VARCHAR(50) PRIMARY KEY,
    grade VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    scenario TEXT NOT NULL,
    choices JSONB NOT NULL, -- Mảng lựa chọn trắc nghiệm và kết quả phản hồi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng Bài nộp Học tập (submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT, -- Liên kết tài liệu hoặc hình ảnh phác thảo AI
    status VARCHAR(50) DEFAULT 'Chờ chấm',
    score INT DEFAULT NULL,
    feedback TEXT,
    badge_awarded VARCHAR(100),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA - DỮ LIỆU BAN ĐẦU MẪU ĐỂ KHỞI TẠO
-- ==========================================

-- Chèn dữ liệu Học sinh mẫu
INSERT INTO students (id, name, class, points, badges, history) VALUES
('HS001', 'Nguyễn Minh Triết', '9A1', 450, 
 ARRAY['Công dân trung thực', 'Người học tích cực', 'Chiến binh trí tuệ'], 
 '[
   {"action": "Hoàn thành Mini-Quiz đạt điểm tuyệt đối", "points": 100, "date": "2026-06-20"},
   {"action": "Giải quyết tình huống nhặt của rơi", "points": 50, "date": "2026-06-18"}
 ]'::jsonb),
('HS002', 'Lê Mai Chi', '8A2', 380, 
 ARRAY['Đại sứ việc tốt', 'Nhà sáng tạo tích cực'], 
 '[
   {"action": "Nộp dự án tuyên truyền xuất sắc", "points": 120, "date": "2026-06-19"}
 ]'::jsonb),
('HS003', 'Trần Hoàng Nam', '9A3', 410, 
 ARRAY['Công dân trách nhiệm', 'Hòa giải viên nhí'], 
 '[
   {"action": "Hoàn thành thử thách Lớp học hạnh phúc", "points": 150, "date": "2026-06-17"}
 ]'::jsonb),
('HS004', 'Phạm Bích Phương', '7A1', 320, 
 ARRAY['Công dân số an toàn'], 
 '[
   {"action": "Giải đáp thử thách Công dân số an toàn", "points": 80, "date": "2026-06-15"}
 ]'::jsonb),
('HS005', 'Vũ Đức Anh', '6A4', 290, 
 ARRAY['Người học tích cực'], 
 '[
   {"action": "Tham gia giải quyết tình huống lớp 6", "points": 50, "date": "2026-06-14"}
 ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Chèn dữ liệu Tình huống GDCD mẫu
INSERT INTO scenarios (id, grade, category, title, scenario, choices) VALUES
('TH001', '9', '⚖️ Pháp luật', 'Tình huống: Nhặt được của rơi trên đường học về', 
 'Trên đường đi học về vui vẻ, Nam và Tuấn vô tình nhặt được một chiếc ví dày cộp chứa rất nhiều tiền mặt và giấy tờ tùy thân quan trọng mang tên một người xa lạ. Tuấn hào hứng rủ Nam: ''Hay là giữ lại chia đôi rồi đi net tẹt ga đi, không ai biết đâu!''. Nếu em là Nam, em sẽ làm gì đây?',
 '[
   {"id": "A", "text": "Đồng ý với Tuấn ngay, hiếm khi gặp may mắn thế này mà lị!", "isCorrect": false, "feedback": "Ối nhìn kìa! Hành vi này không những vi phạm đạo đức trung thực mà còn vi phạm pháp luật về chiếm đoạt tài sản của người khác đó nha!", "points": 0},
   {"id": "B", "text": "Khuyên Tuấn mang nộp ngay cho đồn Công an hoặc thầy cô Ban giám hiệu trường gần nhất.", "isCorrect": true, "feedback": "Tuyệt đỉnh xuất sắc! Đây là hành động cực kỳ trung thực, xứng đáng nhận trọn 50 điểm công dân mẫu mực!", "points": 50},
   {"id": "C", "text": "Để ví lại chỗ cũ, kệ đi để tránh rắc rối không đáng có.", "isCorrect": false, "feedback": "Mặc dù em không lấy, nhưng hành động thờ ơ chưa thể hiện được trách nhiệm của một công dân trẻ tích cực đâu nè.", "points": 10}
 ]'::jsonb),
('TH002', '8', '🌱 Kỹ năng sống', 'Tình huống: Áp lực bạo lực mạng xã hội', 
 'Lan phát hiện một nhóm bạn cùng khối đăng ảnh chụp dìm ngoại hình của mình kèm những lời lẽ châm chọc thô tục trên Facebook. Lan khóc rất nhiều, cảm thấy hoảng sợ và không dám đi học nữa. Em sẽ khuyên Lan ứng xử thế nào?',
 '[
   {"id": "A", "text": "Lập nick clone vào chửi bới, dìm hàng xúc phạm lại nhóm bạn kia cho bõ tức!", "isCorrect": false, "feedback": "Trả đũa tiêu cực chỉ khiến mâu thuẫn càng bùng nổ to hơn và tụi mình cũng vô tình vi phạm luật ứng xử văn minh mạng đấy!", "points": 0},
   {"id": "B", "text": "Im lặng chịu đựng, xin bố mẹ nghỉ học hẳn để trốn tránh mọi người.", "isCorrect": false, "feedback": "Trốn tránh không thể giải quyết triệt để vấn đề mà còn làm gián đoạn việc học hành và ảnh hưởng tâm lý của em nhiều hơn.", "points": 5},
   {"id": "C", "text": "Chụp ảnh màn hình làm bằng chứng, tâm sự với bố mẹ hoặc thầy cô để được bảo vệ và can thiệp kịp thời.", "isCorrect": true, "feedback": "Cực kỳ chuẩn xác! Khi đối mặt với bạo lực mạng, tìm kiếm sự đồng hành trợ giúp từ người lớn tin cậy là phương án an toàn nhất!", "points": 50}
 ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Chèn dữ liệu Bài nộp Học sinh mẫu
INSERT INTO submissions (id, student_id, student_name, class_name, title, type, description, content, status, score, feedback, badge_awarded, date) VALUES
('SUB001', 'HS001', 'Nguyễn Minh Triết', '9A1', 'Infographic: Phòng chống bạo lực học đường 🛡️', 'Infographic', 
 'Sản phẩm tóm tắt siêu dễ thương về các kỹ năng nhận diện và giải quyết ôn hòa xung đột học đường.', 
 'drive.google.com/minhtriet-gdcd9', 'Đã chấm', 95, 
 'Trình bày xuất sắc quá em ơi! Đồ họa trực quan màu sắc bắt mắt, thông tin cực kỳ hữu ích!', 
 'Nhà sáng tạo tích cực', '2026-06-18'),
('SUB002', 'HS002', 'Lê Mai Chi', '8A2', 'Video Podcast: Lòng biết ơn và Trách nhiệm gia đình 💖', 'Video', 
 'Podcast vui nhộn phỏng vấn nhanh các bạn học sinh về cách bày tỏ tình thương yêu với cha mẹ hằng ngày.', 
 'youtube.com/watch?v=maichi-podgdcd', 'Chờ chấm', NULL, '', '', '2026-06-20'),
('SUB003', 'HS003', 'Trần Hoàng Nam', '9A3', 'Sơ đồ tư duy: Hệ thống pháp luật quyền trẻ em 💡', 'Sơ đồ tư duy', 
 'Sơ đồ vẽ tay đầy màu sắc hệ thống hóa các bộ luật cơ bản liên quan mật thiết tới chúng mình.', 
 'canva.com/design/hoangnam9a3', 'Chờ chấm', NULL, '', '', '2026-06-21')
ON CONFLICT (id) DO NOTHING;
