"use client"

import { useState,useEffect,useRef } from "react"
import React from "react"

export default function AIInterviewPage() {
    const [isInterviewActive,setIsInterviewActive] = useState(false)
    const [connectionStatus,setConnectionStatus] = useState("Disconnect")
    const [questionTimeLeft,setQuestionTimeLeft] = useState(1200)
    const [globalTimeLeft,setGlobalTimeLeft] = useState(180)

    const audioPlayerRef = useRef(null)
    const videoRef = useRef(null)
    const webSocketRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    
    useEffect(() => {
      let timeInterval;
      if(isInterviewActive){
        timeInterval = setInterval(()=>{
            setGlobalTimeLeft((prev)=>{
                if(prev<=1){
                    endInterview()
                    return 0
                }
                return prev-1
            })
            setQuestionTimeLeft((prev)=>{
                if(prev<=1){
                    handleNextQuestion()
                    return 180
                }
                return prev-1
            })
        },1000)
      }
      return () => clearInterval(timeInterval)
    }, [isInterviewActive])
    
    const formatTime = (seconds) =>{
        const m = Math.floor(seconds/60).toString().padStart(2,"0")
        const s = (seconds % 60).toString().padStart(2,"0")
        return `${m}:${s}`
    }

    const startInterview = async()=>{
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video:true,
                audio:true,
            })
            if(videoRef.current){
                videoRef.current.srcObject = stream
            }

            webSocketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/interview")
            webSocketRef.current.onopen = () =>{
                setConnectionStatus("Connected & Listening...")
                setIsInterviewActive(true)
            }
            webSocketRef.current.onmessage = async(event) =>{
                const audioBlob = new Blob([event.data],{type:"audio/webm"})
                const audioUrl = URL.createObjectURL(audioBlob)
                if(audioPlayerRef.current){
                    audioPlayerRef.current.src = audioUrl
                    audioPlayerRef.current.play()
                }
            }

            webSocketRef.current.onerror = (error) =>{
                console.error("WebSocket Error:",error)
                setConnectionStatus("Connection Error")
            }
            webSocketRef.current.onclose = () =>{
                setConnectionStatus("Disconnected")
            }
            mediaRecorderRef.current = new MediaRecorder(stream,{
                mimeType:"audio/webm",
            })
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
                webSocketRef.current.send(event.data);
                }
            }
            mediaRecorderRef.current.start(500);
        } catch(err){
            console.error("Error accessing media devices:",err)
            alert("Please allow camera and microphone permissions to begin.")
        }
    } 

    const endInterview = () => {
    setIsInterviewActive(false);
    setConnectionStatus("Interview Completed");

    // Stop recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    // Shut off camera and mic
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    // Close WebSocket connection
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
  };

  const handleNextQuestion = () => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify({ command: "next_question" }));
      setQuestionTimeLeft(180);
    }
  };

    return (
        <div>
            {/* audio element for ai voice */}
            <audio ref={audioPlayerRef} className="hidden"/>
            <div>
                {/* header */}
                <div>
                    <div>
                        <h1>Virtual AI Interview</h1>
                        <p>Status:{connectionStatus}</p>
                    </div>
                    {/* timers */}
                    <div>
                        <div>
                            <p>Question Time</p>
                            <p>{formatTime(questionTimeLeft)}</p>
                        </div>
                        <div>
                            <p>Total Time</p>
                            <p>{formatTime(globalTimeLeft)}</p>
                        </div>
                    </div>
                </div>
                {/* video feed area */}
                <div>
                    <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    />
                    {!isInterviewActive && (
                        <div>
                            <p>Camera off.Click Start to begin.</p>
                        </div>
                    )}
                </div>
                {/* controls */}
                <div>
                    {!isInterviewActive?(
                        <button
                        onClick={startInterview}
                        >
                        Start Interview
                        </button>
                    ):(
                        <>
                        <button
                        onClick={handleNextQuestion}
                        >
                        skip / Next Question
                        </button>
                        <button
                        onClick={endInterview}
                        >
                        End Interview
                        </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}