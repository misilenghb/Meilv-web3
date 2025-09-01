"use client";

import { useState } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatButtonProps {
  guideId: string;
  guideName: string;
  guideAvatar?: string;
}

export default function ChatButton({ guideId, guideName, guideAvatar }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "guide",
      content: `您好！我是${guideName}，很高兴为您服务。有什么可以帮助您的吗？`,
      timestamp: new Date()
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // 模拟地陪回复
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        sender: "guide",
        content: "收到您的消息，我会尽快回复您！",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="p-3 bg-white border border-pink-200 rounded-xl hover:bg-pink-50 transition-colors"
        title="在线咨询"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4 md:items-center">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md h-[80vh] md:h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                  {guideAvatar ? (
                    <img src={guideAvatar} alt={guideName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    guideName.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{guideName}</h3>
                  <p className="text-sm text-green-600">在线</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Quick Replies */}
              <div className="flex flex-wrap gap-2 mt-3">
                {["咨询价格", "预约时间", "服务内容", "联系方式"].map((quickReply) => (
                  <button
                    key={quickReply}
                    onClick={() => setMessage(quickReply)}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm hover:bg-pink-200 transition-colors"
                  >
                    {quickReply}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
