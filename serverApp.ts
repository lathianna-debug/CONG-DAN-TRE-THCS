import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "20mb" }));

// Initialize GoogleGenAI SDK safely
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API 1: Verify admin login credentials
app.post("/api/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    return res.status(200).json({
      success: true,
      token: "admin-jwt-token-stub",
      username: "admin",
      role: "admin",
    });
  }
  return res.status(401).json({
    success: false,
    message: "Tài khoản hoặc mật khẩu quản trị không chính xác!",
  });
});

// API 2: Gemini Chat Assistant ("Thầy Trí Tuệ")
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server-side.",
      });
    }

    // Format conversation history into combined string context
    const conversationContext = (history || [])
      .map((m: { sender: string; text: string }) => 
        `${m.sender === "user" ? "Học sinh" : "Thầy Trí Tuệ"}: ${m.text}`
      )
      .join("\n");

    const systemPrompt = `Bạn là Trợ lý AI giáo dục "Thầy Trí Tuệ" cực kỳ hài hước, dí dỏm, sử dụng nhiều biểu cảm icon, tuổi teen đáng yêu, chuyên trách tư vấn Kho học liệu Giáo dục Công dân (GDCD) cấp THCS trong app 'Công dân trẻ THCS'. 
Nhiệm vụ tối thượng: CHỈ tư vấn và giải đáp các học liệu/hoạt động hiện diện TRONG ỨNG DỤNG NÀY. Không trả lời câu hỏi môn học khác như Toán, Lý, Hóa, Văn học... Nếu học sinh hỏi bâng quơ hoặc ngoài môn GDCD, hãy từ chối thật dí dỏm và hướng dẫn các em quay về tìm hiểu app.

Dữ liệu của app bao gồm:
1. TRANG CHỦ: Nhiệm vụ tuần 24 (Bảo vệ môi trường), Cuộc thi vẽ sơ đồ tư duy Pháp luật trẻ em, Bảng vinh danh nhanh.
2. SÂN CHƠI GDCD: Trò chơi Rung chuông công dân, Phiên tòa giả định (hóa thân Thẩm phán/Luật sư), Đấu trường Công dân số và Mini-Quiz trắc nghiệm.
3. CÂU LẠC BỘ THỂ THAO & RÈN LUYỆN THCS: CLB Công dân trẻ, CLB Công dân số, CLB Pháp luật học đường, CLB Hòa giải viên nhí.
4. THỬ THÁCH THI ĐUA: Cá nhân, Nhóm, Lớp, Cộng đồng.
5. KHO TÌNH HUỐNG: Tình huống Khối 9 (Nam và Tuấn nhặt ví), Tình huống Khối 8 (Áp lực bạo lực mạng).
6. SẢN PHẨM HỌC SINH: Nơi nộp các tác phẩm như Infographic, Sơ đồ tư duy, Podcast, Video tuyên truyền. Có công cụ AI Thiết kế Poster concept siêu xịn sò!
7. BẢNG XẾP HẠNG: BXH rèn luyện cá nhân, theo lớp, theo CLB.
8. HỒ SƠ HỌC SINH: Điểm tích lũy, kệ huy hiệu rực rỡ, lịch sử hoạt động.
9. GÓC GIÁO VIÊN: Giao nhiệm vụ, chấm điểm bài nộp học sinh và tặng Huy hiệu.
10. THỐNG KÊ: Biểu đồ cột lượt tương tác theo tháng, các chủ đề nóng hổi rèn luyện của học sinh.

* 8 Huy hiệu vinh danh: Công dân trung thực, Công dân trách nhiệm, Công dân số an toàn, Hòa giải viên nhí, Đại sứ việc tốt, Nhà sáng tạo tích cực, Người học tích cực, Chiến binh trí tuệ.

Yêu cầu giọng điệu:
- Xưng hô ngọt ngào, thân thiện: "Thầy - Em" hoặc "Thầy Trí Tuệ - Học sinh yêu quý".
- Sử dụng teencode nhẹ nhàng vui vẻ, nhiều emoji sống động!`;

    // Use gemini-3.5-flash as the standard valid text model.
    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Học sinh hỏi: \n\n${prompt}\n\nDựa trên cuộc hội thoại trước đó:\n${conversationContext}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    const replyText = chatResponse.text || "Hic, thầy chưa nghe rõ lắm, em nói lại tí nhé!";
    return res.status(200).json({ reply: replyText });
  } catch (err: any) {
    console.error("Gemini Chat Error:", err);
    return res.status(500).json({ error: err.message || "Lỗi xử lý AI" });
  }
});

// API 3: Text-to-Speech using recommended model gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text specified" });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    // Strip emojis from TTS script to avoid reading aloud issues
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Hãy phát âm rành mạch bằng tiếng Việt một cách vui tươi ấm áp: ${cleanText}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData
    );

    const base64Audio = audioPart?.inlineData?.data;
    if (!base64Audio) {
      return res.status(204).json({ error: "Modality result has no audio bytes" });
    }

    return res.status(200).json({ base64Audio });
  } catch (err: any) {
    console.error("TTS Speech API Error:", err);
    return res.status(500).json({ error: err.message || "Lỗi đàm thoại giọng nói" });
  }
});

// API 4: AI Poster Image Creator using gemini-2.5-flash-image
app.post("/api/generate-poster", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    // Generate content with gemini-2.5-flash-image
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Thiết kế bảng vẽ phác thảo Poster GDCD, màu sắc sặc sỡ, phong cách hoạt hình trẻ em đáng yêu học đường Việt Nam về chủ đề: "Học sinh THCS tuyên truyền cổ động ${prompt}"`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    let base64Image = "";
    const candidates = imageResponse.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      return res.status(204).json({ error: "Không tìm thấy dữ liệu ảnh phát sinh" });
    }

    return res.status(200).json({ base64Image });
  } catch (err: any) {
    console.error("Image Generation API Error:", err);
    return res.status(500).json({ error: err.message || "Lỗi thiết kế tranh AI" });
  }
});

export { app };
