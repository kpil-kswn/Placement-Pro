"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; 

export default function VoiceInterviewRound() {
  const router = useRouter();
  const params = useParams();
  
  // Bulletproof ID fetching: Works whether your folder is [pipeline_id] or [pipelineId]
  const pipelineId = params.pipelineId || params.pipeline_id;
  
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [messages, setMessages] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtitle, setSubtitle] = useState(""); 

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🛡️ SMARTER ROUTE GUARD (Perfectly sealed in useEffect)
  useEffect(() => {
    const enforceRouteSecurity = async () => {
      if (!pipelineId) return; // Prevent fetching if ID is missing
      
      try {
        const res = await fetch(`/api/placement/${pipelineId}/status`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        const status = data.global_status;
        const path = window.location.pathname;
        const query = window.location.search;

        let redirectUrl = null;

        if (status === "ROUND_1_APTECH" || status === "STARTED") {
           if (!path.includes("round1") && query !== "?round=1") {
               redirectUrl = `/placement/${pipelineId}/intermission?round=1`;
           }
        } else if (status === "ROUND_2_CODING" || status === "ROUND_1_INTERMISSION") {
           if (!path.includes("round2") && query !== "?round=2") {
               redirectUrl = `/placement/${pipelineId}/intermission?round=2`;
           }
        } else if (status === "ROUND_3_INTERVIEW" || status === "ROUND_2_INTERMISSION") {
           if (!path.includes("round3") && query !== "?round=3") {
               redirectUrl = `/placement/${pipelineId}/intermission?round=3`;
           }
        } else if (status === "COMPLETED") {
           if (!path.includes("results")) {
               redirectUrl = `/placement/${pipelineId}/results`;
           }
        }

        if (redirectUrl) {
           router.push(redirectUrl);
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    };
    enforceRouteSecurity();
  }, [pipelineId, router]);

  // Timer Logic
  useEffect(() => {
    if (!isInterviewStarted || timeLeft <= 0) {
      if (timeLeft <= 0 && isInterviewStarted && !isSubmitting) {
          handleFinishInterview();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isInterviewStarted, isSubmitting]);

  const playAudio = (base64Audio) => {
    if (!base64Audio || !audioRef.current) return;
    audioRef.current.src = `data:audio/wav;base64,${base64Audio}`;
    setIsAiSpeaking(true);
    audioRef.current.play().catch(e => setIsAiSpeaking(false));
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
    });
  };

  const startInterview = async () => {
    setIsInterviewStarted(true);
    setIsLoading(true);
    setSubtitle("Connecting to AI Interviewer...");
    try {
      const response = await fetch("/api/placement/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], user_id: userId }),
      });
      const data = await response.json();
      setMessages([{ role: "model", text: data.reply, display: data.reply }]);
      setSubtitle(data.reply);
      if (data.audio) playAudio(data.audio);
    } catch (error) {
      console.error(error);
      setSubtitle("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        const base64Audio = await blobToBase64(audioBlob);
        await sendAudioToBackend(base64Audio);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setSubtitle("Listening... (Click stop when finished)");
    } catch (err) {
      alert("Microphone permission required.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (base64Audio) => {
    setIsLoading(true);
    setSubtitle("Evaluating your response...");
    const tempMessages = [...messages, { role: "user", text: "", audio_b64: base64Audio }];

    try {
      const response = await fetch("/api/placement/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: tempMessages, user_id: userId }),
      });
      const data = await response.json();

      setMessages([
        ...messages,
        { role: "user", text: data.transcript, display: data.transcript },
        {
          role: "model",
          text: data.full_text,
          display: data.reply,
          evaluation: data.evaluation,
        },
      ]);
      setSubtitle(data.reply);
      if (data.audio) playAudio(data.audio);
    } catch (error) {
      console.error(error);
      setSubtitle("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!confirm("Are you sure you want to end the interview?")) return;
    setIsSubmitting(true);
    
    const chatLog = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user' && messages[i-1]?.role === 'model') {
        chatLog.push({
          turn_id: chatLog.length + 1,
          ai_question: messages[i-1].display,
          user_answer: messages[i].display,
          ai_feedback: messages[i+1]?.evaluation || "No feedback generated."
        });
      }
    }

    try {
      const res = await fetch(`/api/placement/${pipelineId}/finish-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_log: chatLog })
      });
      const data = await res.json();
      router.push(data.next_route);
    } catch (e) {
      console.error(e);
      alert("Failed to save interview. Retrying...");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  let orbState = "idle";
  if (isLoading) orbState = "loading";
  else if (isAiSpeaking) orbState = "speaking";
  else if (isRecording) orbState = "recording";

  return (
    <div className="flex flex-col h-screen bg-[#0B0F19] text-white overflow-hidden font-sans">
      <audio ref={audioRef} className="hidden" onEnded={() => setIsAiSpeaking(false)} />

      <header className="px-8 py-6 flex justify-between items-center shrink-0 z-10">
        <div>
          <h1 className="font-bold text-xl tracking-wide text-gray-100">AI Hiring Manager</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Voice Session</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-mono text-lg px-4 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {formatTime(timeLeft)}
          </div>
          {isInterviewStarted && (
            <button 
              onClick={handleFinishInterview}
              disabled={isSubmitting || isRecording}
              className="text-gray-400 hover:text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "End Session"}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        {!isInterviewStarted ? (
          <div className="flex flex-col items-center animate-fade-in-up">
             <div className="w-32 h-32 rounded-full bg-blue-600/20 flex items-center justify-center mb-8 border border-blue-500/30">
               <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
             </div>
             <h2 className="text-3xl font-light mb-4 text-white">Ready to begin?</h2>
             <p className="text-gray-400 mb-10 text-center max-w-md">Find a quiet place. We will test your system design knowledge and problem-solving skills.</p>
             <button
                onClick={startInterview}
                disabled={isLoading}
                className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] text-lg"
              >
                {isLoading ? "Connecting..." : "Start Interview"}
              </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-3xl">
            <div className="relative flex items-center justify-center w-64 h-64 mb-16">
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
                orbState === 'speaking' ? 'bg-cyan-500/20 animate-ping scale-150 blur-xl' :
                orbState === 'recording' ? 'bg-red-500/20 animate-ping scale-125 blur-xl' :
                orbState === 'loading' ? 'border-4 border-dashed border-blue-500/30 animate-[spin_3s_linear_infinite] scale-125' :
                'bg-blue-500/5 scale-100 blur-md'
              }`}></div>
              
              <div className={`absolute inset-4 rounded-full transition-all duration-500 ease-in-out blur-md ${
                orbState === 'speaking' ? 'bg-cyan-400/40 animate-pulse' :
                orbState === 'recording' ? 'bg-red-500/30 animate-pulse' :
                orbState === 'loading' ? 'bg-indigo-500/30 animate-pulse' :
                'bg-blue-900/40'
              }`}></div>
              
              <div className={`relative z-10 w-32 h-32 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden ${
                orbState === 'speaking' ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 scale-110 shadow-[0_0_60px_rgba(34,211,238,0.6)]' :
                orbState === 'recording' ? 'bg-gradient-to-tr from-red-500 to-orange-500 scale-105 shadow-[0_0_50px_rgba(239,68,68,0.5)]' :
                orbState === 'loading' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(99,102,241,0.5)]' :
                'bg-gradient-to-tr from-slate-700 to-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
              }`}>
                {orbState === 'recording' ? (
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                ) : orbState === 'speaking' ? (
                  <div className="flex gap-1 items-center justify-center">
                    <div className="w-1 h-6 bg-white/80 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                    <div className="w-1 h-10 bg-white/80 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-1 h-6 bg-white/80 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white/50 animate-spin"></div>
                )}
              </div>
            </div>

            <div className="h-24 w-full flex items-center justify-center text-center px-4">
              <p className={`text-lg transition-opacity duration-300 font-light ${orbState === 'recording' ? 'text-gray-300 italic' : 'text-white'}`}>
                "{subtitle || "..."}"
              </p>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button
                onClick={toggleRecording}
                disabled={isLoading || isAiSpeaking}
                className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 outline-none
                  ${(isLoading || isAiSpeaking) ? 'opacity-50 cursor-not-allowed bg-slate-800' : 
                    isRecording 
                      ? 'bg-white text-black hover:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                      : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 border border-white/20 hover:border-white/40 backdrop-blur-sm'
                  }`}
              >
                {isRecording ? (
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-4 font-semibold">
                {(isLoading || isAiSpeaking) ? "Please Wait" : isRecording ? "Tap to send" : "Tap to speak"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}