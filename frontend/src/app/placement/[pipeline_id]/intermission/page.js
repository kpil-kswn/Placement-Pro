"use client"
import { useParams,useSearchParams,useRouter } from "next/navigation";
import { useState } from "react";

export async function Intermission() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const pipelineId = params.pipelineId
    const round = searchParams.get("round") || "1"
    const [loading,setLoading] = useState(false)

    const roundConfig = {
    "1": {
      title: "Round 1: Aptitude & Technical Assessment",
      duration: "30 Minutes",
      questions: "30 Multiple Choice Questions",
      rules: [
        "You have exactly 1 minute per question on average.",
        "There is no negative marking, so attempt all questions.",
        "Do not switch tabs or exit full-screen mode. Doing so may flag your test.",
        "The test will automatically submit when the timer reaches zero."
      ],
      nextPath: `/placement/${pipelineId}/round1-aptech`,
      buttonText: "Start Aptitude & Technical Round"
    },
    "2": {
      title: "Round 2: Data Structures & Algorithms",
      duration: "120 Minutes",
      questions: "3 Coding Problems (Easy, Medium, Hard)",
      rules: [
        "You may write code in Python, JavaScript, C++, or Java.",
        "Your code is auto-saved continuously in the background.",
        "You must pass the hidden test cases to get full marks.",
        "Focus on time and space complexity."
      ],
      nextPath: `/placement/${pipelineId}/round2-coding`,
      buttonText: "Start Coding Round"
    },
    "3": {
      title: "Round 3: AI Voice Interview",
      duration: "20 Minutes",
      questions: "Dynamic Technical Discussion",
      rules: [
        "Ensure your microphone is connected and permissions are granted.",
        "Speak clearly. The AI will evaluate your communication and technical depth.",
        "You will be asked to explain your approaches to previous problems.",
        "Find a quiet room with no background noise."
      ],
      nextPath: `/placement/${pipelineId}/round3-interview`,
      buttonText: "Start Interview Round"
    }
  };

  const currentRound = roundConfig[round]

  if(!currentRound){
    router.push(`/placement/${pipelineId}/results`)
    return null
  }

  const handleStartRound = ()=>{
    setLoading(true)
    router.push(currentRound.nextPath)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Header */}
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-2 block">
            Instructions
          </span>
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentRound.title}
          </h1>
        </div>

        {/* Info Area */}
        <div className="p-8">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-semibold border border-blue-100">
              ⏱️ {currentRound.duration}
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-4 py-2 rounded-lg font-semibold border border-purple-100">
              📝 {currentRound.questions}
            </div>
          </div>

          {/* Rules List */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Ground Rules
            </h3>
            <ul className="space-y-3">
              {currentRound.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleStartRound}
              disabled={loading}
              className={`w-full sm:w-auto px-12 py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-blue-500/30"
              }`}
            >
              {loading ? "Preparing Environment..." : currentRound.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
