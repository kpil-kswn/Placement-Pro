"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const { data: session } = useSession();
  
  const userId = session?.user?.id || "local_dev_user_123";

  const [historyList, setHistoryList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchSidebarHistory = async () => {
      setSidebarLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/chats/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setHistoryList(data.chats || []);
        }
      } catch (err) {
        console.error("Failed to fetch sidebar history", err);
      } finally {
        setSidebarLoading(false);
      }
    };

    fetchSidebarHistory();
  }, [userId, BACKEND_URL]);

  const handleSelectChat = async (chatId) => {
    setLoading(true);
    setCurrentChatId(chatId);
    try {
      const res = await fetch(`${BACKEND_URL}/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        const formattedMessages = data.chat.messages.map((m) => ({
          role: m.role,
          text: m.text,
        }));
        setMessages(formattedMessages);
      } else {
        console.error("Failed to retrieve chat thread records.");
      }
    } catch (err) {
      console.error("Network error trying to read deep chat record log context", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
    setFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("message", userMessage.text);
    formData.append("userId", userId);
    if (currentChatId) {
      formData.append("chatId", currentChatId);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.response },
        ]);
        setFile(null);

        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId);
          
          const listRes = await fetch(`${BACKEND_URL}/api/v1/chats/${userId}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            setHistoryList(listData.chats || []);
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `❌ Error: ${data.detail || "Unknown error occurred"}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "❌ Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen bg-gray-50 text-gray-800">
      
      {/* SIDEBAR: History Panel */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
          <button
            onClick={handleStartNewChat}
            className="w-full py-3 px-4 border border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>➕</span> New Conversation
          </button>
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Recent Conversations
          </div>

          {sidebarLoading ? (
            <div className="p-4 text-center text-sm text-gray-400 animate-pulse">
              Syncing active threads...
            </div>
          ) : historyList.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 italic">
              No historical chat sessions found.
            </div>
          ) : (
            historyList.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectChat(item.id)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all truncate block ${
                  currentChatId === item.id
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                💬 {item.title}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT: Active Thread Frame */}
      <section className="flex-1 flex flex-col max-w-5xl mx-auto px-4 md:px-8 py-8 w-full h-[90vh]">
        <div className="flex flex-col flex-grow bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Placement Pro Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Ask anything or upload a document for context.
              </p>
            </div>
            {/* Mobile New Chat Action Button Trigger */}
            <button
              onClick={handleStartNewChat}
              className="md:hidden py-2 px-3 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              New Chat
            </button>
          </div>

          {/* Interactive Output Dialogue History Canvas */}
          <div className="grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-5xl mb-4">✨</span>
                <p className="font-medium text-gray-600">Start a conversation...</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">
                  Your context will be analyzed and saved automatically to your profile history sequence.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                    msg.role === "user"
                      ? "bg-indigo-600 border-indigo-700 text-white rounded-br-sm shadow-md"
                      : "bg-white border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Processing Console */}
          <div className="bg-white border-t border-gray-100 p-4">
            {file && (
              <div className="mb-3 flex items-center justify-between bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm border border-indigo-100 w-fit">
                <span className="truncate max-w-xs pr-4">📎 {file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-indigo-400 hover:text-indigo-800 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <label className="shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 w-12 h-12 flex items-center justify-center rounded-xl transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message the assistant..."
                className="grow bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !file)}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white w-12 h-12 flex items-center justify-center rounded-xl transition-colors shadow-sm"
              >
                <svg
                  className="w-5 h-5 -translate-x-px translate-y-px"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}