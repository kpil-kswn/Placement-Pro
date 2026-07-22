"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

export default function CodingRoundPage() {
  const router = useRouter();
  const { pipelineId } = useParams();

  const [problems, setProblems] = useState([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  
  const [userCodes, setUserCodes] = useState({}); // { prob_1: "def...", prob_2: "..." }
  const [evalResults, setEvalResults] = useState({}); // { prob_1: { status: "Passed", ... } }
  
  const [loading, setLoading] = useState(true);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(7200); // 120 minutes
  
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [activeTab, setActiveTab] = useState("description"); // "description" or "results"

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`/api/placement/${pipelineId}`);
        const data = await res.json();
        
        const fetchedProblems = data.coding_round?.problems || [];
        setProblems(fetchedProblems);
        
        const initialCodes = {};
        fetchedProblems.forEach(p => {
          initialCodes[p.problem_id] = p.user_code || p.problem_data?.starter_code || "";
        });
        setUserCodes(initialCodes);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [pipelineId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitAll(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const saveDraft = useCallback(async (probId, code) => {
    try {
      await fetch(`/api/placement/${pipelineId}/save-draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: probId, user_code: code }),
      });
    } catch (e) {
      console.error("Draft save failed", e);
    }
  }, [pipelineId]);

  useEffect(() => {
    if (!problems.length) return;
    const activeProbId = problems[activeProblemIdx].problem_id;
    const code = userCodes[activeProbId];
    
    const timeoutId = setTimeout(() => {
      saveDraft(activeProbId, code);
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [userCodes, activeProblemIdx, problems, saveDraft]);

  const handleCodeChange = (value) => {
    const activeProbId = problems[activeProblemIdx].problem_id;
    setUserCodes(prev => ({ ...prev, [activeProbId]: value }));
  };

  // Run Individual Problem (Public Cases Only)
  const handleRunPublicCases = async () => {
    const activeProb = problems[activeProblemIdx];
    const code = userCodes[activeProb.problem_id];
    const publicCases = activeProb.problem_data?.public_test_cases || [];
    
    setIsExecuting(true);
    setActiveTab("results"); // Switch to results tab automatically
    
    try {
      const res = await fetch("/api/placement/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          test_case: publicCases,
          is_submit: false // Just running tests, no AI critique needed
        }),
      });

      const data = await res.json();
      setEvalResults(prev => ({
        ...prev,
        [activeProb.problem_id]: data
      }));
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitAll = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      if (!confirm("Are you sure you want to submit ALL problems? You cannot return to this round.")) return;
    }
    
    setIsSubmittingAll(true);
    try {
      const res = await fetch(`/api/placement/${pipelineId}/submit-coding`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(data.next_route);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Submission failed. Retrying...");
      setIsSubmittingAll(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h > 0 ? h + ':' : ''}${m}:${s}`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Loading Coding Environment...</div>;
  if (!problems.length) return <div className="flex h-screen items-center justify-center text-red-500">No problems found.</div>;

  const activeProblem = problems[activeProblemIdx];
  const activeCode = userCodes[activeProblem.problem_id] || "";
  const activeResult = evalResults[activeProblem.problem_id];

  return (
    <div className="flex h-screen w-full bg-gray-50 flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shrink-0 shadow-md z-10">
        <h1 className="font-bold text-lg tracking-wide">Round 2: Data Structures & Algorithms</h1>
        <div className="flex items-center gap-6">
          <div className={`font-mono text-lg font-bold px-4 py-1 rounded bg-slate-800 border ${timeLeft < 300 ? 'text-red-400 border-red-500 animate-pulse' : 'text-green-400 border-green-500'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => handleSubmitAll(false)}
            disabled={isSubmittingAll}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition-all shadow-lg text-sm"
          >
            {isSubmittingAll ? "Submitting..." : "Submit All Problems"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: Problem List */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Challenges</div>
          <div className="flex-1 overflow-y-auto">
            {problems.map((prob, idx) => {
              const status = evalResults[prob.problem_id]?.status;
              return (
                <button
                  key={prob.problem_id}
                  onClick={() => setActiveProblemIdx(idx)}
                  className={`w-full text-left p-4 border-b flex flex-col gap-1 transition-all ${activeProblemIdx === idx ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${activeProblemIdx === idx ? 'text-blue-800' : 'text-gray-700'}`}>
                      Problem {idx + 1}
                    </span>
                    {/* Tiny status indicator */}
                    {status === "Passed" && <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm" title="Passed Public Tests"></span>}
                    {status === "Failed" && <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" title="Failed Public Tests"></span>}
                    {status === "Error" && <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" title="Syntax Error"></span>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded w-fit ${
                    prob.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                    prob.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {prob.difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE: Description & Results Area */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white min-w-[350px]">
          {/* Middle Panel Tabs */}
          <div className="flex border-b bg-gray-50 shrink-0">
            <button 
              onClick={() => setActiveTab("description")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab("results")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Test Results
              {activeResult && (
                <span className={`w-2 h-2 rounded-full ${activeResult.status === 'Passed' ? 'bg-green-500' : activeResult.status === 'Error' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
              )}
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {/* TAB CONTENT: Description */}
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-gray-800">
                <h2 className="text-xl font-bold mb-4">{activeProblem.problem_data?.title || `Problem ${activeProblemIdx + 1}`}</h2>
                <ReactMarkdown>{activeProblem.problem_data?.problem_statement || "Description loading..."}</ReactMarkdown>
              </div>
            )}

            {/* TAB CONTENT: Results */}
            {activeTab === "results" && (
              <div>
                {isExecuting ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-pulse">
                    <span className="text-4xl mb-4">⚙️</span>
                    <p className="font-semibold">Executing Code...</p>
                  </div>
                ) : activeResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg flex items-center justify-between border ${
                      activeResult.status === "Passed" ? "bg-green-50 border-green-200 text-green-800" : 
                      activeResult.status === "Error" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                      "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      <h2 className="text-lg font-bold">
                        {activeResult.status === "Passed" ? "Accepted (Public Cases)" : activeResult.status === "Error" ? "Syntax/Runtime Error" : "Failed (Public Cases)"}
                      </h2>
                      <span className="font-mono text-sm font-semibold bg-white/50 px-3 py-1 rounded">
                        Passed {activeResult.passed_cases} / {activeResult.total_cases}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Console Output:</h3>
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-x-auto shadow-inner">
                        {activeResult.console_output || "No output generated."}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <span className="text-3xl mb-2">💻</span>
                    <p>Run your code to see test results here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-[400px]">
          <div className="flex justify-between items-center p-2 bg-slate-900 border-b border-gray-700 shrink-0">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-800 text-white border border-gray-600 rounded px-3 py-1 text-sm outline-none font-semibold">
              <option value="python">Python</option>
              {/* Add other languages here if backend supports them */}
            </select>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme={theme}
              value={activeCode}
              onChange={handleCodeChange}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", padding: { top: 16 } }}
            />
          </div>
          <div className="bg-slate-900 p-4 border-t border-gray-700 flex justify-end shrink-0 shadow-lg">
            <button 
              onClick={handleRunPublicCases}
              disabled={isExecuting}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-2 rounded text-sm font-bold transition-all border border-gray-600 flex items-center gap-2"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Running...
                </>
              ) : (
                "▶ Run Public Tests"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}