"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    // 1. Add user message to UI immediately
    const userMessage = { role: "user", text: input };
    const currentHistory = [...messages]; // Capture history BEFORE adding the new message
    setMessages([...currentHistory, userMessage]);
    setInput("");
    setLoading(true);

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("message", userMessage.text);
    formData.append("history", JSON.stringify(currentHistory)); // Send previous context
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.response },
        ]);
        setFile(null); // Clear file after successful send
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `❌ Error: ${data.error}` },
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
    <main className="flex-1 bg-gray-50 flex flex-col py-8 px-4 md:px-8 w-full">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden h-[80vh]">
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Placement Pro Assistant
            </h1>
            <p className="text-sm text-gray-500">
              Ask anything or upload a document for context.
            </p>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-4">👋</span>
              <p>Start a conversation...</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm shadow-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}
              >
                {/* Renders line breaks properly */}
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

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4">
          {/* Show selected file indicator */}
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
            {/* File Upload Button */}
            <label className="flex-shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 w-12 h-12 flex items-center justify-center rounded-xl transition-colors">
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

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message the assistant..."
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !file)}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white w-12 h-12 flex items-center justify-center rounded-xl transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5 translate-x-[-1px] translate-y-[1px]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
