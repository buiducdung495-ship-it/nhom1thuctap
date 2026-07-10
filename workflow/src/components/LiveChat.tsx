import React, { useState } from 'react';
import { ChatMessage, User } from '../types';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface LiveChatProps {
  chatMessages: ChatMessage[];
  currentUser: User;
  onSendChatMessage: (content: string, isAIAssistant: boolean) => Promise<ChatMessage>;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  chatMessages,
  currentUser,
  onSendChatMessage
}) => {
  const [activeChatTab, setActiveChatTab] = useState<'ai' | 'corporate'>('ai');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filter messages based on tab selection
  // AI Bot Messages: have either senderId === 'ai-bot' or is AI assistant contextual
  const aiMessages = chatMessages.filter(m => m.receiverId === 'ai-bot' || m.senderId === 'ai-bot');
  const corporateMessages = chatMessages.filter(m => m.receiverId !== 'ai-bot' && m.senderId !== 'ai-bot');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const content = input;
    setInput('');
    setIsSending(true);

    try {
      await onSendChatMessage(content, activeChatTab === 'ai');
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    'Mức khấu hao bán thanh lý máy tính cũ được tính như thế nào?',
    'Quy chế xin nghỉ phép hành chính duyệt tự động ra sao?',
    'Làm sao để đăng ký đổi máy tính RAM 8GB sang 16GB?',
    'Lương cơ bản của tôi bị trừ bao nhiêu nếu mua máy trả góp?'
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="chat-hub-view">
      {/* Tab Switcher & Quick Guides (Left Column) */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Kênh liên lạc trực tiếp
          </h3>

          <div className="space-y-2">
            {/* Tab 1: AI Assistant */}
            <button
              onClick={() => setActiveChatTab('ai')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                activeChatTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50'
              }`}
            >
              <Bot size={18} className={activeChatTab === 'ai' ? 'text-white' : 'text-indigo-600'} />
              <div>
                <h4 className="text-xs font-bold">Trợ Lý Nhân Sự AI</h4>
                <p className={`text-[10px] mt-0.5 ${activeChatTab === 'ai' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Hỏi đáp chính sách công ty bằng Gemini
                </p>
              </div>
            </button>

            {/* Tab 2: Corporate Chat */}
            <button
              onClick={() => setActiveChatTab('corporate')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                activeChatTab === 'corporate'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50'
              }`}
            >
              <MessageSquare size={18} className={activeChatTab === 'corporate' ? 'text-white' : 'text-indigo-600'} />
              <div>
                <h4 className="text-xs font-bold">Kênh Doanh Nghiệp (All)</h4>
                <p className={`text-[10px] mt-0.5 ${activeChatTab === 'corporate' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Chat chung trao đổi nội bộ nhân sự
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQ Quick Links for AI Tab */}
        {activeChatTab === 'ai' && (
          <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100/50 space-y-3">
            <h4 className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-1">
              <Sparkles size={12} />
              Gợi ý câu hỏi nhanh:
            </h4>
            <div className="space-y-1.5">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-[11px] text-indigo-950 font-medium bg-white hover:bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg transition-colors leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Conversation Screen (Right Column) */}
      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-[500px] flex flex-col justify-between overflow-hidden">
          {/* Active Header */}
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                {activeChatTab === 'ai' ? <Bot size={18} /> : <MessageSquare size={18} />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  {activeChatTab === 'ai' ? 'Trợ Lý Nội Quy Thông Minh (AI HR Bot)' : 'Kênh Đàm Thoại Chung Nội Bộ'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {activeChatTab === 'ai' ? 'Giải đáp chính xác quy chế, máy móc thiết bị, mua thanh lý bằng LLM' : 'Mọi nhân sự công ty có thể tham gia trao đổi trực tiếp'}
                </p>
              </div>
            </div>

            {activeChatTab === 'ai' && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full font-mono uppercase">
                <ShieldCheck size={11} />
                Chính sách bảo mật dữ liệu tuyệt đối
              </span>
            )}
          </div>

          {/* Conversation Messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 flex flex-col justify-end">
            <div className="space-y-3 overflow-y-auto max-h-[350px]">
              
              {/* If no messages, render welcome */}
              {((activeChatTab === 'ai' ? aiMessages : corporateMessages).length === 0) && (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                  <HelpCircle size={32} className="text-slate-300 stroke-1 mb-2 animate-pulse" />
                  <p className="text-xs">Chưa có cuộc hội thoại nào.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Nhập câu hỏi ở khung dưới để trò chuyện ngay.</p>
                </div>
              )}

              {(activeChatTab === 'ai' ? aiMessages : corporateMessages).map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isSystemBot = msg.senderId === 'ai-bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {isSystemBot ? (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center border border-indigo-500 shadow-sm">
                          <Bot size={13} />
                        </div>
                      ) : (
                        <img
                          src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="space-y-1 text-left">
                      <div className={`flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] font-bold text-slate-600">{isSystemBot ? 'Trợ Lý AI HR' : msg.senderName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-3xs'
                          : isSystemBot
                            ? 'bg-white text-indigo-950 border border-indigo-100 rounded-tl-none font-medium shadow-3xs'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form input field */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-50 shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeChatTab === 'ai'
                    ? 'Ví dụ: Thiết bị cũ của em khi mua thanh lý sếp tính chiết khấu hao mòn thế nào?...'
                    : 'Nhập nội dung tin nhắn gửi phòng ban chung...'
                }
                className="flex-1 bg-slate-50 text-slate-800 text-xs rounded-xl border border-slate-200/80 py-2.5 px-4 focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center shadow-sm shadow-indigo-600/10 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <Send size={13} />
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
