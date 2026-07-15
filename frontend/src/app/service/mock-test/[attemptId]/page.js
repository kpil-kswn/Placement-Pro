"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ActiveTestPage() {
  const router = useRouter();
  const params = useParams();
  
  const [testData, setTestData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState("Calculating...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("active_mock_test");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.attempt_id === params.attemptId) {
        setTestData(parsed);
      } else {
        router.push("/service/mock-test"); 
      }
    } else {
      router.push("/service/mock-test");
    }
  }, [params.attemptId, router]);

  useEffect(() => {
    if (!testData) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(testData.end_time).getTime();
      const distance = end - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        handleSubmit(); 
      } else {
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testData]);

  const handleSelectOption = (optionStr) => {
    setAnswers({
      ...answers,
      [currentIndex.toString()]: optionStr
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: params.attemptId,
          userAnswers: answers
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      sessionStorage.removeItem("active_mock_test");
      
      router.push(`/service/mock-test/analytics/${params.attemptId}`);

    } catch (err) {
      alert("Submission failed: " + err.message);
      setIsSubmitting(false);
    }
  };

  if (!testData) return <div className="p-10 text-center animate-pulse">Initializing Secure Environment...</div>;

  const currentQuestion = testData.questions[currentIndex];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <span className="font-bold tracking-wide">Time Left</span>
          <span className={`font-mono text-xl font-bold ${timeLeft.startsWith("0") && timeLeft !== "00:00" && parseInt(timeLeft.split(":")[0]) < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
            {timeLeft}
          </span>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Question Map</h3>
          <div className="grid grid-cols-5 gap-2">
            {testData.questions.map((q, idx) => {
              const isAnswered = !!answers[idx.toString()];
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                    isActive ? "ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50 text-indigo-700" :
                    isAnswered ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:bg-red-300"
          >
            {isSubmitting ? "Grading..." : "Submit Test"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT: The Question Viewer */}
      <main className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
          
          <div className="mb-8">
            <span className="text-indigo-600 font-bold tracking-wider text-sm bg-indigo-50 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {testData.questions.length}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-4 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-4 mb-10 flex-1">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = answers[currentIndex.toString()] === opt;
              return (
                <label 
                  key={i} 
                  className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="mock_option"
                    value={opt}
                    checked={isSelected}
                    onChange={() => handleSelectOption(opt)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-4"
                  />
                  <span className={`text-lg ${isSelected ? "text-indigo-900 font-medium" : "text-gray-700"}`}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 shrink-0">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex(prev => Math.min(testData.questions.length - 1, prev + 1))}
              disabled={currentIndex === testData.questions.length - 1}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold disabled:opacity-30 transition-all shadow-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}