"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function PlacementLandingPage() {

    const router = useRouter()
    const [isLoading,setIsLoading] = useState(false)
    const {data:session} = useSession()

    const handleStartPipeline = async() =>{
        const user = session?.user
        if(!user || !user.id){
            alert("You must be logged in to start the placement assessment")
            return
        }
        setIsLoading(true)
        try{
            const actualUser = user.id
            const res = await fetch("/api/placement/start",{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({user_id:actualUser})
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data.error)
            
            localStorage.setItem(`aptech_${data.pipeline_id}`,JSON.stringify(data.aptech_test))

            router.push(`/placement/${data.pipeline_id}/intermission?round=1`)
        } catch(error){
            console.error(error)
            alert("Failed to start the assessment. Please try again.")
            setIsLoading(false);
        }
    }

    return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">        
        {/* Header Section */}
        <div className="bg-blue-900 px-8 py-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Full-Stack Placement Assessment
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            A comprehensive, AI-driven evaluation designed to simulate a real-world enterprise hiring process. Prove your readiness across core fundamentals, algorithmic problem solving, and verbal communication.
          </p>
        </div>

        {/* Info Grid */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What to Expect</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {/* Round 1 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Aptitude & Technical</h3>
              <p className="text-gray-600 text-sm">
                A 30-question multiple-choice examination covering logical reasoning, CS fundamentals, and system design concepts.
              </p>
            </div>

            {/* Round 2 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Data Structures & Algorithams</h3>
              <p className="text-gray-600 text-sm">
                A multi-tab IDE environment. Solve 3 algorithmic challenges (Easy, Medium, Hard) against hidden automated test cases.
              </p>
            </div>

            {/* Round 3 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">AI Voice Interview</h3>
              <p className="text-gray-600 text-sm">
                A live, voice-to-voice technical interview. Discuss your Projects and discuss architectural decisions with our AI hiring manager.
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-10">
            <h4 className="font-bold text-amber-900 mb-2">Important Guidelines</h4>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
              <li>Ensure you have a stable internet connection and a working microphone.</li>
              <li>Do not refresh the page or use the browser back button during the assessment.</li>
              <li>You will receive instructions and have a chance to pause between each round.</li>
              <li>Estimated total completion time: <strong>60-90 minutes</strong>.</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartPipeline}
              disabled={isLoading}
              className={`px-10 py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initializing Environment...
                </span>
              ) : (
                "Initialize Placement Assessment"
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}