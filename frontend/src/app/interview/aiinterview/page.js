// "use client";

// import React, { useState, useEffect, useRef } from "react";

// export default function AIInterviewPage() {
//   const [isInterviewActive, setIsInterviewActive] = useState(false);
//   const [isAiSpeaking, setIsAiSpeaking] = useState(false);
//   const [globalTimeLeft, setGlobalTimeLeft] = useState(1200);
//   const [questionTimeLeft, setQuestionTimeLeft] = useState(180);
  
//   // Notice this will now display exact errors if the backend crashes
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");

//   const webSocketRef = useRef(null);
//   const mediaStreamRef = useRef(null);
//   const audioWorkletNodeRef = useRef(null);
//   const micAudioCtxRef = useRef(null);
//   const isMicMutedRef = useRef(true); 

//   const speakerAudioCtxRef = useRef(null);
//   const messageQueueRef = useRef([]);
//   const activeSourcesRef = useRef([]);
//   const queueProcessingRef = useRef(false);
//   const nextStartTimeRef = useRef(0);

//   useEffect(() => {
//     let timerInterval;
//     if (isInterviewActive) {
//       timerInterval = setInterval(() => {
//         setGlobalTimeLeft((prev) => {
//           if (prev <= 1) {
//             endInterview();
//             return 0;
//           }
//           return prev - 1;
//         });

