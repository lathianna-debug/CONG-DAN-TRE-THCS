import { useState, useRef } from "react";
import { Send, Volume2, VolumeX, Crown, Sparkles } from "lucide-react";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

interface AIChatBotProps {
  showToast: (msg: string) => void;
  currentStudentClass?: string;
  currentStudentName?: string;
}

export function AIChatBot({ showToast, currentStudentName = "Học sinh" }: AIChatBotProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hế lô ${currentStudentName}! 🤖 Thầy là Trợ lý AI chuyên trách Sân chơi Giáo Dục Công Dân THCS đây. Thầy có thể hướng dẫn em mọi ngấc ngách hoạt động: giải quyết 2 tình huống khó nhằn của khối 8 & khối 9, luyện trắc nghiệm Mini-Quiz đỉnh chóp, tham gia các Câu Lạc Bộ sôi động hay cách săn cả bộ 8 Huy hiệu vinh danh nha! Em có thể nhấp vào biểu tượng Loa 🔊 để lắng nghe giọng nói ấm áp của thầy nhé!`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const callGeminiAPIWithRetry = async (url: string, payload: any, maxRetries = 3) => {
    let delay = 1000;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          return await response.json();
        }
        throw new Error(`Thử lại lần ${i + 1} không thành công...`);
      } catch (err) {
        if (i === maxRetries - 1) throw err;
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  };

  const getSimulatedResponse = (input: string) => {
    const text = input.toLowerCase();
    if (text.includes("huy hiệu") || text.includes("badge")) {
      return "Cách săn Huy hiệu siêu dễ nha! 🛡️ Em chỉ cần làm trắc nghiệm Mini-Quiz đạt điểm tối đa để nhận 'Chiến binh trí tuệ', giải quyết các tình huống ở mục 'Kho tình huống' để nhận 'Người học tích cực', hoặc nộp các tác phẩm tuyên truyền học tập để Thầy Cô phê duyệt và tặng 'Nhà sáng tạo tích cực' nhé!";
    }
    if (text.includes("ví tiền") || text.includes("nhặt") || text.includes("của rơi")) {
      return "Tình huống nhặt được ví tiền ở khối 9 dạy chúng mình tính trung thực đấy! ⚖️ Hành vi khuyên bạn Tuấn trả lại ví cho đồn công an hoặc thầy cô là hành động gương mẫu điểm 10, xứng đáng được lan tỏa rộng khắp.";
    }
    if (text.includes("hạnh phúc") || text.includes("lớp học")) {
      return "Thử thách 'Lớp học Hạnh phúc' (+200 điểm) cực kỳ ý nghĩa! 🕊️ Cả lớp mình sẽ cùng nhau ký bản cam kết ứng xử trực tuyến văn minh, cam kết tôn trọng bạn bè, giúp ngăn chặn triệt để bạo lực học đường.";
    }
    if (text.includes("vẽ") || text.includes("poster") || text.includes("môi trường")) {
      return "Để vẽ poster bảo vệ môi trường, em hãy chuyển sang tab 'Sản Phẩm Học Sinh' 🎨, nhập ý tưởng vẽ poster tuyên truyền rồi ấn nút 'Tạo Poster Bằng AI' nha! Trợ lý thiết kế AI sẽ phác thảo mẫu poster siêu đẹp cho em ngay.";
    }
    return "Thầy Trí Tuệ nghe rõ rồi nè! 🤖 Em hãy tích cực tham gia trả lời các câu hỏi tình huống thực tế, chơi trắc nghiệm thi đua lớp để rèn luyện bản thân thành một công dân ảo gương mẫu tiêu biểu nha!";
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput;
    if (!textToSend.trim()) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text: textToSend }];
    setChatMessages(newMessages);
    if (!customMessage) setChatInput("");
    setIsChatLoading(true);

    try {
      const result = await callGeminiAPIWithRetry("/api/chat", {
        prompt: textToSend,
        history: newMessages.slice(-6),
      });

      const replyText = result?.reply || "Hic, thầy chưa nghe rành rọt lắm, em nói lại tí nhé!";
      setChatMessages((prev) => [...prev, { sender: "ai", text: replyText }]);
    } catch (err) {
      console.warn("Server chatbot errored, using offline logic fallback:", err);
      const simulatedText = getSimulatedResponse(textToSend);
      setChatMessages((prev) => [...prev, { sender: "ai", text: simulatedText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const playPCM16Audio = (base64Data: string, sampleRate = 24000) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const buffer = byteArray.buffer;

      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);

      const writeString = (v: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          v.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + buffer.byteLength, true);
      writeString(view, 8, "WAVE");
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // Raw PCM
      view.setUint16(22, 1, true); // Mono channel
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      writeString(view, 36, "data");
      view.setUint32(40, buffer.byteLength, true);

      const wavBlob = new Blob([wavHeader, buffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(wavBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => {
        setPlayingAudioId(null);
      };
    } catch (error) {
      console.error("PCM Audio playback error:", error);
      showToast("Hic, không thể phát âm thanh của Thầy rồi!");
      setPlayingAudioId(null);
    }
  };

  const handleListenSpeech = async (msgIndex: number, textToSpeak: string) => {
    if (playingAudioId === msgIndex) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(msgIndex);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.base64Audio) {
          playPCM16Audio(result.base64Audio);
          return;
        }
      }
      throw new Error("TTS endpoint failed");
    } catch (err) {
      console.warn("TTS server speech failed. Falling back to client-side Synthesis:", err);
      if ("speechSynthesis" in window) {
        const cleanText = textToSpeak.replace(
          /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g,
          ""
        );
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "vi-VN";
        utterance.rate = 1.0;
        utterance.onend = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        showToast("Trình duyệt không hỗ trợ phát giọng nói rèn luyện!");
        setPlayingAudioId(null);
      }
    }
  };

  return (
    <>
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-3xl shadow-[0_15px_50px_rgba(109,40,217,0.3)] border-4 border-purple-500 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-inner animate-pulse">
                🤖
              </div>
              <div>
                <h4 className="font-black text-xs text-indigo-50 flex items-center gap-1">
                  Thầy Trí Tuệ (AI) <Crown className="w-3 h-3 text-yellow-300" />
                </h4>
                <p className="text-[10px] text-yellow-300 font-black flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                  Đang trực tuyến hỗ trợ giọng nói
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white font-black text-2xl p-1 bg-white/10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-purple-50/30 to-pink-50/10 text-xs font-bold scrollbar-thin">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl p-3.5 shadow-md leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border-2 border-purple-50 rounded-tl-none"
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <p className="flex-1">{msg.text}</p>
                    {msg.sender === "ai" && (
                      <button
                        onClick={() => handleListenSpeech(idx, msg.text)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          playingAudioId === idx ? "bg-pink-100 text-pink-600 animate-pulse" : "bg-slate-100 hover:bg-purple-100 text-purple-600"
                        }`}
                        title="Nghe Thầy AI nói"
                      >
                        {playingAudioId === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 border-2 border-purple-50 rounded-3xl rounded-tl-none p-3.5 flex items-center gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="p-2 border-t border-purple-50 bg-white flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[10px] font-black text-purple-700">
            {[
              "Làm sao để săn Huy hiệu? 🛡️",
              "Kể về tình huống Ví tiền ⚖️",
              "Thử thách Lớp học Hạnh phúc là gì? 🌱",
              "Vẽ Poster bảo vệ môi trường AI",
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-3 py-1.5 rounded-full bg-purple-50 border-2 border-purple-100 hover:bg-purple-100/50 transition-all flex-shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-purple-50 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Hỏi thầy Trí Tuệ về học liệu GDCD nhé..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 px-4 py-3 border-2 border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs font-bold"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-2xl transition-all shadow-md flex items-center justify-center hover:scale-105 cursor-pointer"
            >
              <Send className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 md:bottom-6 right-6 h-16 w-16 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white rounded-full shadow-[0_8px_30px_rgba(236,72,153,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-white group z-50 cursor-pointer"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
        <span className="text-2xl group-hover:animate-bounce">🤖</span>
      </button>
    </>
  );
}
