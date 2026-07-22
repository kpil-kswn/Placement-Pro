"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VoiceInterviewRound() {
  const router = useRouter();
  const { pipelineId } = useParams();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(1200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtitle, setSubtitle] = useState("");

  const audiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunkRef = useRef([]);

  useEffect(()=>{
    if(!isInterviewStarted || timeLeft<=0){
        if(timeLeft<=0 && isInterviewStarted)
    }
  })

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  let orbState = "idle";
  if (isLoading) orbState = "loading";
  else if (isAiSpeaking) orbState = "speaking";
  else if (isRecording) orbState = "recording";

  return (
    <div>
      <audio ref={audiRef} onEnded={setIsAiSpeaking(false)}/>
      <header>
        <div>
            <h1>AI Hiring Manager</h1>
            <p>Voice Session</p>
        </div>
        <div>
            <div>
                {formatTime(timeLeft)}
            </div>
            {isInterviewStarted && (
                <button
                    onClick={handleFinishInterview}
                    disabled = {isSubmitting || isRecording}
                >
                    {isSubmitting?"Saving...":"End Session"}
                </button>
            )}
        </div>
      </header>

      <div>
        {!isInterviewStarted?(
            <div>
                <div>
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
                </div>
                <h2>Ready to begin?</h2>
                <p>Find a quiet place.This interview will be of around 20 minutes to test you knowlege and skills.</p>
                <button
                    onClick={startInterview}
                    disabled = {isLoading}
                >
                    {isLoading?"connecting...":"Start Interview"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
