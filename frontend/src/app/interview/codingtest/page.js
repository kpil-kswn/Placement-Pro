"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

export default function InterviewPage() {
  const [problemData, setProblemData] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("vs-dark");
  const [language, setLanguage] = useState("python");
  const [editorMode, setEditorMode] = useState("standard");
  const [activeTab, setActiveTab] = useState("question");
  const [evalResult, setEvalResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch("/api/interview/coding/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: "Python developer" }),
        });

        const data = await res.json();

        if (data.error || data.detail) {
          console.error("Backend Error:", data.error || data.detail);
        }

        setProblemData(data);
        setUserCode(data.starter_code || "");
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, []);

  const executeCode = async (isSubmit) => {
    setIsEvaluating(true);
    setActiveTab("results");
    setEvalResult(null);

    try {
      const testCasesToSend = isSubmit
        ? [...problemData.public_test_cases, ...problemData.hidden_test_cases]
        : problemData.public_test_cases;

      const res = await fetch("/api/interview/coding/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: userCode,
          test_case: testCasesToSend,
          is_submit: isSubmit,
        }),
      });

      const data = await res.json();
      setEvalResult(data);
    } catch (error) {
      console.error("Execution failed:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleResetCode = () => {
    if (
      confirm(
        "Are you sure you want to reset your code to the starter template?",
      )
    ) {
      setUserCode(problemData.starter_code);
    }
  };

  const handleRunCode = () => {
    console.log("Running public test cases for:", language);
    alert("Running public test cases! (Backend integration next)");
  };

  const handleSubmitCode = () => {
    console.log("Submitting all test cases for:", language);
    alert("Submitting for final grading! (Backend integration next)");
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: "on",
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    parameterHints: { enabled: true },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    formatOnPaste: true,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-semibold text-lg">
        Generating AI Coding Assessment...
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading problem. Check your terminal.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* LEFT PANEL: Dynamic Tabs */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4">
          <button
            onClick={() => setActiveTab("question")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "question" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Problem Description
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "results" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Test Results
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-8 overflow-y-auto flex-grow">
          {/* QUESTION TAB */}
          {activeTab === "question" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{problemData.title}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200">
                  {problemData.difficulty}
                </span>
              </div>
              <div className="prose max-w-none text-gray-800">
                <ReactMarkdown>{problemData.problem_statement}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === "results" && (
            <div>
              {isEvaluating ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-pulse">
                  <svg
                    className="w-8 h-8 mb-4 text-blue-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Evaluating Code Execution...
                </div>
              ) : evalResult ? (
                <div>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-lg mb-6 flex items-center justify-between ${evalResult.status === "Passed" ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}
                  >
                    <h2
                      className={`text-xl font-bold ${evalResult.status === "Passed" ? "text-green-800" : "text-red-800"}`}
                    >
                      {evalResult.status === "Passed" ? "Accepted" : "Failed"}
                    </h2>
                    <span className="font-mono text-sm font-semibold">
                      Passed {evalResult.passed_cases} /{" "}
                      {evalResult.total_cases} Cases
                    </span>
                  </div>

                  {/* AI Critique Section (Only visible on Submit) */}
                  {evalResult.ai_critique && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 p-5 rounded-lg">
                      <h3 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
                        ✨ AI Code Review
                      </h3>
                      <div className="text-blue-800 text-sm leading-relaxed prose prose-blue">
                        <ReactMarkdown>{evalResult.ai_critique}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Console Output */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Raw Console Output:
                    </h3>
                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                      {evalResult.console_output || "No output generated."}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-10">
                  Run or Submit your code to see results here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Monaco Editor */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
        {/* EDITOR TOOLBAR */}
        <div className="flex justify-between items-center p-3 bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
          <div className="flex gap-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
            >
              <option value="vs-dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>

            {/* Editor Mode Selector */}
            <select
              value={editorMode}
              onChange={(e) => setEditorMode(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 outline-none hover:border-gray-500 transition-colors"
            >
              <option value="standard">Standard Mode</option>
              <option value="vim">Vim Mode</option>
            </select>
          </div>

          <button
            onClick={handleResetCode}
            className="hover:text-white transition-colors flex items-center gap-1"
            title="Reset to starter code"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>

        {/* MONACO EDITOR */}
        <div className="grow relative">
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={userCode}
            onChange={(value) => setUserCode(value)}
            onMount={handleEditorDidMount}
            options={editorOptions}
          />
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex justify-end gap-3 p-4 bg-gray-900 border-t border-gray-700">
          <button
            onClick={() => executeCode(false)}
            disabled={isEvaluating}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors border border-gray-600"
          >
            Run Code
          </button>
          <button
            onClick={() => executeCode(true)}
            disabled={isEvaluating}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-green-900/20"
          >
            Submit Code
          </button>
        </div>
      </div>
    </div>
  );
}
