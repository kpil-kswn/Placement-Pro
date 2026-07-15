"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/mock-test/results/${params.attemptId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to load results");
        
        setData(json.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [params.attemptId]);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500 animate-pulse">Generating your performance report...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">Error: {error}</div>;

  const { score, raw_score, questions, user_answers } = data;
  const isPassed = score >= 70; // 70% passing grade

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER: Score Overview */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Assessment Complete</h1>
            <div className={`text-7xl font-black mb-2 ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
              {Math.round(score)}%
            </div>
            <p className="text-gray-600 font-medium text-lg">
              You answered <span className="font-bold text-gray-900">{raw_score}</span> questions correctly.
            </p>
            
            <button 
              onClick={() => router.push('/service/mock-test')}
              className="mt-8 px-8 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
          
          {/* Decorative background glow */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        </div>

        {/* DETAILS: Question Review */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 px-2">Detailed Review</h2>
          
          {questions.map((q, idx) => {
            const userAnswer = user_answers[idx.toString()];
            const isCorrect = userAnswer === q.correct_answer;
            const isUnanswered = !userAnswer;

            return (
              <div key={idx} className={`bg-white rounded-2xl p-6 border-2 shadow-sm ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
                
                {/* Status Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 
                    isUnanswered ? 'bg-gray-100 text-gray-600' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isCorrect ? '✓ Correct' : isUnanswered ? '∅ Skipped' : '✕ Incorrect'}
                  </span>
                  <span className="text-gray-400 font-semibold text-sm">Question {idx + 1}</span>
                </div>

                {/* The Question */}
                <h3 className="text-lg font-bold text-gray-900 mb-5">{q.question_text}</h3>

                {/* The Options Breakdown */}
                <div className="space-y-3 mb-6">
                  {q.options.map((opt, i) => {
                    const isThisUsersAnswer = userAnswer === opt;
                    const isThisCorrectAnswer = q.correct_answer === opt;
                    
                    let bgStyle = "bg-gray-50 border-gray-200 text-gray-600"; // Default
                    if (isThisCorrectAnswer) {
                      bgStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-sm"; // The right answer
                    } else if (isThisUsersAnswer && !isCorrect) {
                      bgStyle = "bg-rose-50 border-rose-300 text-rose-900 line-through decoration-rose-300 opacity-80"; // What they got wrong
                    }

                    return (
                      <div key={i} className={`p-4 rounded-xl border ${bgStyle} flex justify-between items-center transition-all`}>
                        <span>{opt}</span>
                        {isThisUsersAnswer && <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* The AI Explanation */}
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                  <h4 className="text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>💡</span> Why is this the answer?
                  </h4>
                  <p className="text-indigo-900/80 text-sm leading-relaxed">
                    {q.explanation}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}