//         setQuestionTimeLeft((prev) => {
//           if (prev <= 1) {
//             handleFinishedSpeaking();
//             return 180;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timerInterval);
//   }, [isInterviewActive]);

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60).toString().padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const arrayBufferToBase64 = (buffer) => {
//     let binary = "";
//     const bytes = new Uint8Array(buffer);
//     for (let i = 0; i < bytes.byteLength; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   };

//   const playAudioData = async () => {
//     queueProcessingRef.current = true;
//     setIsAiSpeaking(true);

//     if (!speakerAudioCtxRef.current || speakerAudioCtxRef.current.state === "closed") {
//       speakerAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
//       nextStartTimeRef.current = speakerAudioCtxRef.current.currentTime;
//     }

//     while (messageQueueRef.current.length > 0) {
//       const audioChunks = messageQueueRef.current.shift();
//       const audioBuffer = speakerAudioCtxRef.current.createBuffer(1, audioChunks.length, 24000);
//       audioBuffer.copyToChannel(audioChunks, 0);

//       const source = speakerAudioCtxRef.current.createBufferSource();
//       source.buffer = audioBuffer;
//       source.connect(speakerAudioCtxRef.current.destination);
//       activeSourcesRef.current.push(source);

//       source.onended = () => {
//         const index = activeSourcesRef.current.indexOf(source);
//         if (index > -1) activeSourcesRef.current.splice(index, 1);
        
//         if (messageQueueRef.current.length === 0 && activeSourcesRef.current.length === 0) {
//           setIsAiSpeaking(false);
//           isMicMutedRef.current = false; 
//         }
//       };

//       if (nextStartTimeRef.current < speakerAudioCtxRef.current.currentTime) {
//         nextStartTimeRef.current = speakerAudioCtxRef.current.currentTime;
//       }
//       source.start(nextStartTimeRef.current);
//       nextStartTimeRef.current += audioBuffer.duration;
//     }
//     queueProcessingRef.current = false;
//   };

//   const startInterview = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaStreamRef.current = stream;

//       webSocketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/interview");

//       webSocketRef.current.onopen = async () => {
//         setConnectionStatus("Connected & Listening...");
//         setIsInterviewActive(true);
//         setIsAiSpeaking(true); 
//         isMicMutedRef.current = true; 

//         micAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
//         const source = micAudioCtxRef.current.createMediaStreamSource(stream);

//         const AudioRecordingWorklet = `
//           class AudioProcessingWorklet extends AudioWorkletProcessor {
//             buffer = new Int16Array(512);
//             bufferWriteIndex = 0;
//             process(inputs) {
//               if (inputs[0].length) {
//                 const channel0 = inputs[0][0];
//                 for (let i = 0; i < channel0.length; i++) {
//                   const int16Value = channel0[i] * 32768;
//                   this.buffer[this.bufferWriteIndex++] = int16Value;
//                   if(this.bufferWriteIndex >= this.buffer.length) {
//                     this.port.postMessage({
//                       event: "chunk",
//                       data: { int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer }
//                     });
//                     this.bufferWriteIndex = 0;
//                   }
//                 }
//               }
//               return true;
//             }
//           }
//           registerProcessor("audio-recorder-worklet", AudioProcessingWorklet);
//         `;

//         const scriptBlob = new Blob([AudioRecordingWorklet], { type: "application/javascript" });
//         const workletUrl = URL.createObjectURL(scriptBlob);

//         await micAudioCtxRef.current.audioWorklet.addModule(workletUrl);
//         audioWorkletNodeRef.current = new AudioWorkletNode(micAudioCtxRef.current, "audio-recorder-worklet");

//         audioWorkletNodeRef.current.port.onmessage = (ev) => {
//           if (isMicMutedRef.current) return; 

//           const arrayBuffer = ev.data.data.int16arrayBuffer;
//           if (arrayBuffer && webSocketRef.current?.readyState === WebSocket.OPEN) {
//             webSocketRef.current.send(JSON.stringify({
//               type: "realtimeInput",
//               audioData: arrayBufferToBase64(arrayBuffer)
//             }));
//           }
//         };

//         source.connect(audioWorkletNodeRef.current);
//       };

//       webSocketRef.current.onmessage = (event) => {
//         try {
//           const message = JSON.parse(event.data);
          
//           // --- FIX 3: Push backend errors directly to your screen ---
//           if (message.type === "error") {
//             setConnectionStatus(`Error: ${message.message}`);
//             console.error("Backend Error:", message.message);
//             return;
//           }

//           if (message.type === "audioStream") {
//             const binaryString = window.atob(message.data);
//             const length = binaryString.length / 2;
//             const float32AudioData = new Float32Array(length);
            
//             for (let i = 0; i < length; i++) {
//               let sample = binaryString.charCodeAt(i * 2) | (binaryString.charCodeAt(i * 2 + 1) << 8);
//               if (sample >= 32768) sample -= 65536;
//               float32AudioData[i] = sample / 32768;
//             }
            
//             messageQueueRef.current.push(float32AudioData);
//             if (!queueProcessingRef.current) {
//               playAudioData();
//             }
//           }
          
//           if (message.type === "turnComplete") {
//              setTimeout(() => {
//                 if (messageQueueRef.current.length === 0 && activeSourcesRef.current.length === 0) {
//                     setIsAiSpeaking(false);
//                     isMicMutedRef.current = false;
//                 }
//              }, 500); 
//           }

//         } catch (e) {
//           console.error("Error parsing WebSocket message:", e);
//         }
//       };

//       webSocketRef.current.onerror = () => setConnectionStatus("Connection Error (Is Python running?)");
//       webSocketRef.current.onclose = () => {
//          // Don't overwrite an error message if one just occurred
//          setConnectionStatus((prev) => prev.includes("Error") ? prev : "Disconnected");
//       };

//     } catch (err) {
//       console.error("Error accessing media devices:", err);
//       alert("Please allow microphone permissions to begin.");
//     }
//   };

//   const endInterview = () => {
//     setIsInterviewActive(false);
//     setIsAiSpeaking(false);
//     isMicMutedRef.current = true;
//     setConnectionStatus("Interview Completed");

//     if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
//     if (audioWorkletNodeRef.current) audioWorkletNodeRef.current.disconnect();
//     if (micAudioCtxRef.current && micAudioCtxRef.current.state !== "closed") micAudioCtxRef.current.close();
//     if (speakerAudioCtxRef.current && speakerAudioCtxRef.current.state !== "closed") speakerAudioCtxRef.current.close();
//     if (webSocketRef.current) webSocketRef.current.close();

//     messageQueueRef.current = [];
//     activeSourcesRef.current = [];
//   };

//   const handleFinishedSpeaking = () => {
//     setQuestionTimeLeft(180);
//     setIsAiSpeaking(true); 
//     isMicMutedRef.current = true; 

//     if (webSocketRef.current?.readyState === WebSocket.OPEN) {
//       webSocketRef.current.send(JSON.stringify({
//         type: "contentUpdateText",
//         text: "I am done with my answer. Please evaluate what I just said and ask the next technical question. You must reply verbally."
//       }));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
//       <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        
//         <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
//           <div>
//             <h1 className="text-2xl font-bold">Virtual AI Interview</h1>
//             <p className={`text-sm mt-1 ${connectionStatus.includes("Error") ? "text-red-400 font-bold" : connectionStatus.includes("Connected") ? "text-green-400" : "text-yellow-400"}`}>
//               Status: {connectionStatus}
//             </p>
//           </div>

//           <div className="flex gap-6 text-right">
//             <div>
//               <p className="text-xs text-gray-400 uppercase tracking-wider">Question Time</p>
//               <p className={`text-2xl font-mono ${questionTimeLeft < 30 ? "text-red-400" : "text-white"}`}>
//                 {formatTime(questionTimeLeft)}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-400 uppercase tracking-wider">Total Time</p>
//               <p className="text-2xl font-mono text-blue-400">{formatTime(globalTimeLeft)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col items-center justify-center py-16 mb-8 bg-gray-900/50 rounded-lg border border-gray-700">
//           <div
//             className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out
//               ${isAiSpeaking
//                 ? "bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.8)] scale-110 animate-pulse"
//                 : isInterviewActive
//                   ? "bg-gray-600 shadow-[0_0_15px_rgba(156,163,175,0.4)]"
//                   : "bg-gray-800 border-2 border-gray-600"
//               }`}
//           >
//             <span className="text-5xl">{isAiSpeaking ? "🔊" : "🎙️"}</span>
//           </div>

//           <p className="mt-8 text-lg font-medium text-gray-300">
//             {!isInterviewActive
//               ? "Microphone off. Click Start to begin."
//               : isAiSpeaking
//                 ? "AI is speaking..."
//                 : "AI is listening... (Speak now)"}
//           </p>
//         </div>

//         <div className="flex justify-center gap-4">
//           {!isInterviewActive ? (
//             <button
//               onClick={startInterview}
//               className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg"
//             >
//               Start Interview
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleFinishedSpeaking}
//                 disabled={isAiSpeaking}
//                 className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-lg
//                   ${isAiSpeaking
//                     ? "bg-gray-600 cursor-not-allowed opacity-50"
//                     : "bg-yellow-600 hover:bg-yellow-500"
//                   }`}
//               >
//                 Done Speaking / Reply
//               </button>
//               <button
//                 onClick={endInterview}
//                 className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all shadow-lg"
//               >
//                 End Interview
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AIInterviewPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = () => {
    setIsInterviewStarted(true);
    // Hardcode the initial greeting so the user has something to reply to
    setMessages([
      {
        role: "model",
        text: "Hello! Welcome to your virtual technical interview. Let's start with a brief introduction. Tell me about a challenging project you've worked on recently."
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // 1. Add user's new message to the local state
    const newMessages = [...messages, { role: "user", text: inputValue }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 3. Append the AI's reply to the chat
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      
    } catch (error) {
      console.error("Failed to fetch response:", error);
      setMessages((prev) => [
        ...prev, 
        { role: "model", text: "⚠️ Network Error: Could not reach the Python backend. Is it running?" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Phase 1: Text Interview Engine</h1>
            <p className="text-sm text-gray-400 mt-1">Testing AI Persona & Logic</p>
          </div>
          {!isInterviewStarted && (
            <button
              onClick={startInterview}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg"
            >
              Start Interview
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-800/50">
          {!isInterviewStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <span className="text-6xl">💬</span>
              <p>Click "Start Interview" to begin the simulation.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[75%] p-4 rounded-xl ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1 opacity-70">
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </p>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] p-4 rounded-xl bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none">
                     <p className="animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>
        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isInterviewStarted || isLoading}
              placeholder={isInterviewStarted ? "Type your answer..." : "Start the interview first..."}
              className="flex-1 bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isInterviewStarted || isLoading || !inputValue.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}