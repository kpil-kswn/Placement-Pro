"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolve } from "styled-jsx/css";

export default function AIInterviewPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const playAudio = (base64Audio) => {
    if (!base64Audio || !audioRef.current) return;
    audioRef.current.src = `data:audio/wav;base64,${base64Audio}`;
    setIsAiSpeaking(true);
    audioRef.current.play().catch((e) => {
      console.error("Browser blocked audio playback:", e);
      setIsAiSpeaking(false);
    });
  };
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.onerror = reject;
    });
  };

  const startInterview = async () => {
    setIsInterviewStarted(true);
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status:${response.status}`);

      const data = await response.json();
      setMessages([{ role: "model", text: data.reply }]);

      if (data.audio) {
        playAudio(data.audio);
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      setMessages([
        { role: "model", text: "Network Error", display: "Network Error" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());

        const base64Audio = await blobToBase64(audioBlob);
        await sendAudioToBackend(base64Audio);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Please allow microphone permissions.");
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (base64Audio) => {
    setIsLoading(true);

    const tempMessages = [
      ...messages,
      { role: "user", text: "", audio_b64: base64Audio },
    ];

    try {
      const response = await fetch("http://127.0.0.1:8000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: tempMessages }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      setMessages([
        ...messages,
        { role: "user", text: data.transcript, display: data.transcript },
        {
          role: "model",
          text: data.full_text, // Saved in history for context
          display: data.reply, // What the AI said
          evaluation: data.evaluation, // Phase 4 Score
        },
      ]);

      if (data.audio) playAudio(data.audio);
    } catch (error) {
      console.error("Failed to fetch response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setIsAiSpeaking(false)}
      />

      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Phase 3 & 4: Voice & Scoring Engine
            </h1>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              Mic Recording + Answer Evaluation
              {isAiSpeaking && (
                <span className="text-blue-400 font-bold animate-pulse inline-flex items-center gap-1">
                  🔊 AI Speaking...
                </span>
              )}
            </p>
          </div>
          {!isInterviewStarted && (
            <button
              onClick={startInterview}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Start Interview"}
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-800/50">
          {!isInterviewStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <span className="text-6xl">🎙️</span>
              <p>Click "Start Interview" to begin the voice simulation.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.evaluation && (
                    <div className="mb-2 max-w-[75%] p-3 rounded-lg bg-indigo-900/50 border border-indigo-700 text-indigo-200 text-sm">
                      <span className="font-bold text-indigo-400">
                        📊 Feedback:{" "}
                      </span>
                      {msg.evaluation}
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] p-4 rounded-xl ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1 opacity-70">
                      {msg.role === "user"
                        ? "You (Transcribed)"
                        : "AI Interviewer"}
                    </p>
                    <p className="leading-relaxed">{msg.display}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-4 rounded-xl bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none">
                    <p className="animate-pulse">
                      {isRecording
                        ? "Listening..."
                        : "Transcribing & Grading..."}
                    </p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area (Microphone Controls) */}
        <div className="p-6 bg-gray-900 border-t border-gray-700 flex justify-center items-center">
          {!isRecording ? (
            <button
              onMouseDown={handleStartRecording}
              onMouseUp={handleStopRecording}
              onTouchStart={handleStartRecording}
              onTouchEnd={handleStopRecording}
              disabled={!isInterviewStarted || isLoading || isAiSpeaking}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all duration-300
                 ${
                   !isInterviewStarted || isLoading || isAiSpeaking
                     ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                     : "bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 text-white"
                 }`}
            >
              🎙️
            </button>
          ) : (
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-red-500/30 rounded-full animate-ping"></div>
              <button
                onMouseUp={handleStopRecording}
                onTouchEnd={handleStopRecording}
                className="relative z-10 w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-4xl text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]"
              >
                🛑
              </button>
            </div>
          )}

          <div className="absolute right-8 bottom-12 text-sm text-gray-400 hidden sm:block">
            {isRecording ? "Release to Send" : "Hold to Speak"}
          </div>
        </div>
      </div>
    </div>
  );
}
