"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AptechRoundPage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params.pipelineId;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { question_id: "A", ... }

  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes = 1800 seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const enforceRouteSecurity = async () => {
      try {
        const res = await fetch(`/api/placement/${pipelineId}/status`);
        const data = await res.json();
        const routeMap = {
          ROUND_1_APTECH: `/placement/${pipelineId}/round1-aptech`,
          ROUND_1_INTERMISSION: `/placement/${pipelineId}/intermission?round=2`,
          ROUND_2_CODING: `/placement/${pipelineId}/round2-coding`,
          ROUND_2_INTERMISSION: `/placement/${pipelineId}/intermission?round=3`,
          ROUND_3_INTERVIEW: `/placement/${pipelineId}/round3-interview`,
          COMPLETED: `/placement/${pipelineId}/results`,
        };
        const correctRoute = routeMap[data.global_status];
        const currentPath = window.location.pathname + window.location.search;
        if (correctRoute && !currentPath.includes(correctRoute.split("?")[0])) {
          router.push(correctRoute);
        }
      } catch (error) {
        console.error("Status check failed", error);
      }
    };

    enforceRouteSecurity();
  }, [pipelineId, router]);

  useEffect(() => {
    const storedData = localStorage.getItem(`aptech_${pipelineId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setQuestions(parsed.questions || []);
    } else {
      alert("Test data not found. Please restart the assessment.");
      router.push("/placement");
    }
  }, [pipelineId, router]);

  // Handle Submission
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!isAutoSubmit) {
        const confirmSubmit = confirm(
          "Are you sure you want to submit? You cannot return to this round.",
        );
        if (!confirmSubmit) return;
      }

      setIsSubmitting(true);

      // Format answers for the backend schema
      const formattedAnswers = Object.entries(answers).map(([qId, option]) => ({
        question_id: qId,
        selected_option: option,
      }));

      try {
        const res = await fetch(`/api/placement/${pipelineId}/submit-aptech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: formattedAnswers }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.removeItem(`aptech_${pipelineId}`);

        router.push(data.next_route);
      } catch (error) {
        console.error(error);
        alert(
          "Failed to submit test. Please check your connection and try again.",
        );
        setIsSubmitting(false);
      }
    },
    [answers, pipelineId, router],
  );

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelectOption = (optionKey) => {
    const currentQ = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }));
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Loading Assessment...
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = (index) => !!answers[questions[index].id];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Round 1: Aptitude & Technical
          </h1>
          <p className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div
          className={`text-xl font-mono font-bold px-4 py-2 rounded-lg border ${timeLeft < 300 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-blue-50 text-blue-700 border-blue-200"}`}
        >
          ⏱ {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
              {currentIndex + 1}. {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = answers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      {key}
                    </div>
                    <span
                      className={`text-lg ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}
                    >
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-2 rounded-lg font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1),
                )
              }
              disabled={currentIndex === questions.length - 1}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 border border-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Right: Question Navigator Grid */}
        <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-fit sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
            <span>Navigator</span>
            <span className="text-sm font-normal text-gray-500">
              {Object.keys(answers).length} / {questions.length} Answered
            </span>
          </h3>

          <div className="grid grid-cols-5 gap-2 mb-8">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                  currentIndex === idx
                    ? "ring-2 ring-blue-600 ring-offset-2 bg-blue-100 text-blue-700"
                    : isAnswered(idx)
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>{" "}
              Answered
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>{" "}
              Not Answered
            </div>

            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className={`w-full mt-4 py-3 rounded-lg font-bold text-white transition-all shadow-lg ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 hover:shadow-green-500/30"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
